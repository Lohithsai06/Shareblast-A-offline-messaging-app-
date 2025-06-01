import React from 'react';
import '../styles/UserProfilePanel.css';

const UserProfilePanel = ({ user, onClose }) => {
  return (
    <div className="profile-panel">
      <div className="profile-header">
        <button className="close-profile-btn" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="profile-content">
        <div className="profile-avatar">
          <img src={user.avatar} alt={user.name} />
        </div>
        
        <h2 className="profile-name">{user.name}</h2>
        
        <div className="profile-info-section">
          <h3>EMAIL</h3>
          <p>{user.name.toLowerCase().replace(' ', '')}@gmail.com</p>
        </div>
        
        <div className="profile-info-section">
          <h3>PHONE</h3>
          <p>+1234567890</p>
        </div>
        
        <div className="profile-info-section">
          <h3>LABELS</h3>
          <div className="profile-labels">
            <span className="label">March</span>
            <span className="label">Facebook</span>
            <span className="label">Christmas sale</span>
            <span className="label">2017</span>
          </div>
        </div>
        
        <div className="profile-info-section">
          <h3>INVOICES</h3>
          <p className="profile-link">Create new invoice</p>
        </div>
        
        <div className="profile-info-section">
          <h3>ATTACHMENTS</h3>
          <div className="profile-attachments">
            <div className="attachment-item">
              <i className="fas fa-file-pdf"></i>
              <span>Quote for March.doc</span>
            </div>
            <div className="attachment-item">
              <i className="fas fa-file-image"></i>
              <span>BlackDeluxe.jpg</span>
            </div>
          </div>
          <p className="profile-link view-all">View all</p>
        </div>
      </div>
      
      <div className="profile-footer">
        <button className="profile-action-btn">
          Edit Contact
        </button>
      </div>
    </div>
  );
};

export default UserProfilePanel;