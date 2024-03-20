const PORT = 4000;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require('path');
const socket = require('socket.io');

app.use(express.static('public'));

app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`);
});

const io = socket(server);
const maxCap = 3;
io.on('connection', (socket) => {
  // console.log(socket.id,'connected');
  const rooms = io.sockets.adapter.rooms;
  // console.log(rooms) // this lists all the rooms
  socket.on('join', (roomName) => {
    if(rooms.get(roomName) === undefined){
      socket.join(roomName);
      socket.emit('created', roomName);
    } else if (rooms.get(roomName).size < maxCap){
      socket.join(roomName);
      socket.emit('joined', roomName);
    } else {
      // console.log('room is full');
      socket.emit('full', roomName);
    }
    // console.log(rooms)
  });
  // socket.on('disconnect', () => {
  //   console.log(socket.id,'disconnected');
  //   console.log(rooms);
  // });
  socket.on("ready",(roomNo)=>{
    // console.log("ready",roomNo);
    socket.broadcast.to(roomNo).emit("ready");
  })
  socket.on("candidate",(candidate, roomNo)=>{
    // console.log("candidate",candidate, roomNo);
    socket.broadcast.to(roomNo).emit("candidate",candidate);
  })
  socket.on("offer",(offer, roomNo)=>{
    // console.log("offer",offer);
    socket.broadcast.to(roomNo).emit("offer",offer);
  })
  socket.on("answer",(answer, roomNo)=>{
    // console.log("answer",answer);
    socket.broadcast.to(roomNo).emit("answer",answer);
  })
});
