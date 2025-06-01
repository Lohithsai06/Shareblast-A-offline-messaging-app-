import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import ChatHeader from '../components/chatheader';
import ChatSidebar from '../components/ChatSidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import '../styles/chat.css';
import { FaBars, FaSearch, FaSignOutAlt, FaPhone, FaVideo, FaPaperPlane, FaMicrophone, FaMoon, FaSun, FaArrowLeft } from 'react-icons/fa';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  // Add or update the mobile view state
  const [mobileView, setMobileView] = useState('userList');
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  // Initialize socket and user data
  useEffect(() => {
    // Check for dark mode preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    }
    
    // Get user data from localStorage
    const chatUserData = localStorage.getItem('chatUser');
    
    if (!chatUserData) {
      navigate('/');
      return;
    }
    
    try {
      const userData = JSON.parse(chatUserData);
      setUser(userData);
      
      // Get the current hostname/IP for socket connection
      const currentHost = window.location.hostname;
      const socketPort = 3000; // Your socket server port
      
      // Connect to socket server using the same host as the client
      const socketUrl = `http://${currentHost}:${socketPort}`;
      console.log('Connecting to socket server at:', socketUrl);
      
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });
      
      setSocket(newSocket);
      
      // Socket connection events
      newSocket.on('connect', () => {
        console.log('Socket connected with ID:', newSocket.id);
        
        // Emit user joined event with socket ID
        newSocket.emit('user:joined', {
          id: newSocket.id,
          username: userData.username,
          roomCode: userData.roomCode || 'default'
        });
        
        // Also emit the simplified join event for compatibility
        newSocket.emit('join', userData.username);
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      
      // Listen for updated user list
      newSocket.on('users:updated', (users) => {
        console.log('Received updated user list:', users);
        setConnectedUsers(users);
      });
      
      // Also listen for the alternative event name
      newSocket.on('update-user-list', (users) => {
        console.log('Received user list update:', users);
        setConnectedUsers(users);
      });
      
      // Listen for new messages
      newSocket.on('message:received', (message) => {
        console.log('Received message:', message);
        setMessages(prevMessages => [...prevMessages, message]);
      });
      
      // Listen for typing indicators
      newSocket.on('user:typing', ({ username, isTyping }) => {
        if (isTyping) {
          setTypingUsers(prev => [...prev.filter(name => name !== username), username]);
        } else {
          setTypingUsers(prev => prev.filter(name => name !== username));
        }
      });
      
      // Ping server every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping');
        }
      }, 30000);
      
      // Cleanup on unmount
      return () => {
        console.log('Disconnecting socket');
        clearInterval(pingInterval);
        newSocket.emit('user:left', {
          id: newSocket.id,
          username: userData.username,
          roomCode: userData.roomCode || 'default'
        });
        newSocket.disconnect();
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/');
    }
  }, [navigate]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Toggle dark mode
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };
  
  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem('chatUser');
    navigate('/');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (message.trim() && socket && user && activeChat) {
      const newMessage = {
        id: Date.now(),
        senderId: user.username,
        receiverId: activeChat.username,
        text: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSender: true
      };
      
      // Add message to local state
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Send message to server
      socket.emit('message:send', {
        id: newMessage.id,
        text: message,
        sender: user.username,
        receiver: activeChat.username,
        roomCode: user.roomCode || 'default',
        timestamp: newMessage.timestamp
      });
      
      // Reset message and typing indicator
      setMessage('');
      socket.emit('user:typing', {
        username: user.username,
        roomCode: user.roomCode || 'default',
        isTyping: false
      });
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (socket && user) {
      socket.emit('user:typing', {
        username: user.username,
        roomCode: user.roomCode || 'default',
        isTyping: e.target.value.length > 0
      });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  // Function to open chat with a user
  const openChat = (selectedUser) => {
    setActiveChat(selectedUser);
    if (isMobile) {
      setMobileView('chat');
    }
  };
  
  // Function to go back to user list
  const goBackToUserList = () => {
    if (isMobile) {
      setMobileView('userList');
    }
  };
  
  if (!user) {
    return <div className="loading">Loading...</div>;
  }
  
  // Mobile user list view
  const RENDER_USER_LIST_VIEW = () => (
    <div className="mobile-user-list">
      <div className="mobile-header">
        <h2>Chats</h2>
        <div className="mobile-header-actions">
          <button className="action-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button className="action-btn logout-btn" onClick={handleLogout} aria-label="Logout">
            <FaSignOutAlt />
          </button>
        </div>
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
      
      <div className="contacts-list">
        {connectedUsers.length > 0 ? (
          connectedUsers
            .filter(connectedUser => connectedUser.username !== user.username) // Filter out current user
            .filter(connectedUser => connectedUser.username.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(connectedUser => (
              <div 
                key={connectedUser.id || connectedUser.username} 
                className="contact-item"
                onClick={() => openChat(connectedUser)}
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
  
  // Mobile chat view
  const RENDER_CHAT_VIEW = () => (
    <div className='mobile-chat-view'>
      {/* Fixed Header */}
      // In the mobile chat view section, update the header structure:
      <div className="chat-header">
        <button className="back-btn" onClick={goBackToUserList}>
          <FaArrowLeft />
        </button>
        <div className="chat-user-info">
          {activeChat && (
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
          )}
        </div>
        <div className="chat-actions">
          <button className="action-btn" onClick={() => console.log('Audio call with', activeChat?.username)} aria-label="Phone call">
            <FaPhone />
          </button>
          <button className="action-btn" onClick={() => console.log('Video call with', activeChat?.username)} aria-label="Video call">
            <FaVideo />
          </button>
          <button className="action-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button className="action-btn logout-btn" onClick={handleLogout} aria-label="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
      
      // And in the desktop view section, update the header structure similarly:
      <div className="chat-header">
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
            </>
          )}
        </div>
        <div className="chat-actions">
          // In both mobile and desktop views, update the button onClick handlers:
          <button className="action-btn" 
            onClick={() => activeChat && console.log('Audio call initiated with:', activeChat.username)}
            aria-label="Phone call" 
            disabled={!activeChat}>
            <FaPhone />
          </button>
          <button className="action-btn" 
            onClick={() => activeChat && console.log('Video call initiated with:', activeChat.username)}
            aria-label="Video call" 
            disabled={!activeChat}>
            <FaVideo />
          </button>
          <button className="action-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button className="action-btn logout-btn" onClick={handleLogout} aria-label="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
      
      {/* Scrollable Messages Container */}
      <div className="messages-container">
        {activeChat ? (
          messages
            .filter(msg => 
              (msg.senderId === user.username && msg.receiverId === activeChat.username) || 
              (msg.senderId === activeChat.username && msg.receiverId === user.username)
            )
            .map(msg => (
              <div key={msg.id} className={`message ${msg.senderId === user.username ? 'sent' : 'received'}`}>
                {msg.senderId !== user.username && (
                  <div className="message-avatar">
                    <span>{msg.senderId.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="message-content">
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                  <div className="message-time">{msg.timestamp}</div>
                </div>
              </div>
            ))
        ) : (
          <div className="no-chat-selected">
            <p>Select a user to start chatting</p>
          </div>
        )}
        
        {typingUsers.length > 0 && activeChat && typingUsers.includes(activeChat.username) && (
          <div className="typing-indicator">
            <span>{activeChat.username} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Fixed Footer - Message Input */}
      <div className="message-input-container">
        <form onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={message}
            onChange={handleTyping}
            disabled={!activeChat}
          />
          <button type="button" className="input-action-btn" aria-label="Voice message" disabled={!activeChat}>
            <FaMicrophone />
          </button>
          <button type="submit" className="send-btn" disabled={!message.trim() || !activeChat} aria-label="Send message">
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
  
  // Render based on device type and view
  return (
    <div className={`chat-app ${isDarkMode ? 'dark' : ''}`}>
      {isMobile ? (
        // Mobile layout
        <div className="mobile-layout">
          {mobileView === 'userList' ? (
            // Mobile user list view
            <div className="mobile-user-list">
              <div className="mobile-header">
                <div className="mobile-header-title">
                  <h2>Select a Contact</h2>
                </div>
                <div className="mobile-header-actions">
                  <button className="action-btn theme-toggle" onClick={toggleTheme}>
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                  </button>
                  <button className="action-btn logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt />
                  </button>
                </div>
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
              
              <div className="contacts-list">
                {connectedUsers.length > 0 ? (
                  connectedUsers
                    .filter(connectedUser => connectedUser.username !== user.username) // Filter out current user
                    .filter(connectedUser => connectedUser.username.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map(connectedUser => (
                      <div 
                        key={connectedUser.id || connectedUser.username} 
                        className="contact-item"
                        onClick={() => openChat(connectedUser)}
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
          ) : (
            // Mobile chat view with fixed header, scrollable messages, and fixed footer
            <div className="mobile-chat-view">
              {/* Fixed Header */}
              <div className="chat-header">
                <button className="back-btn" onClick={goBackToUserList}>
                  <FaArrowLeft />
                </button>
                <div className="chat-user-info">
                  {activeChat && (
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
                  )}
                </div>
                <div className="chat-actions">
                  <button className="action-btn" aria-label="Phone call"><FaPhone /></button>
                  <button className="action-btn" aria-label="Video call"><FaVideo /></button>
                </div>
              </div>
              
              {/* Scrollable Messages Container */}
              <div className="messages-container">
                {activeChat ? (
                  messages
                    .filter(msg => 
                      (msg.senderId === user.username && msg.receiverId === activeChat.username) || 
                      (msg.senderId === activeChat.username && msg.receiverId === user.username)
                    )
                    .map(msg => (
                      <div key={msg.id} className={`message ${msg.senderId === user.username ? 'sent' : 'received'}`}>
                        {msg.senderId !== user.username && (
                          <div className="message-avatar">
                            <span>{msg.senderId.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="message-content">
                          <div className="message-bubble">
                            {msg.text}
                          </div>
                          <div className="message-time">{msg.timestamp}</div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="no-chat-selected">
                    <p>Select a user to start chatting</p>
                  </div>
                )}
                
                {typingUsers.length > 0 && activeChat && typingUsers.includes(activeChat.username) && (
                  <div className="typing-indicator">
                    <span>{activeChat.username} is typing...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Fixed Footer - Message Input */}
              <div className="message-input-container">
                <form onSubmit={handleSendMessage}>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={message}
                    onChange={handleTyping}
                    disabled={!activeChat}
                  />
                  <button type="button" className="input-action-btn" aria-label="Voice message" disabled={!activeChat}>
                    <FaMicrophone />
                  </button>
                  <button type="submit" className="send-btn" disabled={!message.trim() || !activeChat} aria-label="Send message">
                    <FaPaperPlane />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Desktop layout - keep existing code
        <>
          {/* Mobile menu button */}
          <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <FaBars />
          </button>
          
          {/* Left sidebar with connected users */}
          <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
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
                      onClick={() => setActiveChat(connectedUser)}
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
          
          {/* Main chat area */}
          <div className="chat-main">
            <div className="chat-header">
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
                <button className="action-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                  {isDarkMode ? <FaSun /> : <FaMoon />}
                </button>
                <button className="action-btn" aria-label="Phone call"><FaPhone /></button>
                <button className="action-btn" aria-label="Video call"><FaVideo /></button>
                <button className="action-btn logout-btn" onClick={handleLogout} aria-label="Logout">
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
            
            <div className="messages-container">
              {activeChat ? (
                messages
                  .filter(msg => 
                    (msg.senderId === user.username && msg.receiverId === activeChat.username) || 
                    (msg.senderId === activeChat.username && msg.receiverId === user.username)
                  )
                  .map(msg => (
                    <div key={msg.id} className={`message ${msg.senderId === user.username ? 'sent' : 'received'}`}>
                      {msg.senderId !== user.username && (
                        <div className="message-avatar">
                          <span>{msg.senderId.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="message-content">
                        <div className="message-bubble">
                          {msg.text}
                        </div>
                        <div className="message-time">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="no-chat-selected">
                  <p>Select a user to start chatting</p>
                </div>
              )}
              
              {typingUsers.length > 0 && activeChat && typingUsers.includes(activeChat.username) && (
                <div className="typing-indicator">
                  <span>{activeChat.username} is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            <div className="message-input-container">
              <form onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={message}
                  onChange={handleTyping}
                  disabled={!activeChat}
                />
                <button type="button" className="input-action-btn" aria-label="Voice message" disabled={!activeChat}>
                  <FaMicrophone />
                </button>
                <button type="submit" className="send-btn" disabled={!message.trim() || !activeChat} aria-label="Send message">
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;