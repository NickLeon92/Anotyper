'use client'

import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'
import axios from "axios";


import { v4 as uuidv4 } from 'uuid';


function Home({params} : any ){

   
useEffect(() => {
  const getCode = async () => {

    const code = params.code

    const clientId = '1149605835580915752'
    const clientSecret = 'pR1mdlbvlOlKIIQuha-btwMAbxehnx-O'

    console.log('getting code')
    console.log(params.code)

    if (code) {
      try {
        // const response = await axios.post('https://discord.com/api/oauth2/token', null, {
        //   params: {
        //     client_id: clientId,
        //     client_secret: clientSecret,
        //     grant_type: 'authorization_code',
        //     code: code,
        //     redirect_uri: 'https://www.anotype.app/auth',
        //     scope: 'identify', // Adjust scopes based on your app's requirements
        //   },
        // });
        const response = await axios({
            method: 'post',
            url: 'https://discord.com/api/oauth2/token',
            data: {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
               // redirect_uri: 'https://www.anotype.app/auth',
                scope: 'identify', // Adjust scopes based on your app's requirements
            }
        })

        const accessToken = response.data.access_token;
        // Save the accessToken in your app's state or local storage for future use


        // Set the cookie with a name, value, and optional options (like expiration date)
        document.cookie = `access_token=${accessToken}; expires=Thu, 01 Jan 2024 00:00:00 UTC; path=/`;
        localStorage.setItem('key', accessToken)


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