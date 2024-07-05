import React from 'react';
import PropTypes from 'prop-types';

const Holidaymodal = ({ event, onSave, onCancel, onChange }) => {
  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-dialog w-3/4" style={{ maxHeight: '90vh', overflow: 'scroll', maxWidth: '900px' }}>
        <div className="modal-content">
          <div className="modal-header bg-blue-500">
            <h5 className="modal-title text-white text-lg">Leave Type Form</h5>
            <button type="button" className="close" onClick={onCancel}>
              <span>&times;</span>
            </button>
          </div>

          <div className="flex flex-wrap justify-center p-3">
            <div className="modal-body w-full md:w-2/3" style={{ textAlign: 'center' }}>
              <div className="form-group w-full">
                <label htmlFor="leaveName" style={{ textAlign: 'left', display: 'block' }}>Leave Name</label>
                <input
                  type="text"
                  id="leaveName"
                  name="leaveName"
                  value={event.leaveName}
                  onChange={onChange}
                  placeholder="Leave Name"
                  className="form-control"
                  style={{ width: '100%', marginBottom: '1rem', padding: '1rem', fontSize: '1.2rem' }}
                />
              </div>
              <div className="form-group w-full">
                <label htmlFor="type" style={{ textAlign: 'left', display: 'block' }}>Type</label>
                <input
                  type="text"
                  id="type"
                  name="type"
                  value={event.type}
                  onChange={onChange}
                  placeholder="Type"
                  className="form-control"
                  style={{ width: '100%', marginBottom: '1rem', padding: '1rem', fontSize: '1.2rem' }}
                />
              </div>
              <div className="form-group w-full">
                <label htmlFor="leaveUnit" style={{ textAlign: 'left', display: 'block' }}>Leave Unit</label>
                <input
                  type="text"
                  id="leaveUnit"
                  name="leaveUnit"
                  value={event.leaveUnit}
                  onChange={onChange}
                  placeholder="Leave Unit"
                  className="form-control"
                  style={{ width: '100%', marginBottom: '1rem', padding: '1rem', fontSize: '1.2rem' }}
                />
              </div>
              <div className="form-group w-full">
                <label htmlFor="status" style={{ textAlign: 'left', display: 'block' }}>Status</label>
                <input
                  type="text"
                  id="status"
                  name="status"
                  value={event.status}
                  onChange={onChange}
                  placeholder="Status"
                  className="form-control"
                  style={{ width: '100%', marginBottom: '1rem', padding: '1rem', fontSize: '1.2rem' }}
                />
              </div>
              <div className="form-group w-full">
                <label htmlFor="note" style={{ textAlign: 'left', display: 'block' }}>Note</label>
                <textarea
                  id="note"
                  name="note"
                  value={event.note}
                  onChange={onChange}
                  placeholder="Note"
                  className="form-control"
                  style={{ width: '100%', marginBottom: '1rem', padding: '1rem', fontSize: '1.2rem' }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Holidaymodal.propTypes = {
  event: PropTypes.shape({
    leaveName: PropTypes.string,
    type: PropTypes.string,
    leaveUnit: PropTypes.string,
    status: PropTypes.string,
    note: PropTypes.string,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Holidaymodal;
