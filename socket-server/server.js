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
  // if(socket.rooms.lenghth < 2){
    
  // }
  console.log("connected socket ID: " + socket.id)
  io.to(socket.id).emit("query_status")

  socket.on("return_status", async ({username, room}) => {
    console.log(`user's displayed room: ${room}`)
    console.log(`user's displayed name: ${username}`)
    if(room){
      if(room !== ''){
        if(room[0]+room[1] !== 'PR'){
          console.log(`Connected user no longer available. Disconnecting socket: ${socket.id} from room: ${room}`)
          io.to(socket.id).emit("room_destroy", "you disconnected there..")
        }
        else{
          console.log(`joining socket: ${socket.id} to room: ${room}`)
          socket.join(room)
          socket.to(room).emit("wave", username)
        }
      }
    }
  })
  
  socket.on("wave_back", ({username, room}) => {
    console.log(`forwarding hello from user: ${username}`)
    socket.to(room).emit("update_username", username)
  })

  socket.on("new_username", ({room, username}) => {
    console.log(`relaying new name ${username} to room ${room}`)
    socket.to(room).emit("update_username", username)
  })

  socket.on("join_room", (data) => {
    for(let room of socket.rooms){
      if(room !== socket.id){
        socket.to(room).emit("room_destroy", "user disconnected")
        socket.leave(room)
      }
    }
    let chatRoom

    const findMatch = (data, socket) => {
      if(socket.id === socketPair.socketA.socketId){
        return {}
      }
      else{
        return findAnyMatch(data, socket)
       //return findDistanceMatch(data, socket)
      }



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
          const userPayload = {}
          userPayload[socketPair.socketA.userId] = socketPair.socketA.username
          userPayload[data.userId] = data.username
          io.to(socketPair.socketA.room).emit("connected_users", userPayload)
          return {
            socketId: socket.id,
            userId: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            room: socketPair.socketA.room,
            username: data.username
          }
        }
        else{
          return {}
        }
      }

      function findAnyMatch(data, socket){
        socket.join(socketPair.socketA.room)
        io.to(socketPair.socketA.room).emit("chat_room_id",  socketPair.socketA.room)
        const userPayload = {}
        userPayload[socketPair.socketA.userId] = socketPair.socketA.username
        userPayload[data.userId] = data.username
        io.to(socketPair.socketA.room).emit("connected_users", userPayload)
        return {
          socketId: socket.id,
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          room: socketPair.socketA.room,
          username: data.username
        }
      }
    }

    console.log("location data: ")
    console.log(data)
    if(Object.keys(socketPair.socketB).length === 0){
      console.log('socketB empty')
      if(Object.keys(socketPair.socketA).length === 0 || socket.id === socketPair.socketA.socketId){
        console.log('setting socketA val')

        const roomID = uuidv4()
        chatRoom = roomID

        console.log(roomID)

        socket.join(roomID)
        io.to(roomID).emit("chat_room_id", roomID)
        const userPayload = {}
        userPayload[data.userId] = data.username
        io.to(roomID).emit("connected_users", userPayload)
        
        socketPair.socketA = {
          socketId: socket.id,
          userId: data.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          room: roomID,
          username: data.username
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

  // socket.on("create_private_room", (data) => {
  //   console.log(`creating private room: ${data.privateRoom} for user: ${data.username}`)
  //   socket.join(data.privateRoom)
  // })
  // socket.on("join_private_room", (data) => {
  //   console.log(`user: ${data.username} has joined private room: ${data.roomId}`)
  //   socket.join(data.roomId)
  //   socket.to(data.roomId).emit("invitee_connected", data.username)
  // })
  // socket.on("greet_invitee", (data) => {
  //   console.log('greeting invitee')
  //   console.log(data)
  //   socket.to(data.room).emit("welcome", data.username)
  // })
  

  socket.on("leave_rooms", () => {
    // socket.leave(room)
    for(let room of socket.rooms){
      if(room !== socket.id){
        let alert = 'user disconnected'
        if(room[0]+room[1] === 'PR'){
          alert = 'no one here right now..'
        }
        console.log(`socket: ${socket.id} leaving room: ${room}`)
        socket.to(room).emit("room_destroy", alert)
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
      let alert = 'user disconnected'
      if(room !== socket.id){
        if(room[0]+room[1] === 'PR'){
          alert = 'no one here right now..'
        }
        socket.to(room).emit("room_destroy", alert)
        if(room[0]+room[1] !== 'PR'){
          socket.leave(room)
        }
        // io.to(room)
      }
    }
    if(socket.id === socketPair.socketA.socketId){
      socketPair.socketA = {}
    }
  })
});

httpServer.listen(PORT, () => console.log(`server listening on port: ${PORT}`));