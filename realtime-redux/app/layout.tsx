/* eslint-disable @next/next/no-head-element */
// 'use client'
import "bootstrap/dist/css/bootstrap.min.css";
import {Button} from 'react-bootstrap'
import axios from 'axios'
export default async function RootLayout({children}: {children: React.ReactNode}) {

  const getData = async () => {
    try {
      const res = await axios({
        method: 'get',
        url: 'https://random-data-api.com/api/beer/random_beer'
      })
      
      return res.data

    } catch (error) {
      console.log(error)
    }
  }

  const data = await getData()

  console.log(data)


  return (
    <html>
      <head></head>
      <body>
       

          {children}
          
      </body>
    </html>
  );
}
