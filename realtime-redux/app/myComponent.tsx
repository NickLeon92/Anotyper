// 'use client'

import React from 'react'

type PageProps = {
    params: {
        count: number
    }
}

export default function myComponent(obj: PageProps){

    console.log('component data: ', obj)

    return(
        <div>
            feed me data 
        </div>
    )
}