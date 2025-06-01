import React from 'react';
import { FaSearch } from 'react-icons/fa';
import '../styles/ChatSidebar.css';

const ChatSidebar = ({ 
  user, 
  connectedUsers, 
  activeChat, 
  setActiveChat, 
  searchTerm, 
  setSearchTerm,
  openChat // Add this prop for mobile navigation
}) => {
  const handleUserSelect = (selectedUser) => {
    if (openChat) {
      // Use the openChat function for mobile navigation
      openChat(selectedUser);
    } else {
      // Just set the active chat for desktop
      setActiveChat(selectedUser);
    }
  };

  return (
    <div className="chat-sidebar">
      <div className="sidebar-header">
        <div className="window-controls">
          <span className="control red"></span>
          <span className="control yellow"></span>
          <span className="control green"></span>
        </div>
        <div className="room-title">
          <h3>Contacts</h3>
        </div>
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="contacts-list">
        {connectedUsers.length > 0 ? (
          connectedUsers
            .filter(connectedUser => connectedUser.username !== user.username) // Filter out current user
            .filter(connectedUser => connectedUser.username.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(connectedUser => (
              <div 
                key={connectedUser.id || connectedUser.username} 
                className={`contact-item ${activeChat && activeChat.username === connectedUser.username ? 'active' : ''}`}
                onClick={() => handleUserSelect(connectedUser)}
              >
                <div className="contact-avatar">
                  {connectedUser.avatar ? (
                    <img src={connectedUser.avatar} alt={connectedUser.username} />
                  ) : (
                    <div className="avatar-initial">
                      {connectedUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="online-indicator"></span>
                </div>
                <div className="contact-info">
                  <div className="contact-name">{connectedUser.username}</div>
                  <div className="contact-status">Online</div>
                </div>
              </div>
            ))
        ) : (
          <div className="no-users">
            <p>No other users connected</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;