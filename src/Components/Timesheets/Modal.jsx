import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Modal = ({ event, onSave, onCancel, onChange, onDateChange, onFileChange, onRadioChange }) => {
  return (
    <div className="modal flex" style={{ display: 'block' }}>
      <div className="modal-dialog">
        <div className="modal-content ">
          <div className="modal-header bg-blue-700">
            <h5 className="modal-title text-white text-lg">Book time off</h5>
            <button type="button" className="close" onClick={onCancel}>
              <span>&times;</span>
            </button>
          </div>

          <div className="flex flex-wrap p-3">

            <div className="modal-body w-full md:w-3/3">
              <div className="form-group">
                <label htmlFor="eventType">Type</label>
                <select id="eventType" name="type" value={event.type} onChange={onChange} className="form-control">
                  <option value="paternity">Paternity Leave</option>
                  <option value="relocation">Relocation</option>
                  {/* Add more options as needed */}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <DatePicker
                  selected={event.start}
                  onChange={(date) => onDateChange(date, 'start')}
                  className="form-control"
                  id="startDate"
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <DatePicker
                  selected={event.end}
                  onChange={(date) => onDateChange(date, 'end')}
                  className="form-control"
                  id="endDate"
                />
              </div>
              <div className="form-group">
                <label htmlFor="dayType">Full Day / Half Day</label>
                <select id="dayType" name="dayType" value={event.dayType} onChange={onChange} className="form-control">
                  <option value="full">Full Day</option>
                  <option value="half">Half Day</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="document">Document Upload</label>
                <input type="file" id="document" onChange={onFileChange} className="form-control" />
              </div>
              <div className="form-group">
                <label htmlFor="reason">Reason</label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={event.reason}
                  onChange={onChange}
                  placeholder="Reason"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="comments">Comments</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={event.comments}
                  onChange={onChange}
                  placeholder="Comments"
                  className="form-control"
                />
              </div>
            </div>

            <div className='p-3 w-full md:w-3/3 border-solid border-1 border-gray-300 '>
              <div className='flex justify-between'>
                <div>
                  <h1 className='p-2 text-gray-600 text-sm'>As of May 22, 2023</h1>
                  <p className='p-2'>Balance before booking:</p>
                  <p className='p-2'>This booking:</p>
                  <p className='p-2'>Balance after booking:</p>
                </div>
                <div>
                  <h1 className='p-2 text-gray-600 text-sm'>Days</h1>
                  <p className='p-2'>20.00</p>
                  <p className='p-2'>-1.00</p>
                  <p className='p-2'>19.00</p>
                </div>
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

Modal.propTypes = {
  event: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onRadioChange: PropTypes.func.isRequired,
};

export default Modal;
