const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidV4 } = require("uuid");
app.set("view engine", "ejs"); //ejs embeded javascript used to used to get variable from backend to frontend
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
//create new connections from the server side->io.on take two parametr first event i.e "connection" and the second one is event listener
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    // Emitting events to the client: Use socket.emit("event_name", data) to send data or trigger events on the client-side. when a user connect
    socket.broadcast.to(roomId).emit("user-connected", userId);
    //  Receiving events from the client: Define event listeners on the server-side using socket.on("event_name", callback) to handle events emitted by the client. -->"disconnect" is an event
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});
server.listen(process.env.PORT||3000);
