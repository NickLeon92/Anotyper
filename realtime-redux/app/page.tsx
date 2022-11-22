'use client'

import React, { useEffect, useState } from "react";
import {Form, InputGroup, FormControl, Button, Container} from 'react-bootstrap'

import { io } from "socket.io-client";



const socket = io("http://localhost:3001")

import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)


function Home(){

    const [roomId, setRoomId] = useState('')

    const success = (data) => {

        console.log("location data:")
        console.log(data.coords)

        socket.emit("send_location", { latitude: data.coords.latitude, longitude: data.coords.longitude, userId: id })
    }
    const error = (error) => {
        console.log(error)
    }


    const [message, setMessage] = useState('')

    const [inbox, setInbox] = useState('')

    const clearMessage = () => {
        setMessage('')
        // console.log(`sending message: ${message}`)
        socket.emit("send_message", {message: '', partner: roomId})
    }

    const enterKey = (e: KeyboardEvent<HTMLInputElement>) => {
        console.log(e.key)
        if(e.key === 'Enter'){
            setMessage('')
            socket.emit("send_message", {message: '', partner: roomId})
        }
    }

    const updateMessage = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setMessage(e.target.value)
        socket.emit("send_message", {message: e.target.value, partner: roomId})
    }

    useEffect(() => {
        console.log('message recieved')
        socket.on("incoming_message", (data) => {
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
        console.log(inbox)
    },[socket])
    

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(success, error)
    },[])

    return (
        <div>
          <Container style={{marginTop:'10px'}}>
            kill me
                <InputGroup className="mb-3">
                    <FormControl 
                        type="text" 
                        placeholder="Enter message" 
                        value={message}
                        onChange={updateMessage}
                        onKeyDown={enterKey}
                    />
                </InputGroup>
                <Button onClick={clearMessage}>clear message</Button>
            <p>outgoing message: {message}</p>

            <p>Incoming Message: {inbox}</p>
          </Container>
            
        </div>
        )
}

export default Home