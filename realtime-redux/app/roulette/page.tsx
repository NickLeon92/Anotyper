'use client'

import test from "node:test";
import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'
import Toast from 'react-bootstrap/Toast';
import Link from 'next/link'

import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)

function Home(){

    // const socket = new WebSocket('wss://byez0nz5ij.execute-api.us-east-1.amazonaws.com/production/')

    const [socket, setSocket] = useState<WebSocket | null>(null);


    const [roomId, setRoomId] = useState('')
    const [locationData, setLocationData] = useState({})
    const [ready, setReady] = useState(false)
    const [connectedUser, setConnectedUser] = useState('looking for chatter..')
    const [foundUser, setFoundUser] = useState(false)
    const [username, setUsername] = useState(id)
    const [message, setMessage] = useState('')
    const [inbox, setInbox] = useState('')
    const [show, setShow] = useState(false);
    const nameRef = React.useRef<string>(id)
    const roomRef = React.useRef<string>(roomId)
    const [button2, setButton2] = useState('button2')
    const [show2, setShow2] = useState(false);
    const htmlRef = React.useRef<HTMLTextAreaElement>(null)

    const handleClose = () => setShow2(false);
    const handleShow = () => setShow2(true);

    //callback for success/err functions for geolocation attempt (done automatically)
    const success = (data: { coords: { latitude: any; longitude: any; }; }) => {

        console.log("location data:")
        console.log(data.coords)
        
        // testRoomId = { latitude: data.coords.latitude, longitude: data.coords.longitude, userId: id, username: username }
        setReady(true)
        
        //set location data for back-end matchmaker
        setLocationData({ latitude: data.coords.latitude, longitude: data.coords.longitude, userId: id})

    }
    const error = (error: any) => {
        console.log(error)
        window.alert(error)
    }

    const sendStatus = async () => {

        sendMessage()

        function sendMessage(){
            if(socket?.readyState === 1){
                socket.send(JSON.stringify({action: "roulette_room_handler", type: 'new'}))
            }else{
                console.log('wating for socket to open...')
                setTimeout(() => sendMessage() , 10)
            }
        }
    }


    //clears outgoing message
    const clearMessage = () => {

        //set out going to empty
        setMessage('')
        //send empty string to partner
        socket?.send(JSON.stringify({action: "message_sent", message: '', toSocket: connectedUser}))
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
        // socket.send(JSON.stringify({action: "message_sent", message: e.target.value, toSocket: connectedUser}))

        sendMessage()

        function sendMessage(){
            if(socket?.readyState === 1){
                socket.send(JSON.stringify({action: "message_sent", message: e.target.value, toSocket: connectedUser}))
            }else{
                console.log('wating for socket to open...')
                setTimeout(() => sendMessage() , 10)
            }
        }
    }
    const updateUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        nameRef.current = e.target.value
        setUsername(e.target.value)
    }

    const goHome = async () => {
        socket?.close()
        location.assign(`/`)
    }

    async function newChatter() {
        setFoundUser(false)
        setConnectedUser('looking for new chatter..')
        socket?.send(JSON.stringify({action: "roulette_room_handler", type: 'reroll', oldSocket: connectedUser}))
    }


    useEffect(() => {
        const ws = new WebSocket('wss://byez0nz5ij.execute-api.us-east-1.amazonaws.com/production/')
        setSocket(ws)
        ws.onopen = function(e) {
            console.log('socket connection open'); 
            // sendStatus()
        };
        ws.onmessage = function(event) {
            console.log(JSON.parse(event.data));
            const eventData = JSON.parse(event.data)
            switch(eventData.action){
                case "status" :
                    console.log('recieving room status')
                    setFoundUser(true)
                    setConnectedUser(eventData.partnerSocket)
                case "incoming_message" :
                    console.log('incoming message')
                    setInbox(eventData.message)
                    break
                case "found_user" :
                    console.log('partner has been found')
                    setFoundUser(true)
                    setConnectedUser(eventData.partnerSocket)
                    break
                case "user_left" :
                    console.log('partner has been found')
                    setFoundUser(false)
                    setConnectedUser('looking for new chatter..')
                    break
                case "incoming_message" :
                    console.log('incoming message')
                    setInbox(eventData.message)
                    break           
            }
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

    // useEffect(() => {
    //     navigator.geolocation.getCurrentPosition(success, error)
    // },[])
    useEffect(() => {
        htmlRef.current?.scrollIntoView({block:'end'})
    }, [inbox])


    return (
        <div>
          <Container style={{marginTop:'30px'}}>
            <>
        <Modal show={show2} onHide={handleClose}>
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
                    // onClick={sendUserName}
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
    <InputGroup  style={{marginBottom:'10px', height:'90px'}}>
                {/* <InputGroup.Text>inbox</InputGroup.Text> */}
                <div id="inboxDiv">
                    <p style={{margin:'10px', padding:'10px', borderRight:'solid'}}>inbox: </p>
                    {/* <div style={{border:'solid'}}></div> */}
                    <p style={{margin:'10px', padding:'10px'}} id={foundUser ?'inbox-text':'noneee'}>
                      {inbox}
                    </p>
                </div>
                {/* <Form.Control ref={htmlRef} as="textarea" value={inbox} aria-label="With textarea" disabled /> */}
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
            <p id={foundUser ?'noneee':'inbox-text'} style={foundUser ?{color: 'green'}:{color:'red'}}>
                connected user: {connectedUser}
            </p>
           

                <Button 
                style={{marginBottom:'20px'}}
                onClick={goHome}
                >Go Home
                </Button> 

                <Button 
                style={{marginBottom:'20px'}}
                onClick={newChatter}
                >find new chatter
                </Button>
       
                <Button variant="primary" onClick={handleShow} style={{marginLeft:'10px', marginBottom:'20px'}}>
                profile
                </Button>
            
                

          </Container>
            
        </div>
        )
}

export default Home