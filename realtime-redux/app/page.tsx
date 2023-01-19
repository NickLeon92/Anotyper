'use client'

import test from "node:test";
import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer} from 'react-bootstrap'
import Toast from 'react-bootstrap/Toast';
import Link from 'next/link'

import { io } from "socket.io-client";

// const socket = io("http://localhost:3001")
const socket = io("https://next-js-production.up.railway.app/")

import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)

function Home(){

    //name of joined room
    const [roomId, setRoomId] = useState('')
    const [roomStatus, setRoomStatus] = useState('no room joined')
    //saved location data
    const [locationData, setLocationData] = useState({})

    const [ready, setReady] = useState(false)
    const [connectedUser, setConnectedUser] = useState('no user connected')
    const [foundUser, setFoundUser] = useState(false)
    const [username, setUsername] = useState(id)
    const [message, setMessage] = useState('')
    const [inbox, setInbox] = useState('')
    const [show, setShow] = useState(false);
    const nameRef = React.useRef<string>(id)
    const roomRef = React.useRef<string>(roomId)

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
    const findRoom = () => {
        socket.emit('leave_rooms')
        setInbox('')
        setMessage('')
        setFoundUser(false)
        const payload = {...locationData, username:username}
        if(ready){
            socket.emit("join_room", payload)
        }
        else{
            window.alert('you need to wait for location data to come back')
        }
    }
    const privateRoom = `PR-${uuidv4()}`
    const createPrivateRoom = () => {
        // window.alert('link copied to clipboard')
        socket.emit('leave_rooms')
        setShow(true)
        setInbox('')
        setMessage('')
        setFoundUser(false)
        setConnectedUser('waitng for user to join..')
        const privateRoom = `PR-${uuidv4()}`
        roomRef.current = privateRoom
        navigator.clipboard.writeText('https://realtime-redux-nickleon92.vercel.app/' + privateRoom);
        setRoomId(privateRoom)
        // socket.emit("create_private_room", {privateRoom,username})
        location.assign(`/${privateRoom}`)
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
        nameRef.current = e.target.value
        setUsername(e.target.value)
    }

    useEffect(() => {
        console.log(`welcome ${username}`)
        // console.log('message recieved')
        socket.on("incoming_message", (data) => {
            // findRoom()
            setInbox(data)
        })
        socket.on("chat_room_id", (data) => {
            console.log("room id from server:")
            console.log(data)
            setRoomId(data)
            roomRef.current = data
        })
        socket.on("test", (data)=>{
            console.log(data)
        })
        socket.on("test_message", (data) => {
            setInbox(data)
        })
        socket.on("room_destroy", (err) => {
            console.log(locationData)
            console.log(err)
            setMessage('')
            setInbox('')
            socket.emit("leave_rooms")
            setRoomId('')
            setRoomStatus(err)
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
        socket.on("invitee_connected", (data) => {
            let me = nameRef.current
            let room = roomRef.current
            setConnectedUser(data)
            setFoundUser(true)
            socket.emit("greet_invitee", {username: me, room:room})
        })
        socket.on("query_status", () => {
            console.log('relaying status')
            socket.emit("ping_status", roomRef.current)
        })
        // console.log(inbox)
    },[socket])
    

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(success, error)
    },[])


    return (
        <div>
          <Container style={{marginTop:'30px'}}>
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>your username:</Form.Label>
                    <FormControl 
                        type="text" 
                        placeholder={id}
                        onChange={updateUserName}
                    />
                    <Form.Text className="text-muted">
                        enter any username :)
                    </Form.Text>
                </Form.Group>
            </Form>
            <p>Room ID: {roomId === ''?roomStatus:roomId}</p>
            <p style={foundUser ?{color: 'green'}:{color:'red'}}>
                connected username: {connectedUser}
            </p>
            
                <Button 
                style={{marginBottom:'20px'}}
                onClick={findRoom}
                >find random chatter
                </Button>
                <Link href={`/${privateRoom}`}>
                <Button 
                style={{marginBottom:'20px', marginLeft:'20px'}}
                // onClick={createPrivateRoom}
                >create private room
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
                <Button onClick={clearMessage}>clear textbox (Enter)</Button>
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