'use client'

import test from "node:test";
import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'
import Toast from 'react-bootstrap/Toast';
import Link from 'next/link'

import axios from 'axios'

// const socket = io("http://localhost:3001")
// const socket = io("https://next-js-production.up.railway.app/")

import { v4 as uuidv4 } from 'uuid';



function Home(){

    
    
    //name of joined room
    const [roomId, setRoomId] = useState('')
    //saved location data

    const [username, setUsername] = useState('default skin')
    
    const [show, setShow] = useState(false);

    const [button2, setButton2] = useState('button2')
    const [show2, setShow2] = useState(false);
    const htmlRef = React.useRef<HTMLTextAreaElement>(null)

    const handleClose = () => setShow2(false);
    const handleShow = () => setShow2(true);

    const clientId = '1149605835580915752';
    const redirectUri = 'http://localhost:3000/auth';
    const scope = 'identify';

    async function handleLogin() {
        window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`
    }

    const updateUserName = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
       // nameRef.current = e.target.value
        setUsername(e.target.value)
    }
    
    const createPrivateRoom = async () => {

        // const url = 'https://api.punkapi.com/v2/beers/random'
        const url = 'https://fuk5r46wsm7ig5zipcejldx6ka0ivdzk.lambda-url.us-east-1.on.aws/'
        
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
        // window.alert('kys')

        location.assign(`/${roomId}`)
    }


    //enter key event listener to send message

    useEffect(() => {
        setRoomId(uuidv4())
    },[])

    

    return (
        <div>
            <Container style={{ marginTop: '30px' }}>
                <>
                    <Modal show={show2} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: '#708ebc' }}>change my username</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <InputGroup className="mb-3">
                                <FormControl
                                    onChange={updateUserName}
                                    // placeholder={nameRef.current}
                                    placeholder={username}
                                    aria-label="message"
                                    aria-describedby="basic-addon2"
                                // onKeyDown={enterKey}
                                />

                            </InputGroup>

                        </Modal.Body>
                        <Modal.Footer>
                        <Button variant="secondary" onClick={handleLogin}>
                                login
                            </Button>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </>


                <Link href={'/roulette'}>
                    <Button
                        style={{ marginBottom: '20px' }}
                    >find chatter
                    </Button>
                </Link>

                {/* <Link href={`/${roomId}`}> */}
                    <Button
                        style={{ marginBottom: '20px', marginLeft: '10px' }}
                        onClick={createPrivateRoom}
                    >DM Room
                    </Button>
                {/* </Link> */}

                <Button variant="primary" onClick={handleShow} style={{ marginLeft: '10px', marginBottom: '20px' }}>
                    profile
                </Button>
                {/* <p>
                    {roomId}
                </p> */}



            </Container>

        </div>
        )
}

export default Home