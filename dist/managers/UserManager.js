"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");
class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new RoomManager_1.RoomManager();
    }
    addUser(name, socket) {
        const findSID = this.queue.find(id => id === socket.id);
        if (findSID) {
            console.log("User already exists ");
            return;
        }
        this.users.push({ name, socket });
        this.queue.push(socket.id);
        //! emit something
        this.clearQueue();
        this.handleOffer(socket);
    }
    clearQueue() {
        if (this.queue.length < 2) {
            return;
        }
        const person1 = this.queue.pop();
        const person2 = this.queue.pop();
        const user1 = this.users.find(user => user.socket.id === person1);
        const user2 = this.users.find(user => user.socket.id === person2);
        console.log("ID-1 ", person1, " ID-2 ", person2);
        console.log("creating a room ");
        if (!user1 || !user2) {
            return;
        }
        const room = this.roomManager.createRoom({ user1, user2 });
    }
    handleOffer(socket) {
        socket.on("offer", ({ sdp, roomId }) => {
            console.log("Calling - SDP", sdp);
            this.roomManager.onOffering(sdp, roomId, socket.id);
        });
        socket.on("answer", ({ sdp, roomId }) => {
            console.log("Answering user -> SDP", sdp);
            this.roomManager.onAnswer(sdp, roomId, socket.id);
        });
        socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
            console.log("Ice running in backend");
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });
    }
}
exports.UserManager = UserManager;
