import React, { useState } from 'react';

const Modal = ({ onSave, onCancel, event }) => {
  const [title, setTitle] = useState(event.title || '');
  const [start, setStart] = useState(event.start || new Date());
  const [end, setEnd] = useState(event.end || new Date());

  return (
    <div className="modal">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event Title"
      />
      <button onClick={() => onSave({ ...event, title, start, end })}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default Modal;
