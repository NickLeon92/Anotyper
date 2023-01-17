'use client'

import React, { useEffect, useRef, useState } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel} from 'react-bootstrap'

import { io } from "socket.io-client";
import Link from 'next/link'



// const socket = io("http://localhost:3001")
const socket = io("https://socket-server-v2.fly.dev/")

import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)


function Home({params}:any){
    
    let testRoomId = {}

    const [roomId, setRoomId] = useState(params.room)
    const [locationData, setLocationData] = useState({})
    const [ready, setReady] = useState(false)
    const [connectedUser, setConnectedUser] = useState('waiting for user to join..')
    const [foundUser, setFoundUser] = useState(false)
    const [username, setUsername] = useState(id)
    const [message, setMessage] = useState('')
    const [inbox, setInbox] = useState('')
    const nameRef = React.useRef<string>(id)
    const roomRef = React.useRef<string>(params.room)
    const foundRef = React.useRef<boolean>(false)
    const [button, setButton] = useState('button')



    //clears outgoing message
    const clearMessage = () => {

        //set out going to empty
        setMessage('')
        //send empty string to partner
        socket.emit("send_message", {message: '', partner: roomId})
    }

    //function to call back-end matchmaker to find a match
    const goHome = () => {
        socket.emit("leave_rooms")
    }

    //enter key event listener to send message
    const enterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(e.key)
        if(e.key === 'Enter'){
            setMessage('')
            socket.emit("send_message", {message: '', partner: roomId})
        }
    }

    //key typing event listener
    const updateMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setMessage(e.target.value)
        socket.emit("send_message", {message: e.target.value, partner: roomId})
    }
    const updateUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setUsername(e.target.value)
    }

    const clipboard = () => {
        navigator.clipboard.writeText('https://realtime-redux-nickleon92.vercel.app/' + roomRef.current);
        setButton('button animate')
        setTimeout(()=>{
            setButton('button')
        },2000)
    }

    useEffect(() => {
        console.log('message recieved')
        socket.on("incoming_message", (data) => {
            // findRoom()
            setInbox(data)
        })
        socket.on("room_destroy", (alert) => {
            console.log(locationData)
            console.log(alert)
            setMessage('')
            setInbox('')
            setConnectedUser(alert)
            setFoundUser(false)
            // socket.emit("leave_rooms")
        })

        socket.on("query_status", () => {
            // setConnectedUser('waiting for user to join..')
            console.log('found user? '+foundUser)
            if(foundRef.current === true){
                console.log('rechecking if partner still online')
                setFoundUser(false)
                setConnectedUser('no one here right now..')
            }
            console.log(`relaying room status: ${roomRef.current} and name status: ${nameRef.current}`)
            socket.emit("return_status", {username: nameRef.current, room: roomRef.current})
        })
        socket.on("wave", (name) => {
            setConnectedUser(name)
            setFoundUser(true)
            foundRef.current = true
            console.log(`sending back username: ${nameRef.current}`)
            socket.emit("wave_back", {username: nameRef.current, room: roomRef.current})
        })
        socket.on("update_username", (name) => {
            setConnectedUser(name)
            setFoundUser(true)
        })
        console.log(inbox)
    },[socket])
    

    return (
        <div>
          <Container style={{marginTop:'30px'}}>
            {/* <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Username:</Form.Label>
                    <FormControl 
                        type="text" 
                        placeholder={id}
                        onChange={updateUserName}
                    />
                    <Form.Text className="text-muted">
                        Enter any username :)
                    </Form.Text>
                </Form.Group>
            </Form> */}
            <p>your user ID: {id}</p>
            <p>Room ID: {roomId}</p>
            <p style={foundUser ?{color: 'green'}:{color:'red'}}>
                Connected username: {connectedUser}
            </p>
            <div className="button-group">
                <Link href={`/`}>

                    <Button
                        onClick={goHome}
                    >leave private room
                    </Button>
                </Link>
                <Button style={{marginLeft:'20px'}} onClick={clipboard} className={button} type="button" id="button" title="Copy link">
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
                            copy chatroom link
                        </div>
                    </div>
                    <div className="copied">Copied!</div>
                </div>
                </Button>
            </div>
               
                
                <InputGroup className="mb-3">
                    <FormControl 
                        type="text" 
                        placeholder="Enter message" 
                        value={message}
                        onChange={updateMessage}
                        onKeyDown={enterKey}
                    />
                </InputGroup>
                <Button onClick={clearMessage}>new message (Enter)</Button>
                <div className="message-box" style={{marginTop:'10px'}}>
                    <p className="message-header">inbox:</p>
                    <p>{inbox}</p>
                </div>
                <div className="message-box">
                    <p className="message-header">sent:</p>
                    <p>{message}</p>
                </div>

          </Container>
            
        </div>
        )
}

export default Home