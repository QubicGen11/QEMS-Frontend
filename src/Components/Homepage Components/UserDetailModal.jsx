// CustomModal.js
import React from 'react';

const UserDetailModal = ({ isOpen, onRequestClose, onCompleteDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="modal show" tabIndex={-1} role="dialog" style={{ display: 'block' }}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Complete Your Details</h5>
            <button type="button" className="close" onClick={onRequestClose} aria-label="Close">
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <p>You need to complete your details to enable clock-in and clock-out functionality.</p>
          </div>
          <div className="modal-footer">
            <a href="viewprofile/edit-profile"><button type="button" className="btn btn-primary" onClick={onCompleteDetails} >Complete Details</button></a>
            <button type="button" className="btn btn-secondary" onClick={onRequestClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
