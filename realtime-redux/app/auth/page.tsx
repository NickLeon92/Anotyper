'use client'

import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'
import axios from "axios";
import Link from 'next/link'

import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)

function Home(){

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