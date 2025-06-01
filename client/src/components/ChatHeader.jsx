import React from 'react';
import { FaArrowLeft, FaPhone, FaVideo, FaSignOutAlt, FaMoon, FaSun } from 'react-icons/fa';
import '../styles/ChatHeader.css';

const ChatHeader = ({ 
  activeChat, 
  isDarkMode, 
  toggleTheme, 
  handleLogout, 
  isMobile, 
  goBackToUserList 
}) => {
  return (
    <div className="chat-header">
      {isMobile && (
        <button className="back-btn" onClick={goBackToUserList}>
          <FaArrowLeft />
        </button>
      )}
      
      <div className="chat-user-info">
        {activeChat ? (
          <>
            <div className="chat-room-avatar">
              {activeChat.avatar ? (
                <img src={activeChat.avatar} alt={activeChat.username} />
              ) : (
                <span>{activeChat.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="chat-room-name">{activeChat.username}</span>
          </>
        ) : (
          <>
            <div className="chat-room-avatar">
              <span>W</span>
            </div>
            <span className="chat-room-name">Welcome</span>
            <span className="chat-room-users">Select a user to start chatting</span>
          </>
        )}
      </div>
      
      <div className="chat-actions">
        <button className="action-btn theme-toggle" onClick={toggleTheme}>
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        {!isMobile && (
          <>
            <button className="action-btn">
              <FaPhone />
            </button>
            <button className="action-btn">
              <FaVideo />
            </button>
          </>
        )}
        <button className="action-btn logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;