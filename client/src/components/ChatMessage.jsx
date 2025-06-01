import React from 'react';
import '../styles/ChatMessage.css';

const ChatMessage = ({ message, currentUser }) => {
  const isUserMessage = message.isUser;
  
  return (
    <div className={`message-wrapper ${isUserMessage ? 'user-message' : 'other-message'}`}>
      {!isUserMessage && (
        <div className="message-avatar">
          <img src={currentUser.avatar} alt={currentUser.name} />
        </div>
      )}
      
      <div className="message-content">
        <div className="message-bubble">
          <p>{message.text}</p>
        </div>
        <div className="message-info">
          <span className="message-time">{message.timestamp.split(',')[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;