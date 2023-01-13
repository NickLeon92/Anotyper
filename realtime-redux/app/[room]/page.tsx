'use client'

import React, { useEffect, useState } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel} from 'react-bootstrap'

import { io } from "socket.io-client";
import Link from 'next/link'



// const socket = io("http://localhost:3001")
const socket = io("https://redux-socket-server.fly.dev/")

import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)


function Home({params}:any){
    
    let testRoomId = {}

    const [roomId, setRoomId] = useState(params.room)
    const [locationData, setLocationData] = useState({})
    const [ready, setReady] = useState(false)
    const [connectedUser, setConnectedUser] = useState('no user connected')
    const [foundUser, setFoundUser] = useState(false)
    const [username, setUsername] = useState(id)
    const [message, setMessage] = useState('')
    const [inbox, setInbox] = useState('')

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

    useEffect(() => {
        console.log('message recieved')
        socket.on("incoming_message", (data) => {
            // findRoom()
            setInbox(data)
        })
        socket.on("chat_room_id", (data) => {
            console.log("room id from server:")
            console.log(data)
            setRoomId(data)
        })
        socket.on("test", (data)=>{
            console.log(data)
        })
        socket.on("test_message", (data) => {
            setInbox(data)
        })
        socket.on("room_destroy", (data) => {
            console.log(locationData)
            console.log(data)
            setMessage('')
            setInbox('')
            socket.emit("leave_room")
            setRoomId('user disconnected')
            setConnectedUser('no user connected')
            setFoundUser(false)
        })
        socket.on("connected_users",(data) => {
            console.log(data)
            setConnectedUser('looking for someone to chat with..')
            for(let user in data){
                console.log(`is ${user} equal to ${id}`)
                if(user !== id){
                    setConnectedUser(data[user])
                }
            }
            if(Object.keys(data).length > 1){
                setFoundUser(true)
            }
        })
        socket.on("welcome", (data) => {
            setConnectedUser(data)
            setFoundUser(true)
        })
        console.log(inbox)
    },[socket])
    

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(success, error)
        socket.emit("join_private_room", {roomId, username})
    },[])

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
            <Link href={`/`}>
        
                <Button 
                style={{marginBottom:'20px'}}
                onClick={goHome}
                >leave private room
                </Button>
          </Link>
                
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