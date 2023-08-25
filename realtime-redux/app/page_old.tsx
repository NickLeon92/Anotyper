'use client'

import test from "node:test";
import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'
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
        // setRoomId(privateRoom)
        // socket.emit("create_private_room", {privateRoom,username})
        // location.assign(`/${privateRoom}`)
    }

    //enter key event listener to send message
    const enterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
        console.log(e.key)
        if(e.key === 'Enter'){
            e.preventDefault()
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
    const sendUserName = () => {
        setButton2('button2 animateb')
        setTimeout(()=>{
            setButton2('button2')
        },2000)
        socket.emit("new_username", {room:roomRef.current , username:nameRef.current})
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
            setConnectedUser(err)
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
            console.log('relaying status: ' + roomRef.current)
            socket.emit("return_status", roomRef.current)
        })
        socket.on("update_username", (name) => {
            setConnectedUser(name)
            setFoundUser(true)
        })
        // console.log(inbox)
    },[socket])
    

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(success, error)
    },[])
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
    <InputGroup style={{marginBottom:'10px', height:'90px'}}>
                <InputGroup.Text>inbox</InputGroup.Text>
                <Form.Control ref={htmlRef} as="textarea" value={inbox} aria-label="With textarea" disabled />
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
            <p style={foundUser ?{color: 'green'}:{color:'red'}}>
                connected username: {connectedUser}
            </p>
            
                <Button 
                style={{marginBottom:'20px'}}
                onClick={findRoom}
                >find chatter
                </Button>
                <Link href={`/${privateRoom}`}>
                    <Button 
                    style={{marginBottom:'20px', marginLeft:'10px'}}
                    onClick={createPrivateRoom}
                    >DM Room
                    </Button>
                </Link>
                <Button variant="primary" onClick={handleShow} style={{marginLeft:'10px', marginBottom:'20px'}}>
                profile
                </Button>
            
                

          </Container>
            
        </div>
        )
}

export default Home