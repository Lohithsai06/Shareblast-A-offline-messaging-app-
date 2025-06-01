import React, { useState } from 'react';
import { FaPaperPlane, FaMicrophone, FaSmile, FaPaperclip } from 'react-icons/fa';
import '../styles/ChatInput.css';

const ChatInput = ({ onSendMessage, socket, user, roomCode }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleTyping = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Handle typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      socket.emit('user:typing', { username: user.username, roomCode, isTyping: true });
    } else if (!value && isTyping) {
      setIsTyping(false);
      socket.emit('user:typing', { username: user.username, roomCode, isTyping: false });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
      socket.emit('user:typing', { username: user.username, roomCode, isTyping: false });
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit}>
        <button type="button" className="input-action-btn">
          <FaPaperclip />
        </button>
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={message}
          onChange={handleTyping}
        />
        <button type="button" className="input-action-btn">
          <FaSmile />
        </button>
        <button type="button" className="input-action-btn">
          <FaMicrophone />
        </button>
        <button type="submit" className="send-btn" disabled={!message.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;