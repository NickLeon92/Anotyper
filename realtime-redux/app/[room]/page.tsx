'use client'

import React, { useEffect, useRef, useState } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, FormText, Modal} from 'react-bootstrap'
import axios from 'axios'
import { io } from "socket.io-client";
import Link from 'next/link'



// const socket = io("http://localhost:3001")
//const socket = new WebSocket('wss://byez0nz5ij.execute-api.us-east-1.amazonaws.com/production/')

import { v4 as uuidv4 } from 'uuid';
import { setConfig } from "next/config";

const id = uuidv4()
console.log('user id: ' + id)



function Home({params}:any){
    
    let testRoomId = {}

    // const socket = new WebSocket('wss://byez0nz5ij.execute-api.us-east-1.amazonaws.com/production/')
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [mySocket, setMySocket] = useState('you are offline')
    const [loading, setLoading] = useState(true)
    const [roomExists, setRoomExists] = useState(true)
    const [roomId, setRoomId] = useState(params.room)
    const [connectedUser, setConnectedUser] = useState('waiting for user to join..')
    const [foundUser, setFoundUser] = useState(false)
    const [username, setUsername] = useState(id)
    const [message, setMessage] = useState('')
    const [inbox, setInbox] = useState('')
    const nameRef = React.useRef<string>(id)
    const roomRef = React.useRef<string>(params.room)
    const foundRef = React.useRef<boolean>(false)
    const htmlRef = React.useRef<HTMLTextAreaElement>(null)
    const [button, setButton] = useState('button')
    const [button2, setButton2] = useState('button2')

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);



    //clears outgoing message

    const sendStatus = () => {
        console.log('sending socket status to aws')
       
        sendMessage()
       function sendMessage(){
            if(socket?.readyState === 1){
                socket.send(JSON.stringify({action: "update_room", data: {room: roomId}}))
            }else{
                console.log('wating for socket to open...')
                setTimeout(() => sendMessage() , 10)
            }
        }
    }
    const clearMessage = () => {

        //set out going to empty
        setMessage('')
        //send empty string to partner
       socket?.send(JSON.stringify({action: "message_sent", message: '', toSocket: connectedUser}))
    }

    //function to call back-end matchmaker to find a match
    const goHome = async () => {

        const url = 'https://hy3e7zqkkyz34tcubr7w2gnsiy0kehsp.lambda-url.us-east-1.on.aws/'
        
        try {
            const res = await axios({
                method: 'post',
                url: url,
                data:{
                    roomId: roomId
                }
            })

            console.log(res)
        } catch (error) {
            console.log(error)
        }

       socket?.close()
       location.assign(`/`)
    }

    //enter key event listener to send message
    const enterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(e.key)
        if(e.key === 'Enter'){
            e.preventDefault()
            setMessage('')
            socket?.send(JSON.stringify({action: "message_sent", message: '', toSocket: connectedUser}))
            
        }
    }

    //key typing event listener
    const updateMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setMessage(e.target.value)

        sendMessage()

        function sendMessage(){
            if(socket?.readyState === 1){
                socket.send(JSON.stringify({action: "message_sent", message: e.target.value, toSocket: connectedUser}))
            }else{
                console.log('wating for socket to open...')
                setTimeout(() => sendMessage() , 10)
            }
        }
        // if(socket.readyState === 1){
        //     socket.send(JSON.stringify({action: "message_sent", message: e.target.value, toSocket: connectedUser}))
        // }else{
        //     console.log('socket not ready')
        //     setTimeout(() => socket.send(JSON.stringify({action: "message_sent", message: e.target.value, toSocket: connectedUser})), 1000)
        // }
    }
    const updateUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setUsername(e.target.value)
        nameRef.current = e.target.value
    }
    const sendUserName = () => {
        setButton2('button2 animateb')
        setTimeout(()=>{
            setButton2('button2')
        },2000)
        // socket.send(JSON.stringify({action: "new_username",room:roomRef.current , username:nameRef.current}))
    }

    const clipboard = () => {
        navigator.clipboard.writeText('https://www.anotype.app/' + roomRef.current);
        try{
            navigator.share({
                title:'chat with me!',
                url: 'https://www.anotype.app/' + roomRef.current
            })
        }catch(err){
            console.log(err)
        }

        
        setButton('button animate')
        setTimeout(()=>{
            setButton('button')
        },2000)
    }

    useEffect(() => {
        htmlRef.current?.scrollIntoView({block:'end'})
    }, [inbox])
    useEffect(() => {
        //instaniate websocket connection here???
        // const socket = new WebSocket('wss://byez0nz5ij.execute-api.us-east-1.amazonaws.com/production/')
        const ws = new WebSocket('wss://byez0nz5ij.execute-api.us-east-1.amazonaws.com/production/')
        setSocket(ws)
        ws.onopen = function(e) {
            console.log('socket on onopen'); 
        };

        ws.onmessage = function(event) {
            console.log(JSON.parse(event.data));
            const eventData = JSON.parse(event.data)
            switch(eventData.action){
                case "status" :
                    console.log('recieving room status')
                    console.log(eventData.data.yourSocket)
                    setMySocket(eventData.data.yourSocket)
                    if(Object.keys(eventData.data).length === 0){
                        setRoomExists(false)
                        
                    }else if(eventData.data.partnerSocket){
                        setFoundUser(true)
                        setConnectedUser(eventData.data.partnerSocket)
                    }
                    break

                case "incoming_message" :
                    console.log('incoming message')
                    setInbox(eventData.message)
                    break
                    
                case "update_username" : 
                    console.log('chat partner has updated their username')
                    break
                
                case "user_left" : 
                    setFoundUser(false)
                    console.log('chat partner has left the building')
                    break

                case "found_user" : 
                    setFoundUser(true)
                    setConnectedUser(eventData.partnerSocket)
                    console.log('chat partner has appeared')

                    break
            }
            setLoading(false)
        };
        return () => {
            ws.close();
          };
    },[])
    
    useEffect(() => {
        console.log('change in socket detected')
        console.log(socket)
        if(socket){
            sendStatus()
        }
    }, [socket])
  
    return (
        <div>
        {loading ? (
            <h3 style={{color:'white'}} id="inbox-text">loading...</h3>
        ):(
            <div>
                {roomExists ?  (     
                    <div>
                        {/* <p>my socketId: {mySocket}</p> */}
                        {/* {roomExists === 'searching'?(<div>true</div>):(<div>false</div>)} */}
                        <>
                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                    <Modal.Title style={{color:'#708ebc'}}>change my username</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <InputGroup className="mb-3">
                            <FormControl
                                onChange={updateUserName}
                                placeholder={nameRef.current}
                                aria-label="message"
                                aria-describedby="basic-addon2"
                            // onKeyDown={enterKey}
                            />
                            <Button
                            className={button2}
                            type='button'
                                onClick={sendUserName}
                                variant="outline-secondary" id="button-addon2">
                                    <div className="contentb">
                                        <div className="copy2b">
                                            
                                            <div>
                                                set username
                                            </div>
                                        </div>
                                        <div className="copiedb">set!</div>
                                    </div>
                            </Button>
                        </InputGroup>
            
                    </Modal.Body>
                    <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    </Modal.Footer>
                </Modal>
                </>
                    <Container style={{marginTop:'30px'}}>
                        
                        
                        <InputGroup style={{marginBottom:'10px', height:'90px'}}>
                            {/* <InputGroup.Text>inbox</InputGroup.Text> */}
                            {/* <Form.Control ref={htmlRef} as="textarea" value={inbox} aria-label="With textarea" disabled /> */}
                            <div id="inboxDiv">
                    <p style={{margin:'10px', padding:'10px', borderRight:'solid'}}>inbox: </p>
                    {/* <div style={{border:'solid'}}></div> */}
                    <p  id="inbox-text">
                      {inbox}
                    </p>
                </div>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <FormControl
                                // onChange={}
                                style={{height:'90px'}}
                                as="textarea"
                                placeholder="Type your message here"
                                aria-label="message"
                                aria-describedby="basic-addon2"
                                value={message}
                                onChange={updateMessage}
                                onKeyDown={enterKey}
                            // onKeyDown={enterKey}
                            />
                            <Button
                                onClick={clearMessage}
                                variant="outline-secondary" id="button-addon2">
                                return
                            </Button>
                        </InputGroup>
                        <div className="status" style={foundUser ?{color: 'green'}:{color:'red'}}>
                            {foundUser
                            ?<p>user connected: {connectedUser}</p>
                            :<p>no one else here right now..</p>}
                        </div>
                        <div className="button-group">
                            {/* <Link href={`/`}> */}
            
                                <Button
                                    onClick={goHome}
                                >leave room
                                </Button>
                            {/* </Link> */}
                            <Button variant="primary" onClick={handleShow} style={{marginLeft:'10px'}}>
                            profile
                            </Button>
                            <Button style={{marginLeft:'10px'}} onClick={clipboard} className={button} type="button" id="button" title="Copy link">
                            <div className="content">
                                <div className="copy">
                                    <svg
                                        width="13"
                                        height="13"
                                        viewBox="0 0 13 13"
                                        fill="none"
                                        className="icon"
                                        aria-hidden="true"
                                        focusable="false"
                                    >
                                        <path
                                            d="M6.0252 3.43935C5.04889 4.41567 5.04889 5.99858 6.0252 6.97489C6.28067 7.23035 6.57766 7.41897 6.89445 7.54074C6.94651 7.87999 6.89573 8.23198 6.7421 8.54639C6.22117 8.38293 5.7309 8.0948 5.3181 7.68199C3.95126 6.31516 3.95126 4.09908 5.3181 2.73225L6.73231 1.31803C8.09914 -0.0488011 10.3152 -0.0488011 11.6821 1.31803C13.0489 2.68487 13.0489 4.90095 11.6821 6.26778L10.2678 7.68199C10.0307 7.91913 9.768 8.11513 9.48861 8.26998C9.53203 7.87284 9.52024 7.4708 9.45324 7.07631C9.48982 7.04376 9.52567 7.00996 9.56074 6.97489L10.9749 5.56067C11.9513 4.58436 11.9513 3.00145 10.9749 2.02514C9.99864 1.04883 8.41573 1.04883 7.43942 2.02514L6.0252 3.43935ZM2.73939 5.32512C2.9765 5.08801 3.23916 4.89203 3.51852 4.73719C3.47511 5.13433 3.48691 5.53637 3.55392 5.93087C3.51736 5.96339 3.48154 5.99718 3.4465 6.03222L2.03228 7.44644C1.05597 8.42275 1.05597 10.0057 2.03228 10.982C3.00859 11.9583 4.59151 11.9583 5.56782 10.982L6.98203 9.56776C7.95834 8.59145 7.95834 7.00853 6.98203 6.03222C6.72654 5.77674 6.42951 5.58811 6.11268 5.46633C6.06063 5.12708 6.11141 4.7751 6.26503 4.46069C6.78601 4.62415 7.27631 4.91229 7.68914 5.32512C9.05597 6.69195 9.05597 8.90803 7.68914 10.2749L6.27492 11.6891C4.90809 13.0559 2.69201 13.0559 1.32518 11.6891C-0.0416599 10.3222 -0.04166 8.10617 1.32518 6.73933L2.73939 5.32512Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <div>
                                        invite link
                                    </div>
                                </div>
                                <div className="copied">copied!</div>
                            </div>
                            </Button>
                        </div>
                        {/* <p style={{textAlign:'center'}}>Welcome, {username}</p> */}
                    </Container>
                        
                    </div>
                ):
                (<div style={{padding:'20px'}}> 
                    <h3 style={{color:'white'}}>
                        room does not exist :/
                    </h3>
                    <Link href={'/'}>
                        <Button>
                            Go Home
                        </Button>
                    </Link>
                </div>)
                }

            </div>

        )}
        </div>
        )
}

export default Home