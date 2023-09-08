'use client'

import React, { useEffect, useState, useRef } from "react";
import {Form, InputGroup, FormControl, Button, Container, FormLabel, ToastContainer, Modal} from 'react-bootstrap'


import { v4 as uuidv4 } from 'uuid';

const id = uuidv4()
console.log('user id: ' + id)

function Home(){

   


    return (
        <div>
          <Button
          >
            click me to go home
          </Button>
        </div>
        )
}

export default Home