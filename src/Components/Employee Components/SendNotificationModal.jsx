import React, { useState, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Modal,
  Box,
  Typography,
  Button,
  IconButton,
  Tab,
  Tabs,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Close as CloseIcon,
  MailOutline as MailIcon,
  Description as TemplateIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import config from '../config';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
  overflow: 'auto'
};

const SendNotificationModal = ({ open, onClose, selectedEmployees, onSuccess }) => {
  const templates = [
    {
      name: 'Welcome Message',
      subject: 'Welcome to Our Team!',
      content: `
        <h2>Welcome aboard!</h2>
        <p>We're excited to have you join our team. Here's some important information to get you started...</p>
        <ul>
          <li>Company policies</li>
          <li>Team guidelines</li>
          <li>Upcoming events</li>
        </ul>
        <p>Best regards,<br/>Management Team</p>
      `
    },
    {
      name: 'Meeting Invitation',
      subject: 'Team Meeting Invitation',
      content: `
        <h3>Team Meeting Scheduled</h3>
        <p>You're invited to attend our upcoming team meeting.</p>
        <p><strong>Date:</strong> [Date]<br/>
        <strong>Time:</strong> [Time]<br/>
        <strong>Location:</strong> [Location]</p>
        <p>Agenda:</p>
        <ol>
          <li>Project updates</li>
          <li>Team discussions</li>
          <li>Q&A session</li>
        </ol>
      `
    },
    {
      name: 'Important Announcement',
      subject: 'Important Company Announcement',
      content: `
        <h2>Important Announcement</h2>
        <p>We have some important news to share with the team.</p>
        <blockquote style="border-left: 4px solid #ccc; margin: 1em 0; padding-left: 1em;">
          [Insert announcement details here]
        </blockquote>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br/>Management Team</p>
      `
    },
    {
      name: 'Project Update',
      subject: 'Project Status Update',
      content: `
        <h3>Project Update</h3>
        <p>Here's the latest update on our ongoing projects:</p>
        <div style="margin: 1em 0;">
          <h4>Project Highlights:</h4>
          <ul>
            <li>Milestone achievements</li>
            <li>Current challenges</li>
            <li>Next steps</li>
          </ul>
        </div>
        <p>Please review and provide your feedback.</p>
      `
    }
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [templateAnchorEl, setTemplateAnchorEl] = useState(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ]
  }), []);

  const handleTemplateSelect = (template) => {
    setSubject(template.subject);
    setMessage(template.content);
    setTemplateAnchorEl(null);
  };

  const handleSend = async () => {
    if (!message.trim() || !subject.trim()) {
      toast.error('Please enter both subject and message');
      return;
    }

    try {
      setSending(true);
      await axios.post(`${config.apiUrl}/qubinest/notifications/bulk`, {
        employeeIds: Array.from(selectedEmployees),
        subject: subject.trim(),
        message: message.trim(),
        type: 'GENERAL_MESSAGE'
      });

      toast.success('Notifications sent successfully');
      setMessage('');
      setSubject('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Failed to send notifications');
    } finally {
      setSending(false);
    }
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <html>
        <head>
          <title>Notification Preview</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <h2>${subject}</h2>
          ${message}
        </body>
      </html>
    `);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="send-notification-modal"
    >
      <Box sx={modalStyle}>
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">
            Send Notification
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} className="mb-4">
          <Tab label="Compose" icon={<MailIcon />} iconPosition="start" />
          <Tab label="Preview" icon={<PreviewIcon />} iconPosition="start" />
        </Tabs>

        {activeTab === 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Typography variant="body2" className="text-gray-600">
                Sending to {selectedEmployees.size} selected employee(s)
              </Typography>
              <Button
                onClick={(e) => setTemplateAnchorEl(e.currentTarget)}
                variant="outlined"
                size="small"
                startIcon={<TemplateIcon />}
              >
                Load Template
              </Button>
            </div>

            <Menu
              anchorEl={templateAnchorEl}
              open={Boolean(templateAnchorEl)}
              onClose={() => setTemplateAnchorEl(null)}
            >
              {templates.map((template, index) => (
                <MenuItem 
                  key={index}
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template.name}
                </MenuItem>
              ))}
            </Menu>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <div className="h-[400px]">
              <ReactQuill
                theme="snow"
                value={message}
                onChange={setMessage}
                modules={modules}
                placeholder="Compose your message..."
                className="h-[300px]"
              />
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <div className="border rounded-lg p-4 min-h-[400px] bg-white">
            <h2 className="text-xl font-semibold mb-4">{subject}</h2>
            <div dangerouslySetInnerHTML={{ __html: message }} />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outlined"
            onClick={handlePreview}
            disabled={sending}
            startIcon={<PreviewIcon />}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={sending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default SendNotificationModal; 