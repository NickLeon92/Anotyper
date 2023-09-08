'use client'

import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'
import axios from "axios";


import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)

function Home({params} : any ){

   
useEffect(() => {
  const getCode = async () => {

    const code = params.code

    const clientId = '1149605835580915752'
    const clientSecret = 'pR1mdlbvlOlKIIQuha-btwMAbxehnx-O'

    if (code) {
      try {
        const response = await axios.post('https://discord.com/api/oauth2/token', null, {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'http://localhost:3000/auth/',
            scope: 'identify', // Adjust scopes based on your app's requirements
          },
        });

        const accessToken = response.data.access_token;
        // Save the accessToken in your app's state or local storage for future use

        // Redirect to the desired page after successful login
        console.log(accessToken)
      
      } catch (error) {
        console.error('Error exchanging code for access token:', error);
      }
    }
  };

  getCode();
},[])

    return (
        <div id="inbox-text">
         logging in .. 
        </div>
        )
}

export default Home