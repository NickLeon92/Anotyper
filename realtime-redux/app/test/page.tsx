'use client'

import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'


import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)

function Home(){

    const [socket, setSocket] = useState<WebSocket | null>(null);

    async function clickHandler(){
        socket?.send(JSON.stringify({action: 'test', message: 'DUN DUN DUN young fly on the track'}))
    }

    const sendStatus = () => {
        // socket?.send(JSON.stringify({action: "test", message: 'no lol'}))

        sendMessage()

        function sendMessage(){
            if(socket?.readyState === 1){
                socket.send(JSON.stringify({action: "test", message: 'no lol'}))
            }else{
                console.log('wating for socket to open...')
                setTimeout(() => sendMessage() , 10)
            }
        }
    
    }
    

    useEffect(() => {
       const ws =  new WebSocket('wss://byez0nz5ij.execute-api.us-east-1.amazonaws.com/production/')
        setSocket(ws)
        ws.onopen = function(e) {
            console.log('socket connection open'); 
            // sendStatus()
        };
        ws.onmessage = function(e) {
            console.log('incoming message:'); 
            console.log(JSON.parse(e.data));
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
          <Button
          onClick={clickHandler}
          >
            click me
          </Button>
        </div>
        )
}

export default Home