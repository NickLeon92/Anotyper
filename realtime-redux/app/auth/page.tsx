'use client'

import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'
import axios from "axios";


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
      
      // Check if the cookie starts with the name "access_token"
      if (cookie.startsWith('access_token=')) {
        // Extract and return the access token value
        console.log( cookie.substring('access_token='.length, cookie.length) )
      }
    }

    // If the cookie doesn't exist, return null or handle it as needed
    


    }


    return (
        <div>
          <Button
          >
            click me to go home
          </Button>
          <Button
          onClick={logToken}
          >
            log token
          </Button>
        </div>
        )
}

export default Home