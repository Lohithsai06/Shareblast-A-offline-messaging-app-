import React, { useEffect, useRef } from 'react';
import '../styles/ChatWindow.css';

const ChatWindow = ({ messages, currentUser, typingUsers }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return timestamp;
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`message-wrapper ${msg.senderId === currentUser.username ? 'sent' : 'received'} ${msg.isSystem ? 'system-message' : ''}`}
          >
            {msg.isSystem ? (
              <div className="system-message-content">
                <p>{msg.text}</p>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
            ) : (
              <div className="message">
                {msg.senderId !== currentUser.username && (
                  <div className="message-avatar">
                    <span>{msg.senderId.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="message-content">
                  {msg.senderId !== currentUser.username && (
                    <div className="message-sender">{msg.senderId}</div>
                  )}
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                  </div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;