import { io } from 'socket.io-client';

const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connected to the server");
});

export default socket;