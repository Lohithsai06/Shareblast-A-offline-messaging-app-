const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*', // In production, you should restrict this
  methods: ['GET', 'POST']
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, you should restrict this
    methods: ['GET', 'POST']
  },
  // Add these options to improve connection reliability on LAN
  pingTimeout: 60000,
  pingInterval: 25000
});

// Store connected users (using Map for O(1) lookups by ID)
const connectedUsers = new Map();

// Debug endpoint to check connected users
app.get('/users', (req, res) => {
  res.json(Array.from(connectedUsers.values()));
});

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Send initial user list to the newly connected client
  socket.emit('users:updated', Array.from(connectedUsers.values()));
  
  // Handle user joining
  socket.on('user:joined', (userData) => {
    console.log('User joined:', userData);
    const { username, roomCode } = userData;
    
    // Add user to the room
    socket.join(roomCode || 'default');
    
    // Store user data with socket ID as the key
    connectedUsers.set(socket.id, {
      id: socket.id,
      username,
      roomCode: roomCode || 'default',
      joinedAt: new Date().toISOString(),
      isOnline: true
    });
    
    // Get all users in the room
    const usersInRoom = Array.from(connectedUsers.values())
      .filter(user => user.roomCode === (roomCode || 'default'));
    
    console.log('Users in room:', usersInRoom);
    
    // Broadcast updated user list to ALL clients (including sender)
    io.emit('users:updated', Array.from(connectedUsers.values()));
    
    // Also emit the specific event for React frontend
    io.emit('update-user-list', Array.from(connectedUsers.values()));
    
    // Notify others that a new user joined
    socket.to(roomCode || 'default').emit('message:received', {
      id: Date.now(),
      senderId: 'system',
      text: `${username} has joined the chat`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
  });
  
  // Also handle the simplified "join" event for compatibility
  socket.on('join', (username) => {
    console.log('User joined with simplified event:', username);
    
    // Store user data with socket ID as the key
    connectedUsers.set(socket.id, {
      id: socket.id,
      username,
      roomCode: 'default',
      joinedAt: new Date().toISOString(),
      isOnline: true
    });
    
    // Broadcast updated user list to ALL clients
    io.emit('users:updated', Array.from(connectedUsers.values()));
    io.emit('update-user-list', Array.from(connectedUsers.values()));
    
    // Notify others that a new user joined
    socket.broadcast.emit('message:received', {
      id: Date.now(),
      senderId: 'system',
      text: `${username} has joined the chat`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
  });
  
  // Handle user sending a message
  // Handle user sending a message
  socket.on('message:send', (messageData) => {
    const { text, sender, receiver, roomCode, timestamp } = messageData;
    
    // Find the socket ID of the receiver
    const receiverSocketId = Array.from(connectedUsers.entries())
      .find(([_, userData]) => userData.username === receiver)?.[0];
    
    if (receiverSocketId) {
      // Send the message directly to the receiver
      io.to(receiverSocketId).emit('message:received', {
        id: Date.now(),
        senderId: sender,
        receiverId: receiver,
        text,
        timestamp,
        isSender: false
      });
    }
    
    // Also store the message in your database if needed
  });
  
  // Handle typing indicator
  socket.on('user:typing', (data) => {
    const { username, roomCode, isTyping } = data;
    socket.broadcast.emit('user:typing', { username, isTyping });
  });
  
  // Handle user disconnection
  socket.on('disconnect', () => {
    const userData = connectedUsers.get(socket.id);
    
    if (userData) {
      const { username, roomCode } = userData;
      
      // Remove user from storage
      connectedUsers.delete(socket.id);
      
      console.log('User disconnected, remaining users:', Array.from(connectedUsers.values()));
      
      // Broadcast updated user list to ALL clients
      io.emit('users:updated', Array.from(connectedUsers.values()));
      io.emit('update-user-list', Array.from(connectedUsers.values()));
      
      // Notify others that a user left
      io.emit('message:received', {
        id: Date.now(),
        senderId: 'system',
        text: `${username} has left the chat`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
    }
    
    console.log('User disconnected:', socket.id);
  });
  
  // Handle explicit user leaving
  socket.on('user:left', (userData) => {
    if (userData) {
      const { username } = userData;
      
      // Remove user from storage
      connectedUsers.delete(socket.id);
      
      // Broadcast updated user list to ALL clients
      io.emit('users:updated', Array.from(connectedUsers.values()));
      io.emit('update-user-list', Array.from(connectedUsers.values()));
      
      console.log(`${username} left the chat`);
    }
  });
  
  // Periodic ping to keep connections alive
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the server at http://localhost:${PORT}`);
  console.log(`For LAN access, use your local IP address (e.g., http://192.168.x.x:${PORT})`);
});