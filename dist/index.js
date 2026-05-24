"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const UserManager_1 = require("./managers/UserManager");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
const userManager = new UserManager_1.UserManager();
// roomManager.joinRoom(user);
io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    socket.on('joinRoom', ({ name }) => {
        userManager.addUser(name, socket);
        //   const updName = name.toLowerCase();
        //   roomManager.joinRoom(updName,socket);
        //  console.log(roomManager.getUsers())
    });
    // Listen for messages from the client
    socket.on('clientMessage', (message) => {
        console.log('Message from client:', message);
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
app.get("/users", (req, res) => {
    console.log("all users");
    return res.json({ message: "All users" });
});
server.listen(3000, () => {
    console.log("Server running 3000");
});
