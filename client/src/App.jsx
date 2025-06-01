import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

// Create socket connection at the app level
const getSocketUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:3000`; // Use same hostname but different port for socket server
};

// Initialize socket
const socket = io(getSocketUrl(), {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false // We'll connect manually after login
});

function App() {
  const [CONNECTED, setConnected] = useState(socket.connected);
  
  useEffect(() => {
    // Socket connection event handlers
    const onConnect = () => {
      console.log('Socket connected!');
      setConnected(true);
    };
    
    const onDisconnect = () => {
      console.log('Socket disconnected!');
      setConnected(false);
    };
    
    const onConnectError = (error) => {
      console.error('Connection error:', error);
    };
    
    // Register event handlers
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    
    // Cleanup on component unmount
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);
  
  // Ping server every 30 seconds to keep connection alive
  useEffect(() => {
    const interval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login socket={socket} />} />
        <Route path="/chat" element={<Chat socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;