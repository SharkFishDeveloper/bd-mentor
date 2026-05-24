import express from "express"; 
import { Server, Socket } from "socket.io";
import http from "http"; 
import cors from "cors"; 
import {UserManager} from "./managers/UserManager"
import { userRouter } from "./routes/userRouter";
import { mentorRouter } from "./routes/mentorRouter";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
const server  = http.createServer(app);

const io = new Server(server,{
    cors:{
      origin: "*"
    }
});
const userManager = new UserManager();

// roomManager.joinRoom(user);
io.on('connection', (socket:Socket) => {
    // console.log('A user connected',socket.id);



    socket.on('joinRoom',({name,university}:{name:string,university?:string})=>{
      console.log("University ",university)
      if(university){
        console.log("Universty",university)
        userManager.addBigUser(name,socket,university);
      }
      else{
        userManager.addUser(name,socket);
        console.log("Totally random",name)
      }
    //   const updName = name.toLowerCase();
    //   roomManager.joinRoom(updName,socket);
    //  console.log(roomManager.getUsers())
    })
    
    // Listen for messages from the client
    socket.on('send-message', (message:string) => {
      // console.log('Message from client:', message);
      socket.broadcast.emit("receive-message",message);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });


app.use("/app/user",userRouter);
app.use("/app/mentor",mentorRouter);


server.listen(3000,()=>{
    console.log("Server running 3000")
})