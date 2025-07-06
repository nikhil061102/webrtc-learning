const socket = io.connect("http://localhost:4000");

const join = document.getElementById("join");
const roomName = document.getElementById("roomName");
const userVideo = document.getElementById("user-video");
const peerVideo = document.getElementById("peer-video");

let isCreator;
let myVideo;
const iceServers = {
    iceServers: [
        { urls: "stun:stun.services.mozilla.com" },
        { urls: "stun:stun.l.google.com:19302" },
    ],
};

const startVideoCall = async () => {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(stream => {
        userVideo.srcObject = stream;
        userVideo.onloadedmetadata = () => {
            userVideo.play();
        };
    })
    .catch(err => {
        console.log("Error accessing media devices", err);
    });
    socket.emit("ready", roomName.value);
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
    isCreator = true;
});
socket.on('joined', (roomName)=>{
    startVideoCall();
    alert(`Room named ${roomName} joined`);
    isCreator = false;
});
socket.on('full', (roomName)=>{
    alert(`Room named ${roomName} is full`);
});

socket.on('ready', ()=>{
    if (isCreator==true){
        const peerConnection = new RTCPeerConnection(iceServers);        
        peerConnection.onicecandidate = (event) => {
            if (event.candidate){
                socket.emit('candidate', event.candidate, roomName.value);
            }
        };
        peerConnection.ontrack = event => {
            peerVideo.srcObject = event.streams[0];
            peerVideo.onloadedmetadata = () => {
                peerVideo.play();
            };
        };
        for (const track of peerVideo.getTracks()) {
            peerConnection.addTrack(track, peerVideo);
        }
        peerConnection.createOffer((offer => {
            peerConnection.setLocalDescription(offer);
            socket.emit('offer', offer, roomName);
        }),(error => console.log(error)));
    }
});
socket.on('candidate', (candidate)=>{
    const iceCandidate = new RTCIceCandidate(candidate);
    peerConnection.addIceCandidate(iceCandidate);
});
socket.on('offer', (offer)=>{
    if (isCreator==false){
        const peerConnection = new RTCPeerConnection(iceServers);        
        peerConnection.onicecandidate = (event) => {
            if (event.candidate){
                socket.emit('candidate', event.candidate, roomName.value);
            }
        };
        peerConnection.ontrack = (event) => {
            peerVideo.srcObject = event.streams[0];
            peerVideo.onloadedmetadata = () => {
                peerVideo.play();
            };
        };
        for (const track of myVideo.getTracks()) {
            peerConnection.addTrack(track, myVideo);
        }
        peerConnection.setRemoteDescription(offer);
        peerConnection.createAnswer(((answer) => {
            peerConnection.setLocalDescription(answer);
            socket.emit('answer', answer, roomName);
        }),(error) => {
            console.log(error);            
        });
    }
});
socket.on('answer', (answer)=>{
    peerConnection.setRemoteDescription(answer);
});