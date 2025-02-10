import React, { useState, useEffect } from 'react';
import { 
  Users, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Search, 
  X,
  ChevronDown,
  FileText,
  Upload,
  Columns
} from 'lucide-react';
import cookie from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/qems/cms';

const CMSDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', contact: '', email: '', 
    branch: '', comfortableLanguage: '', 
    assignedTo: '', callStatus: '', status: '', comment: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditId, setCurrentEditId] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [currentComments, setCurrentComments] = useState([]);
  const callStatusOptions = ["ANSWERED", "UNANSWERED", "SWITCH_OFF", "BUSY", "NOT_REACHABLE"];
const followUpStatusOptions = ["INTERESTED", "NOT_INTERESTED", "FOLLOW_UP", "COMPLETE"];
const [executives, setExecutives] = useState([]);
const [searchExecutive, setSearchExecutive] = useState('');
const [filteredExecutives, setFilteredExecutives] = useState([]);
const [disabledFields, setDisabledFields] = useState({
  name: false,
  contact: false,
  email: false,
  branch: false,
  comfortableLanguage: false,
  assignedTo: false,
  callStatus: false,
  status: false,
  comment: false
});
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const [filters, setFilters] = useState({
  status: '',
  callStatus: '',
  assignedTo: '',
  branch: ''
});
const [sortConfig, setSortConfig] = useState({
  key: null,
  direction: 'asc'
});
const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
const [visibleColumns, setVisibleColumns] = useState({
  name: true,
  contact: true,
  email: true,
  branch: true,
  comfortableLanguage: true,
  assignedTo: true,
  callStatus: true,
  status: true,
  createdByUserId: true,
  createdAt: true,
  comments: true,
  updatedAt: true,
  actions: true
});
const [currentPage, setCurrentPage] = useState(1);
const [entriesPerPage] = useState(5);

// Column definitions
const columns = [
  { id: 'name', label: 'Name' },
  { id: 'contact', label: 'Contact' },
  { id: 'email', label: 'Email' },
  { id: 'branch', label: 'Branch' },
  { id: 'comfortableLanguage', label: 'Language' },
  { id: 'assignedTo', label: 'Assigned To' },
  { id: 'callStatus', label: 'Call Status' },
  { id: 'status', label: 'Status' },
  { id: 'createdByUserId', label: 'Created By' },
  { id: 'createdAt', label: 'Created At' },
  { id: 'comments', label: 'Comments' },
  { id: 'updatedAt', label: 'Updated At' },
  { id: 'actions', label: 'Actions' }
];

