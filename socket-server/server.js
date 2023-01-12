const express = require('express')
const {Server} = require('socket.io')
const { createServer } = require("http");
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const PORT = process.env.PORT || 3001



const app = express();
app.use(cors({
    origin: '*'
}));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*'
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

app.get('/', (req,res) => {
  res.send('socket server online')
})


io.on("connection", (socket) => {
  // socket.disconnect()
  // socket.join("chat")
  // socket.to("chat").emit("test", "testinggg")
  console.log("newly connected socket ID: " + socket.id)

  socket.on("join_room", (data) => {
    for(let room of socket.rooms){
      if(room !== socket.id){
        socket.to(room).emit("room_destroy", "user disconnected")
        socket.leave(room)
      }
    }
    let chatRoom

    const findMatch = (data, socket) => {
      return findAnyMatch(data, socket)
     //return findDistanceMatch(data, socket)
      function findDistanceMatch(data, socket){
        let totalDistance = 0 
        const xDistance = data.latitude - socketPair.socketA.latitude
        const yDistance = data.longitude - socketPair.socketA.longitude

        if(xDistance !== 0 && yDistance !== 0 ){
          console.log(xDistance, " : " ,yDistance)
          totalDistance = Math.sqrt((xDistance * xDistance) + (yDistance * yDistance))
        }


        console.log(`total distance: ${totalDistance}`)

        if(totalDistance < 3){
          socket.join(socketPair.socketA.room)
          io.to(socketPair.socketA.room).emit("chat_room_id",  socketPair.socketA.room)
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
      function findAnyMatch(data, socket){
        socket.join(socketPair.socketA.room)
        io.to(socketPair.socketA.room).emit("chat_room_id",  socketPair.socketA.room)
        return {
          socketId: socket.id,
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          room: socketPair.socketA.room
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
        io.to(roomID).emit("chat_room_id", roomID)
        
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
          socketPair.socketA = {}
          socketPair.socketB = {}
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

  socket.on("leave_room", () => {
    // socket.leave(room)
    for(let room of socket.rooms){
      if(room !== socket.id){
        socket.to(room).emit("room_destroy", "user disconnected")
        socket.leave(room)
      }
    }
  })

  socket.on("send_message", (data) => {
    console.log("message data: ")
    console.log(data)

    socket.to(data.partner).emit("incoming_message", data.message)
    // socket.to("chat").emit("test_message", "yo this is a test")
  })

  socket.on("disconnecting", () => {
    console.log("disconnected socket ID: " + socket.id)
    console.log(socket.rooms)
    for(let room of socket.rooms){
      
      if(room !== socket.id){
        socket.to(room).emit("room_destroy", "user disconnected")
        socket.leave(room)
      }
    }
  })
});

httpServer.listen(PORT, () => console.log(`server listening on port: ${PORT}`));