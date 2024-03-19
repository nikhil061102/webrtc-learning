const socket = io.connect("http://localhost:4000");

const join = document.getElementById("join");
const roomName = document.getElementById("roomName");
const userVideo = document.getElementById("user-video");
const peerVideo = document.getElementById("peer-video");

const startVideoCall = () => {
    // navigator.mediaDevices.getUserMedia({ video: {height: 100, width: 100}, audio: true })
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then((stream) => {
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = () => {
            userVideo.play();
        };
    })
    .catch((err) => {
        console.log("Error accessing media devices", err);
    });
};

join.addEventListener("click", () => {
    if(roomName.value === "") {
        alert("Please enter a room number");
    } else {
        socket.emit("join", roomName.value);
    }
});

socket.on('created', (roomName)=>{
    startVideoCall();
    alert(`Room named ${roomName} created`);
});
socket.on('joined', (roomName)=>{
    startVideoCall();
    alert(`Room named ${roomName} joined`);
});
socket.on('full', (roomName)=>{
    alert(`Room named ${roomName} is full`);
});



socket.on('ready', (roomName)=>{});
socket.on('candidate', (candidate)=>{});
socket.on('offer', (offer)=>{});
socket.on('answer', (answer)=>{});