// Toggle column visibility
const toggleColumn = (columnId) => {
  setVisibleColumns(prev => ({
    ...prev,
    [columnId]: !prev[columnId]
  }));
};

  // Fetch user details
  const fetchUserDetails = async () => {
    try {
      const token = cookie.get('token');
      if (!token) {
        throw new Error('No token found');
      }
  
      const decodedToken = jwtDecode(token);
      setUser(decodedToken);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch entries
  const fetchEntries = async () => {
    try {
      const token = cookie.get('token'); // Assuming token is stored
      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      setEntries(data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch comments for an entry
  const fetchComments = async (entryId) => {
    try {
      const token = cookie.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/entries/${entryId}/comments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        setComments(response.data.data || []);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setComments([]);
      // Don't throw error, just set empty comments
    }
  };
  
  // Create entry
  const handleCreateEntry = async (e) => {
    e.preventDefault();
    try {
      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      await fetchEntries();
      setIsModalOpen(false);
      resetForm();
      toast.success('Entry created successfully! 🎉');
    } catch (err) {
      console.error('Create error:', err);
      toast.error(`Failed to create entry: ${err.message}`);
    }
  };

  // Update entry
  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    try {
      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Status update
      if (formData.callStatus || formData.status) {
        try {
          const statusResponse = await axios.put(
            `${API_BASE_URL}/entries/${currentEditId}/status`,
            {
              callStatus: formData.callStatus,
              status: formData.status
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          // toast.success('Status updated successfully! ��');
        } catch (statusError) {
          toast.error(`Failed to update status: ${statusError.message}`);
        }
      }

      // Comment update
      if (formData.comment?.trim()) {
        try {
          await axios.post(
            `${API_BASE_URL}/entries/${currentEditId}/comments`,
            {
              entryId: currentEditId,
              comment: formData.comment.trim()
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          // toast.success('Comment added successfully! 💬');
        } catch (commentError) {
          toast.error(`Failed to add comment: ${commentError.message}`);
        }
      }

      // General update
      try {
        await axios.put(
          `${API_BASE_URL}/entries/${currentEditId}`,
          {
            name: formData.name,
            contact: formData.contact,
            email: formData.email,
            branch: formData.branch,
            comfortableLanguage: formData.comfortableLanguage,
            assignedTo: formData.assignedTo
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success('Entry details updated successfully! ✨');
      } catch (updateError) {
        toast.error(`Failed to update entry details: ${updateError.message}`);
      }

      await fetchEntries();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Update error:', err);
      toast.error(`Update failed: ${err.message}`);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      await fetchEntries();
      toast.success('Entry deleted successfully! 🗑️');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(`Failed to delete entry: ${err.message}`);
    }
  };

  // Open edit modal
  const openEditModal = (entry) => {
    const token = cookie.get('token');
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const user = jwtDecode(token);
    if (entry.assignedTo !== user.email && 
        user.role !== 'Admin' && 
        user.mainPosition !== 'Lead Generation') {
      toast.warning('You do not have permission to edit this entry');
      return;
    }

    setCurrentEditId(entry.id);
    setFormData({
      name: entry.name,
      contact: entry.contact,
      email: entry.email,
      branch: entry.branch,
      comfortableLanguage: entry.comfortableLanguage,
      assignedTo: entry.assignedTo,
      callStatus: entry.callStatus || '',
      status: entry.status || '',
      comment: ''
    });
    fetchComments(entry.id);
    setIsModalOpen(true);
    toast.info('Edit mode activated 📝');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '', contact: '', email: '', 
      branch: '', comfortableLanguage: '', 
      assignedTo: '', callStatus: '', status: '', comment: ''
    });
    setCurrentEditId(null);
    setComments([]);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      if (!uploadFile) {
        toast.warning('Please select a file to upload');
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadFile);

      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/validate-excel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        throw new Error('File validation failed');
      }

      const result = await response.json();
      setValidationResult(result);
      toast.info(`File validated: ${result.validEntries.length} valid entries found`);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`File upload failed: ${err.message}`);
    }
  };
  
  const handleFileImport = async () => {
    try {
      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/import-excel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validationResult)
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      await fetchEntries();
      setIsUploadModalOpen(false);
      setValidationResult(null);
      setUploadFile(null);
      toast.success('Entries imported successfully! 📥');
    } catch (err) {
      console.error('Import error:', err);
      toast.error(`Import failed: ${err.message}`);
    }
  };

  const fetchExecutives = async () => {
    try {
      const token = cookie.get('token');
      const response = await fetch('http://localhost:3000/qems/cms/users/lead-gen-executives', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch executives');
      const data = await response.json();
      setExecutives(data.data);
    } catch (err) {
      console.error('Error fetching executives:', err);
      toast.error('Failed to fetch executives');
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchEntries();
    fetchExecutives();
  }, []);

  // Filtered entries logic
  const filteredEntries = entries.filter(entry => 
    Object.values(entry).some(val => 
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Add these helper functions
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sorting function
  const sortEntries = (entries) => {
    if (!sortConfig.key) return entries;

    return [...entries].sort((a, b) => {
      // Handle null or undefined values
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;

      // Handle different data types
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      // Handle dates
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        const dateA = new Date(aVal);
        const dateB = new Date(bVal);
        return sortConfig.direction === 'asc' 
          ? dateA - dateB 
          : dateB - dateA;
      }

      // Handle strings (case-insensitive)
      const stringA = String(aVal).toLowerCase();
      const stringB = String(bVal).toLowerCase();
      return sortConfig.direction === 'asc'
        ? stringA.localeCompare(stringB)
        : stringB.localeCompare(stringA);
    });
  };

  // Filter and sort entries
  const filteredAndSortedEntries = React.useMemo(() => {
    let result = entries.filter(entry => {
      const matchesSearch = Object.values(entry).some(val => 
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesFilters = Object.entries(filters).every(([key, value]) => 
        !value || entry[key]?.toString().toLowerCase() === value.toLowerCase()
      );

      return matchesSearch && matchesFilters;
    });

    return sortEntries(result);
  }, [entries, searchTerm, filters, sortConfig]);

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredAndSortedEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredAndSortedEntries.length / entriesPerPage);

  // Pagination controls
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen text-red-500">
      Error: {error}
    </div>
  );

  const openCommentsModal = async (entryId) => {
    try {
      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Fetch comments for the entry
      const response = await axios.get(`${API_BASE_URL}/entries/${entryId}/comments`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        setCurrentComments(response.data.data || []);
        setIsCommentsModalOpen(true);
      } else {
        toast.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error loading comments');
    }
  };

  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
    setCurrentComments([]);
  };

  const isExecutive = () => {
    const token = cookie.get('token');
    if (!token) return false;
    const user = jwtDecode(token);
    return user.mainPosition?.toLowerCase() === 'executive';
  };

  return (
    <>
         {/* Add ToastContainer at the top level of your component */}
         <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999, width: 'auto' }}
      />
    <div className="container mx-auto px-2 py-4">
      {/* Modal - Same as previous implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg relative h-[80vh] w-[40vw] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {currentEditId ? 'Edit Entry' : 'Add New Entry'}
            </h2>
            <form onSubmit={currentEditId ? handleUpdateEntry : handleCreateEntry}>
              <div className="space-y-4">
                {/* First Row - Name and Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                        ${disabledFields.name ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={disabledFields.name}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact
                    </label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                        ${disabledFields.contact ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={disabledFields.contact}
                      required
                    />
                  </div>
                </div>

                {/* Second Row - Email and Branch */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                        ${disabledFields.email ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={disabledFields.email}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({...formData, branch: e.target.value})}
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                        ${disabledFields.branch ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={disabledFields.branch}
                      required
                    />
                  </div>
                </div>

                {/* Third Row - Comfortable Language and Assigned To */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comfortable Language
                    </label>
                    <input
                      type="text"
                      value={formData.comfortableLanguage}
                      onChange={(e) => setFormData({...formData, comfortableLanguage: e.target.value})}
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                        ${disabledFields.comfortableLanguage ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      disabled={disabledFields.comfortableLanguage}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchExecutive}
                        onChange={(e) => {
                          setSearchExecutive(e.target.value);
                          const filtered = executives.filter(exec => 
                            exec.email.toLowerCase().includes(e.target.value.toLowerCase()) ||
                            exec.username.toLowerCase().includes(e.target.value.toLowerCase())
                          );
                          setFilteredExecutives(filtered);
                        }}
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                          ${disabledFields.assignedTo ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        disabled={disabledFields.assignedTo}
                        placeholder="Search by name or email..."
                      />
                      {searchExecutive && (
                        <div className="absolute z-10 w-full mt-1 bg-white  rounded-md  max-h-60 overflow-auto">
                          {filteredExecutives.map((exec) => (
                            <div
                              key={exec.employeeId}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                setFormData({...formData, assignedTo: exec.email});
                                setSearchExecutive(exec.email);
                                setFilteredExecutives([]);
                              }}
                            >
                              <div>{exec.username}</div>
                              <div className="text-sm text-gray-500">{exec.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fourth Row - Call Status and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Call Status
                    </label>
                    <select
                      value={formData.callStatus}
                      onChange={(e) => setFormData({...formData, callStatus: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Call Status</option>
                      {callStatusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Status</option>
                      {followUpStatusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Comment Field - Full Width */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({...formData, comment: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  {currentEditId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>

            {/* Previous Comments Section */}
            {comments.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-bold">Previous Comments</h3>
                <ul className="list-disc pl-5">
                  {comments.map((comment, index) => (
                    <li key={index} className="mt-2">
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                      <p className="text-xs text-gray-500">
                        Posted by {comment.postedByUserId} on {new Date(comment.postedAt).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button 
              onClick={() => setIsUploadModalOpen(false)} 
              className="absolute top-4 right-4"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4">Upload Excel File</h2>
            <form onSubmit={handleFileUpload}>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full p-2 border rounded mb-4"
                required
              />
              <button 
                type="submit" 
                className="bg-blue-500 text-white p-2 rounded"
              >
                Validate File
              </button>
            </form>
            {validationResult && (
              <div className="mt-4">
                <h3 className="text-lg font-bold">Validation Result</h3>
                <p>Valid Entries: {validationResult.validEntries.length}</p>
                <p>Invalid Entries: {validationResult.invalidEntries.length}</p>
                <button 
                  onClick={handleFileImport} 
                  className="bg-green-500 text-white p-2 rounded mt-2"
                >
                  Import Valid Entries
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Similar to previous implementation */}
      <div className="space-y-6">
        {/* Search and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="relative w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search entries..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          </div>
          {!isExecutive() && (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                className="bg-[#0865b3] hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              >
                <PlusCircle className="mr-2" size={20} />
                Add Entry
                <ChevronDown className="ml-2" size={16} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                  <button 
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    <FileText className="mr-2" size={16} />
                    Single Entry
                  </button>
                  <button 
                    onClick={() => {
                      setIsUploadModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-t"
                  >
                    <Upload className="mr-2" size={16} />
                    Multiple Entries
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white p-2 rounded-lg shadow mb-3 text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">Filters</h3>
            <button 
              onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
              className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 flex items-center"
            >
              <Columns size={14} className="mr-1" />
              Column Visibility
            </button>
          </div>

          {/* Column Selector Dropdown */}
          {isColumnSelectorOpen && (
            <div className="absolute right-4 mt-1 bg-white border rounded-md shadow-lg p-2 z-50">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {columns.map(column => (
                  <label key={column.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.id]}
                      onChange={() => toggleColumn(column.id)}
                      className="form-checkbox h-3 w-3"
                    />
                    <span>{column.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full p-1 text-xs border rounded focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                {followUpStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Call Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Call Status
              </label>
              <select
                value={filters.callStatus}
                onChange={(e) => handleFilterChange('callStatus', e.target.value)}
                className="w-full p-1 text-xs border rounded focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Call Status</option>
                {callStatusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Assigned To Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Assigned To
              </label>
              <select
                value={filters.assignedTo}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                className="w-full p-1 text-xs border rounded focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Executives</option>
                {executives.map(exec => (
                  <option key={exec.email} value={exec.email}>{exec.username}</option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                Branch
              </label>
              <select
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="w-full p-1 text-xs border rounded focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Branches</option>
                {[...new Set(entries.map(entry => entry.branch))].map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Updated Table with truncation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100">
                {columns.map(column => visibleColumns[column.id] && (
                  <th 
                    key={column.id}
                    className="px-2 py-1 border cursor-pointer hover:bg-gray-200 text-xs font-medium"
                    onClick={() => handleSort(column.id)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      <span className="text-gray-400">
                        {sortConfig.key === column.id ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '↕'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  {visibleColumns.name && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[150px] truncate" title={entry.name}>
                        {entry.name}
                      </div>
                    </td>
                  )}
                  {visibleColumns.contact && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={entry.contact}>
                        {entry.contact}
                      </div>
                    </td>
                  )}
                  {visibleColumns.email && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[150px] truncate" title={entry.email}>
                        {entry.email}
                      </div>
                    </td>
                  )}
                  {visibleColumns.branch && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={entry.branch}>
                        {entry.branch}
                      </div>
                    </td>
                  )}
                  {visibleColumns.comfortableLanguage && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={entry.comfortableLanguage}>
                        {entry.comfortableLanguage}
                      </div>
                    </td>
                  )}
                  {visibleColumns.assignedTo && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={entry.assignedTo}>
                        {entry.assignedTo}
                      </div>
                    </td>
                  )}
                  {visibleColumns.callStatus && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={entry.callStatus}>
                        {entry.callStatus}
                      </div>
                    </td>
                  )}
                  {visibleColumns.status && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={entry.status}>
                        {entry.status}
                      </div>
                    </td>
                  )}
                  {visibleColumns.createdByUserId && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={entry.createdByUserId}>
                        {entry.createdByUserId}
                      </div>
                    </td>
                  )}
                  {visibleColumns.createdAt && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={new Date(entry.createdAt).toLocaleString()}>
                        {new Date(entry.createdAt).toLocaleString()}
                      </div>
                    </td>
                  )}
                  {visibleColumns.comments && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate">
                        {entry.comments?.length > 0 ? (
                          <button 
                            onClick={() => openCommentsModal(entry.id)}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          >
                            Show Comments
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs">No Comments</span>
                        )}
                      </div>
                    </td>
                  )}
                  {visibleColumns.updatedAt && (
                    <td className="px-2 py-1 border">
                      <div className="max-w-[100px] truncate" title={new Date(entry.updatedAt).toLocaleString()}>
                        {new Date(entry.updatedAt).toLocaleString()}
                      </div>
                    </td>
                  )}
                  {visibleColumns.actions && (
                    <td className="px-2 py-1 border">
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => openEditModal(entry)}
                          className="text-blue-500 hover:bg-blue-100 p-0.5 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-500 hover:bg-red-100 p-0.5 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center space-x-4 mt-4 text-xs">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Previous
          </button>

          <div className="flex items-center space-x-1">
            <span className="font-medium">{currentPage}</span>
            <span className="text-gray-500">of</span>
            <span className="font-medium">{totalPages}</span>
            <span className="text-gray-500 ml-2">
              ({filteredAndSortedEntries.length} total entries)
            </span>
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Next
          </button>
        </div>

        {filteredAndSortedEntries.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No entries found matching your criteria
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {isCommentsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Comments History</h3>
              <button 
                onClick={() => setIsCommentsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {currentComments.length > 0 ? (
              <div className="space-y-3">
                {currentComments.map((comment, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{comment.postedByUsername || comment.postedByUserId}</span>
                      <span>{new Date(comment.postedAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm mt-1">{comment.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No comments available</p>
            )}
          </div>
        </div>
      )}
    </div>
    
    </>
  );
};

export default CMSDashboard;