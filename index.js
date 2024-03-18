const PORT = 4000;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require('path');
const socket = require('socket.io');

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
  console.log(socket.id,'connected');
  const rooms = io.sockets.adapter.rooms;
  console.log(rooms) // this lists all the rooms
  socket.on('join', (roomName) => {
    if(rooms.get(roomName) === undefined){
      socket.join(roomName);
      console.log('room created', roomName);
    } else if (rooms.get(roomName).size < maxCap){
      socket.join(roomName);
      console.log('room joined', roomName);
    } else {
      console.log('room is full');
    }
    console.log(rooms)
  });
  socket.on('disconnect', () => {
    console.log(socket.id,'disconnected');
    console.log(rooms);
  });
});
