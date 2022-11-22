const express = require('express')
const {Server} = require('socket.io')
const { createServer } = require("http");
const { v4: uuidv4 } = require('uuid');

const PORT = 3001



const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});


const bodyParser = require('body-parser');
const e = require('express');
app.use(
bodyParser.urlencoded({
extended: true,
})
)

app.use(bodyParser.json())

const socketPair = {
  socketA: {},
  socketB: {}
}


io.on("connection", (socket) => {
  // socket.disconnect()
  // socket.join("chat")
  // socket.to("chat").emit("test", "testinggg")
  console.log("newly connected socket ID: " + socket.id)

  socket.on("send_location", (data) => {

    let chatRoom

    const findMatch = (data, socket) => {
      if(socketPair.socketB){
        if(data.userId === socketPair.socketB.userId){
          socket.join(socketPair.socketB.room)
          socket.emit("chat_room_id", socketPair.socketA.room)
          return socketPair.socketB
        }
      }
      
      if(data.userId === socketPair.socketA.userId){
        socket.join(socketPair.socketA.room)
        return {}
      }
      else{

        let totalDistance = 0 
        const xDistance = data.latitude - socketPair.socketA.latitude
        const yDistance = data.longitude - socketPair.socketB.longitude

        if(xDistance !== 0 && yDistance !== 0 ){
          totalDistance = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance))
        }


        console.log(`total distance: ${totalDistance}`)

        if(totalDistance < 3){
          socket.join(socketPair.socketA.room)
          socket.emit("chat_room_id", socketPair.socketA.room)
          return {
            socketId: socket.id,
            userId: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            room: socketPair.socketA.room
            // socketData: socket
          }
        }
        else{
          return {}
        }
      }
    }

    console.log("location data: ")
    console.log(data)
    if(Object.keys(socketPair.socketB).length === 0){
      console.log('socketB empty')
      if(Object.keys(socketPair.socketA).length === 0){
        console.log('setting socketA val')

        const roomID = uuidv4()
        chatRoom = roomID

        console.log(roomID)

        socket.join(roomID)
        socket.to(socket.id).emit("chat_room_id", roomID)
        
        socketPair.socketA = {
          socketId: socket.id,
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          room: roomID
        }
      }
      else{
        console.log("return of matching function:")
        const match = findMatch(data, socket)

        console.log(match)
        socketPair.socketB = match
        if(Object.keys(match).length > 0){
          console.log(socketPair)
          
          // console.log(`to socketA: ${socketPair.socketB.socketId} to socketB: ${socketPair.socketA.socketId}`)
          // socket.to(socketPair.socketA.room).emit("chat_room_id", socketPair.socketA.room)
          // socket.to(socketPair.socketB.socketId).emit("chat_room_id", socketPair.socketA.socketId)
          // socketPair.socketA = {}
          // socketPair.socketB = {}
        }
      }
    }

    // console.log(socketPair)

  })

  

  socket.on("send_message", (data) => {
    console.log("message data: ")
    console.log(data)

    socket.to(data.partner).emit("incoming_message", data.message)
    // socket.to("chat").emit("test_message", "yo this is a test")
  })

  socket.on("disconnect", () => console.log("disconnected socket ID: " + socket.id))
});

httpServer.listen(PORT, () => console.log(`server listening on port: ${PORT}`));