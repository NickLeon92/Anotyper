'use client'

import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'
import axios from "axios";
import Link from 'next/link'
import { useRouter } from 'next/router';


import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)

function Home(){

  const router = useRouter();
    const { query } = router;
  
    // Access query parameters here
    const param1 = query.param1;

    async function logToken() {
      

      const cookies = document.cookie.split(';');

      console.log('looking for cookie with name access_token')
  
    // Loop through all cookies to find the one you're looking for
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();

      console.log(cookie)
      
      // Check if the cookie starts with the name "access_token"
      if (cookie.startsWith('access_token=')) {
        // Extract and return the access token value
        console.log('FOUND')
        console.log( cookie.substring('access_token='.length, cookie.length) )
      }
    }

    // If the cookie doesn't exist, return null or handle it as needed
    console.log(localStorage.getItem('key'))


    }

    async function createToken(){
      document.cookie = `access_token=test_cookie; expires=Thu, 01 Jan 2024 00:00:00 UTC; path=/`
      localStorage.setItem('key', 'abc')
    }

    useEffect(() => {
      const getCode = async () => {
    
        const code = param1
    
        const clientId = '1149605835580915752'
        const clientSecret = 'pR1mdlbvlOlKIIQuha-btwMAbxehnx-O'
    
        console.log('getting code')
        console.log(code)
    
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
                   redirect_uri: 'https://www.anotype.app/auth',
                    scope: 'identify', // Adjust scopes based on your app's requirements
                }
            })
    
            const accessToken = response.data.access_token;
            // Save the accessToken in your app's state or local storage for future use
    
    
            // Set the cookie with a name, value, and optional options (like expiration date)
            document.cookie = `access_token=${accessToken}; expires=Thu, 01 Jan 2024 00:00:00 UTC; path=/`;
            // localStorage.setItem('key', accessToken)
    
    
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
        <div>
          <Link href={'/'}>
                        <Button>
                            Go Home
                        </Button>
                    </Link>
          <Button
          onClick={logToken}
          >
            log token
          </Button>
          <Button
          onClick={createToken}
          >
            create test token
          </Button>
        </div>
        )
}

export default Home