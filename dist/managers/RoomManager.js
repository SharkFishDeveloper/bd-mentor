"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let ROOMS_ID_COUNT = 1;
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(users) {
        const id = this.generate().toString();
        console.log("Id of room ", id);
        this.rooms.set(id, { user1: users.user1, user2: users.user2 });
        console.log(this.rooms);
        const { user1, user2 } = users;
        user1.socket.emit("connected-to-room", { id });
        user2.socket.emit("connected-to-room", { id });
        user2.socket.emit("ask-offer");
        console.log("Emiited joingin room from backend");
        return;
    }
    onOffering(sdp, roomID, socket) {
        const room = this.rooms.get(roomID);
        const recievingUser = (room === null || room === void 0 ? void 0 : room.user1.socket.id) === socket ? room === null || room === void 0 ? void 0 : room.user2.socket : room === null || room === void 0 ? void 0 : room.user1.socket;
        console.log("user1 -<", socket, " user2-<", recievingUser === null || recievingUser === void 0 ? void 0 : recievingUser.id);
        console.log(sdp);
        recievingUser === null || recievingUser === void 0 ? void 0 : recievingUser.emit("offer", { sdp });
    }
    onAnswer(sdp, roomID, socket) {
        const room = this.rooms.get(roomID);
        const recievingUser = (room === null || room === void 0 ? void 0 : room.user1.socket.id) === socket ? room === null || room === void 0 ? void 0 : room.user2.socket : room === null || room === void 0 ? void 0 : room.user1.socket;
        recievingUser === null || recievingUser === void 0 ? void 0 : recievingUser.emit("call-accepted", { sdp });
    }
    onIceCandidates(roomId, senderSocketid, candidate, type) {
        const room = this.rooms.get(roomId);
        if (!room) {
            return;
        }
        const receivingUser = room.user1.socket.id === senderSocketid ? room.user2 : room.user1;
        console.log("ice in room-manager");
        receivingUser.socket.emit("add-ice-candidate", ({ candidate, type }));
    }
    generate() {
        return ROOMS_ID_COUNT++;
    }
}
exports.RoomManager = RoomManager;
