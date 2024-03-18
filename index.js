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
io.on('connection', (socket) => {
  console.log('made socket connection', socket.id);
  socket.on('join', function(data){
    io.sockets.emit('chat', data);
  });
  // socket.on('typing', function(data){
  //   socket.broadcast.emit('typing', data);
  // });
});
