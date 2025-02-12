import React, { useState, useEffect } from 'react';
import {

  PlusCircle,
  Edit,
  Trash2,
  Search,
  X,
  ChevronDown,
  FileText,
  Upload,
  Columns,
  Download
} from 'lucide-react';
import cookie from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import InfoTiles from './InfoTiles';
import config from '../config';

const API_BASE_URL = `${config.apiUrl}/qems/cms`;
// const Api = `{${config.apiUrl}/`


const CMSDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Add this line
  const [isValidating, setIsValidating] = useState(false); // Add this line
  const [isDeleting, setIsDeleting] = useState(null); // Add this line
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
  const [isImporting, setIsImporting] = useState(false); // Add this line
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [validationResult, setValidationResult] = useState({ validEntries: [], invalidEntries: [] });
  const [user, setUser] = useState(null);
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = useState(null);
  const [comments, setComments] = useState([]);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [currentComments, setCurrentComments] = useState([]);
  const [logs, setLogs] = useState([]);
  const callStatusOptions = ["NONE", "ANSWERED", "UNANSWERED", "SWITCH_OFF", "BUSY", "NOT_REACHABLE"];
  const followUpStatusOptions = ["NEW", "INTERESTED", "NOT_INTERESTED", "FOLLOW_UP", "COMPLETE"];
  const [rowsPerPage, setRowsPerPage] = useState(25); // Default to 25 rows per page
  const [logCurrentPage, setLogCurrentPage] = useState(1);
  const [logEntriesPerPage] = useState(5); // Set the number of logs per page

  const [executives, setExecutives] = useState([]);
  const [searchExecutive, setSearchExecutive] = useState('');
  const [filteredExecutives, setFilteredExecutives] = useState([]);

  const [stats, setStats] = useState({
    totalCompleted: 0,
    activeContacts: 0,
    pendingFollowUp: 0,
    assignedLeads: 0,
    totalLeads: 0
  });


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
    actions: true,
    name: true,
    email: true,
    contact: false,
    branch: false,
    comfortableLanguage: false,
    assignedTo: false,
    callStatus: false,
    status: false,
    createdByUserId: false,
    createdAt: false,
    comments: false,
    updatedAt: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  // Column definitions
  const columns = [
    { id: 'actions', label: 'Actions' },
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

  ];

  // Toggle column visibility
  const toggleColumn = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  // Effect to reset column visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 400) {
        // Mobile view: Force Actions, Name, and Email to be visible
        setVisibleColumns((prev) => ({
          ...prev,
          actions: true,
          name: true,
          email: true,
        }));
      } else {
        // Medium and larger views: Allow all columns to be customizable
        setVisibleColumns((prev) => ({
          ...prev,
          actions: prev.actions,
          name: prev.name,
          email: prev.email,
          comfortableLanguage: true,
          assignedTo: true,
          callStatus: true,
          status: true,
          createdByUserId: true,
        }));
      }
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Initial call to set the correct visibility
    handleResize();

    // Cleanup event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const indexOfLastLog = logCurrentPage * logEntriesPerPage;
  const indexOfFirstLog = indexOfLastLog - logEntriesPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalLogPages = Math.ceil(logs.length / logEntriesPerPage);


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
    setIsSubmitting(true);
    try {
      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Ensure assignedTo is included in the payload
      const payload = {
        ...formData,
        assignedTo: formData.assignedTo || user.email // Fallback to user.email if not set
      };

      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Email or contact number already exists');
        } else {
          throw new Error('Failed to create entry');
        }
      }

      await fetchEntries();
      setIsModalOpen(false);
      resetForm();
      toast.success('Entry created successfully! 🎉');

      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);


    } catch (err) {
      console.error('Create error:', err);
      toast.error(`Failed to create entry: ${err.message}`);
    }
    finally {
      setIsSubmitting(false); // End loading state
    }
  };

  // Update entry
  const handleUpdateEntry = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading state
    try {
      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Status update
      if (formData.callStatus || formData.status) {
        try {
          await axios.put(
            `${API_BASE_URL}/entries/${currentEditId}/status`,
            {
              callStatus: formData.callStatus,
              status: formData.status
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
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
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
      } catch (updateError) {
        toast.error(`Failed to update entry details: ${updateError.message}`);
      }

      await fetchEntries();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Update error:', err);
      toast.error(`Update failed: ${err.message}`);
    } finally {
      setIsSubmitting(false); // End loading state
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
      resetForm();
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

    // Set the default value for assignedTo based on the user's role
    const assignedToValue = user.mainPosition === "Executive" ? user.email : entry.assignedTo;

    setCurrentEditId(entry.id);
    setFormData({
      name: entry.name,
      contact: entry.contact,
      email: entry.email,
      branch: entry.branch,
      comfortableLanguage: entry.comfortableLanguage,
      assignedTo: assignedToValue, // Ensure assignedTo is set here
      callStatus: entry.callStatus || '',
      status: entry.status || '',
      comment: ''
    });

    // Disable fields if user is an Executive


    fetchComments(entry.id);
    setIsModalOpen(true);
    toast.info('Edit mode activated 📝');
  };


  // Reset form
  const resetForm = () => {
    setFormData({
      name: '', contact: '', email: '',
      branch: '', comfortableLanguage: '',
      assignedTo: '', // Ensure this is reset
      callStatus: '', status: '', comment: ''
    });
    setCurrentEditId(null);
    setComments([]);
  };


  const handleFileUpload = async (e) => {
    e.preventDefault();
    setIsValidating(true);
    console.log('File upload initiated');

    try {
      if (!uploadFile) {
        console.warn('No file selected for upload');
        toast.warning('Please select a file to upload');
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadFile);
      console.log('File appended to formData:', uploadFile.name);

      const token = cookie.get('token');
      if (!token) {
        console.error('Authentication token not found');
        toast.error('Authentication token not found');
        return;
      }

      // Validate the file (importData=false)
      const response = await fetch(`${API_BASE_URL}/entries/validateAndImport?importData=false`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      console.log("form data is: " + formData);

      if (!response.ok) {
        console.error('File validation failed with status:', response.status);
        throw new Error('File validation failed');
      }

      const result = await response.json();
      console.log('Validation result:', result);
      setValidationResult(result);

      if (result.validEntries.length === 0) {
        toast.error(`No valid entries found. Check the errors.`);
      } else {
        toast.info(`File validated: ${result.validEntries.length} valid entries found`);

        // **Save file temporarily in local storage**
        localStorage.setItem('uploadedFile', JSON.stringify({
          name: uploadFile.name,
          type: uploadFile.type,
          data: await uploadFile.arrayBuffer() // Convert file to array buffer for storage
        }));
      }

    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`File validation failed: ${err.message}`);
    }
    finally {
      setIsValidating(false); // End validating state
    }
  };

  // **Handle Import with File Retrieval**
  const handleFileImport = async () => {
    setIsImporting(true);
    try {
      if (!validationResult?.validEntries?.length) {
        toast.warning('No valid entries to import');
        return;
      }

      const token = cookie.get('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Get the actual file, not the stored data
      if (!uploadFile) {
        toast.error('No file selected');
        return;
      }

      const formData = new FormData();
      formData.append('file', uploadFile); // Append actual file object
      formData.append('validEntries', JSON.stringify(validationResult.validEntries));

      const response = await fetch(`${API_BASE_URL}/entries/validateAndImport?importData=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Remove Content-Type header - let browser set it with boundary
        },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Import failed');
      }

      await fetchEntries();
      setIsUploadModalOpen(false);
      setValidationResult({ validEntries: [], invalidEntries: [] });
      setUploadFile(null);
      localStorage.removeItem('uploadedFile');

      toast.success('Entries imported successfully!');

    } catch (err) {
      console.error('Import error:', err);
      toast.error(`Import failed: ${err.message}`);
    }
    finally {
      setIsImporting(false); // End importing state
    }
  };




  // ... existing code ...

  // ... existing code ...


  const fetchExecutives = async () => {
    try {
      const token = cookie.get('token');
      const response = await fetch(`${API_BASE_URL}/users/lead-gen-executives`, {
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



  // Add function to fetch logs
  const fetchLogs = async () => {
    try {
      const token = cookie.get('token');
      const response = await fetch(`${API_BASE_URL}/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      // toast.error('Failed to fetch activity logs');
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchEntries();
    fetchExecutives();

    console.log("Fetching logs...");
    fetchLogs();
  }, []);

  // Update useEffect to fetch logs when tab changes
  useEffect(() => {
    if (activeTab === 'logs' && user?.role === 'Admin') {
      console.log("Logs are commng")
      fetchLogs();
    }


  }, [activeTab]);

  // Filtered entries logic


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
      if (a[sortConfig.key] === null) return 1;
      if (b[sortConfig.key] === null) return -1;

      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        return sortConfig.direction === 'asc'
          ? new Date(aVal) - new Date(bVal)
          : new Date(bVal) - new Date(aVal);
      }

      return sortConfig.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  };

  // const filteredAndSortedEntries = React.useMemo(() => {
  //   let result = getFilteredContacts();  // Apply filters first
  //   return sortEntries(result);          // Then apply sorting
  // }, [entries, activeTab, filters, sortConfig]);

  //   // Filter and sort entries
  //   const filteredAndSortedEntries = React.useMemo(() => {
  //     let result = entries.filter(entry => {
  //       const matchesSearch = Object.values(entry).some(val => 
  //         val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //       );

  //       const matchesFilters = Object.entries(filters).every(([key, value]) => 
  //         !value || entry[key]?.toString().toLowerCase() === value.toLowerCase()
  //       );

  //       return matchesSearch && matchesFilters;
  //     });

  //     return sortEntries(result);
  //   }, [entries, searchTerm, filters, sortConfig]);

  const filteredAndSortedEntries = React.useMemo(() => {
    let result = entries.filter(entry => {
      // Active tab filter
      if (activeTab === 'active' && entry.status === 'COMPLETE') {
        return false;
      }

      // Search filter
      const matchesSearch = searchTerm ?
        Object.values(entry).some(val =>
          val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        ) : true;

      // Custom filters
      const matchesFilters = Object.entries(filters).every(([key, value]) =>
        !value || entry[key]?.toString().toLowerCase() === value.toLowerCase()
      );

      return matchesSearch && matchesFilters;
    });

    return sortEntries(result);
  }, [entries, activeTab, searchTerm, filters, sortConfig]);

  // Calculate current entries and total pages based on rowsPerPage
  const indexOfLastEntry = currentPage * rowsPerPage;
  const indexOfFirstEntry = indexOfLastEntry - rowsPerPage;
  const currentEntries = filteredAndSortedEntries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredAndSortedEntries.length / rowsPerPage);

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

  // Function to calculate stats from filtered entries
  const calculateStats = (entries) => {
    const totalCompleted = entries.filter(entry => entry.status === 'COMPLETE').length;
    const activeContacts = entries.filter(entry => entry.status === 'INTERESTED' || entry.status === 'FOLLOW_UP').length;
    const pendingFollowUp = entries.filter(entry => entry.status === 'FOLLOW_UP').length;
    const assignedLeads = entries.filter(entry => entry.assignedTo).length;
    const totalLeads = entries.length;

    setStats({
      totalCompleted,
      activeContacts,
      pendingFollowUp,
      assignedLeads,
      totalLeads
    });
  };

  // Call calculateStats whenever filteredAndSortedEntries changes
  useEffect(() => {
    calculateStats(filteredAndSortedEntries);
  }, [filteredAndSortedEntries]);

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
        // toast.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      // toast.error('Error loading comments');
    }
  };



  const isExecutive = () => {
    const token = cookie.get('token');
    if (!token) return false;
    const user = jwtDecode(token);
    return user.mainPosition?.toLowerCase() === 'executive';
  };

  // Update the getFilteredContacts function



  // Update the table rendering section to handle logs
  const renderTableContent = () => {
    if (activeTab === 'logs') {
      return (
        <div>
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">Action</th>
                <th className="px-2 py-1 border">Details</th>
                <th className="px-2 py-1 border">Performed By</th>
                <th className="px-2 py-1 border">Department</th>
                <th className="px-2 py-1 border">Role</th>
                <th className="px-2 py-1 border">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-2 py-1 border">{log.action}</td>
                  <td className="px-2 py-1 border">{log.details}</td>
                  <td className="px-2 py-1 border">{log.performedBy}</td>
                  <td className="px-2 py-1 border">{log.department}</td>
                  <td className="px-2 py-1 border">{log.role}</td>
                  <td className="px-2 py-1 border">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination for Logs */}
          <div className="flex justify-center items-center space-x-4 mt-4 text-xs">
            <button
              onClick={() => setLogCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={logCurrentPage === 1}
              className={`px-3 py-1 rounded ${logCurrentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0865b3] text-white hover:bg-blue-600'
                }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              <span className="font-medium">{logCurrentPage}</span>
              <span className="text-gray-500">of</span>
              <span className="font-medium">{totalLogPages}</span>
              <span className="text-gray-500 ml-2">
                ({logs.length} total logs)
              </span>
            </div>

            <button
              onClick={() => setLogCurrentPage(prev => Math.min(prev + 1, totalLogPages))}
              disabled={logCurrentPage === totalLogPages}
              className={`px-3 py-1 rounded ${logCurrentPage === totalLogPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#0865b3] text-white hover:bg-blue-600'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      );
    }


    // Fetch stats data from API (example function)





    // Return existing table for active and all tabs
    return (
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
              {visibleColumns.actions && (
                <td className="px-2 py-1 border flex  justify-center">
                  <div className="flex space-x-1">
                    {entry.status !== 'COMPLETE' || user.mainPosition !== 'Executive' ? (
                      <button
                        onClick={() => openEditModal(entry)}
                        className="text-blue-500 hover:bg-blue-100 p-0.5 rounded"
                      >
                        <Edit size={14} />
                      </button>
                    ) : (
                      <button
                        disabled
                        title="Cannot edit a completed entry"
                        className="text-blue-500 bg-blue-100 p-0.5 rounded cursor-not-allowed"
                      >
                        <Edit size={14} />
                      </button>
                    )}


                    {user.mainPosition !== 'Executive' && (
                      <button
                        onClick={async () => {
                          setIsDeleting(entry.id); // Start deleting state for this entry
                          await handleDeleteEntry(entry.id); // Perform the delete operation
                          setIsDeleting(null); // End deleting state
                        }}
                        className="text-red-500 hover:bg-red-100 p-0.5 rounded"
                        disabled={isDeleting === entry.id} // Disable the button while deleting
                      >
                        {isDeleting === entry.id ? (
                          <div className="size-4 animate-spin rounded-full border-2 border-red-500 border-t-white"></div>
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}




                  </div>
                </td>
              )}
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

            </tr>
          ))}
        </tbody>
      </table>
    );








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
      <div className="relative w-80  mt-0">
        <input
          type="text"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-1 border rounded-lg"
        />
        <Search className="absolute left-3 top-2 text-gray-400" size={20} />
      </div>
      <div className="container mx-auto px-2 py-4">


        {/* Modal - Same as previous implementation */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg relative w-[90vw] sm:w-[80vw] md:w-[60vw] lg:w-[40vw] h-[80vh] flex flex-col">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">
                {currentEditId ? 'Edit Entry' : 'Add New Entry'}
              </h2>

              <div className="flex-1 overflow-y-auto">

                <form onSubmit={currentEditId ? handleUpdateEntry : handleCreateEntry}>

                  <div className="space-y-4">
                    {/* First Row - Name and Contact */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className='text-red-500'>*</span></label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                ${disabledFields.name ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder='Enter Lead Name'
                          disabled={disabledFields.name}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact <span className='text-red-500'>*</span></label>
                        <input
                          type="text"
                          value={formData.contact}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow only numbers and limit to 10 digits
                            if (/^\d{0,10}$/.test(value)) {
                              setFormData({ ...formData, contact: value });
                            }
                          }}
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
    ${disabledFields.contact ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          disabled={disabledFields.contact}
                          placeholder='Enter Lead Contact Number'
                          pattern="\d{10}" // Ensure exactly 10 digits
                          required
                        />
                        {formData.contact.length !== 10 && formData.contact.length > 0 && (
                          <p className="text-xs text-red-500 mt-1">Contact number must be exactly 10 digits.</p>
                        )}
                      </div>
                    </div>

                    {/* Second Row - Email and Branch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className='text-red-500'>*</span></label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                ${disabledFields.email ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          disabled={disabledFields.email}
                          placeholder='Enter Lead Email Address'
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch <span className='text-red-500'>*</span></label>
                        <input
                          type="text"
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                ${disabledFields.branch ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          disabled={disabledFields.branch}
                          placeholder='Enter Lead Stream (Eg:EEE,CSE)'
                          required
                        />
                      </div>
                    </div>

                    {/* Third Row - Comfortable Language and Assigned To */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comfortable Language <span className='text-red-500'>*</span></label>
                        <input
                          type="text"
                          value={formData.comfortableLanguage}
                          onChange={(e) => setFormData({ ...formData, comfortableLanguage: e.target.value })}
                          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
                ${disabledFields.comfortableLanguage ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          disabled={disabledFields.comfortableLanguage}
                          placeholder='Eg : HINDI,TELUGU,ENGLISH '
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={user.mainPosition === "Executive" ? user.email : formData.assignedTo}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSearchExecutive(value); // Update the search input
                              if (user.mainPosition !== "Executive") {
                                const filtered = executives.filter(exec =>
                                  exec.email.toLowerCase().includes(value.toLowerCase()) ||
                                  exec.username.toLowerCase().includes(value.toLowerCase())
                                );
                                setFilteredExecutives(filtered);
                              }
                              // Always update formData with the current input value
                              setFormData({ ...formData, assignedTo: value });
                            }}
                            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 
      ${disabledFields.assignedTo || user.mainPosition === "Executive" ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            disabled={disabledFields.assignedTo || user.mainPosition === "Executive"}
                            placeholder="Search by name or email..."
                          />
                          {searchExecutive && user.mainPosition !== "Executive" && filteredExecutives.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white rounded-md max-h-60 overflow-auto">
                              {filteredExecutives.map((exec) => (
                                <div
                                  key={exec.employeeId}
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => {
                                    setFormData({ ...formData, assignedTo: exec.email }); // Update formData with selected email
                                    setSearchExecutive(exec.email);
                                    setFilteredExecutives([]); // Close dropdown
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Call Status {currentEditId && <span className='text-red-500 ml-1'>*</span>}
                        </label>
                        <select
                          value={formData.callStatus}
                          onChange={(e) => setFormData({ ...formData, callStatus: e.target.value })}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                          required={!!currentEditId}
                        >
                          <option value="">Select Call Status</option>
                          {callStatusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status {currentEditId && <span className='text-red-500 ml-1'>*</span>}
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                          required={!!currentEditId}
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
                        {currentEditId && <span className='text-red-500 ml-1'>*</span>} {/* Add asterisk only in edit mode */}
                      </label>
                      <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        required={!!currentEditId} // Required only in edit mode
                      />
                    </div>
                    <div className="sticky bottom-0 bg-white pt-4">
                      <div className='flex justify-center'>

                        <button
                          type="submit"
                          className="bg-[#0865b3] text-white py-1 px-2 rounded hover:bg-blue-600 w-36"
                          disabled={isSubmitting} // Disable the button while submitting
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center space-x-2">
                              <span>Submitting...</span>
                              <div className="w-4 h-4 border-t-transparent rounded-full animate-spin border-2 border-blue-500 border-t-white"></div>
                            </div>
                          ) : (
                            currentEditId ? (
                              <span>Update</span> // Show "Updating..." when in edit mode
                            ) : (
                              'Create'
                            )
                          )}
                        </button>
                      </div>

                    </div>


                  </div>
                </form>
              </div>

              {/* Previous Comments Section */}
              {comments.length > 0 && (
                <div className="mt-4 h-40 overflow-y-auto">
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
            <div className="bg-white p-6 rounded-lg w-full max-w-4xl relative">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setValidationResult({ validEntries: [], invalidEntries: [] }); // Reset validation result to an empty object
                }}
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
                <div className='flex justify-end'>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    disabled={isValidating} // Disable the button while validating
                  >
                    {isValidating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Validating...</span>
                        <div className="mr-3 size-5 animate-spin rounded-full border-2 border-blue-500 border-t-white"></div>
                      </div>
                    ) : (
                      'Validate File'
                    )}
                  </button>

                </div>
              </form>
              {validationResult && (
                <div className="mt-4">
                  <h3 className="text-lg font-bold mb-4">Validation Result</h3>
                  <div className="flex space-x-6 mb-4 text-sm">
                    <div>
                      <span className="font-medium">Total Entries:</span> {validationResult.validEntries.length + validationResult.invalidEntries.length}
                    </div>
                    <div>
                      <span className="font-medium text-green-500">Success Count:</span> {validationResult.validEntries.length}
                    </div>
                    <div>
                      <span className="font-medium text-red-500">Invalid Count:</span> {validationResult.invalidEntries.length}
                    </div>
                  </div>
                  {validationResult.validEntries.length === 0 && validationResult.invalidEntries.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No entries found in the file. Please add rows to the Excel file and try again.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 border">Name</th>
                            <th className="px-2 py-1 border">Contact</th>
                            <th className="px-2 py-1 border">Email</th>
                            <th className="px-2 py-1 border">Branch</th>
                            <th className="px-2 py-1 border">Comfortable Language</th>
                            <th className="px-2 py-1 border">Assigned To</th>
                            <th className="px-2 py-1 border">Status</th>
                            <th className="px-2 py-1 border">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResult.validEntries.map((entry, index) => (
                            <tr key={`valid-${index}`} className="hover:bg-gray-50">
                              <td className="px-2 py-1 border">{entry.name}</td>
                              <td className="px-2 py-1 border">{entry.contact}</td>
                              <td className="px-2 py-1 border">{entry.email}</td>
                              <td className="px-2 py-1 border">{entry.branch}</td>
                              <td className="px-2 py-1 border">{entry.comfortableLanguage}</td>
                              <td className="px-2 py-1 border">{entry.assignedTo}</td>
                              <td className="px-2 py-1 border text-green-500">Valid</td>
                              <td className="px-2 py-1 border">-</td>
                            </tr>
                          ))}
                          {validationResult.invalidEntries.map((entry, index) => (
                            <tr key={`invalid-${index}`} className="hover:bg-gray-50">
                              <td className="px-2 py-1 border">{entry.name}</td>
                              <td className="px-2 py-1 border">{entry.contact}</td>
                              <td className="px-2 py-1 border">{entry.email}</td>
                              <td className="px-2 py-1 border">{entry.branch}</td>
                              <td className="px-2 py-1 border">{entry.comfortableLanguage}</td>
                              <td className="px-2 py-1 border">{entry.assignedTo}</td>
                              <td className="px-2 py-1 border text-red-500">Invalid</td>
                              <td className="px-2 py-1 border">{entry.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className='flex justify-end'>

                    <button
                      onClick={handleFileImport}
                      className="bg-green-500 text-white px-2 py-1 rounded mt-4"
                      disabled={isImporting} // Disable the button while importing
                    >
                      {isImporting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Importing...</span>
                          <div className="mr-3 size-5 animate-spin rounded-full border-2 border-blue-500 border-t-white"></div>
                        </div>
                      ) : (
                        'Import Valid Entries'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content - Similar to previous implementation */}
        <div className="space-y-6">
          {/* Search and Add Button */}
          <div className="flex flex-col md:flex-col justify-between items-center  md:space-y-0 ">

            <div className=''>

              <InfoTiles
                totalCompleted={stats.totalCompleted}
                activeContacts={stats.activeContacts}
                pendingFollowUp={stats.pendingFollowUp}
                assignedLeads={stats.assignedLeads}
                totalLeads={stats.totalLeads}
              />
            </div>
            <div>
              <div className=' flex justify-between w-[74vw]'>


                {/* {!isExecutive() && (
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      className="bg-[#0865b3] hover:bg-blue-600 text-white  py-1 px-2 rounded flex items-center relative top-4 "
                    >
                      <PlusCircle className="mr-2" size={20} />
                      Add Entry
                      <ChevronDown className="ml-2" size={16} />
                    </button>try
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
                )} */}

                <div className="w-full  flex justify-end">

                  <div className='flex gap-2 flex-wrap '>
                    {/* Download Template Button */}
                    <button
                      className="bg-[#0865b3] hover:bg-blue-600 text-white py-1 px-3 rounded flex items-center relative top-4"
                      disabled={isDownloading} // Disable the button while downloading
                      onClick={() => {
                        setIsDownloading(true); // Start downloading state
                        setTimeout(() => setIsDownloading(false), 1000); // Simulate download for 1 second
                      }}
                    >
                      {isDownloading ? (
                        <div className="flex items-center">
                          <div className="mr-3 size-5 animate-spin rounded-full border-2 border-blue-500 border-t-white"></div>
                          <Download className="mr-2" size={20} />
                          <span>Downloading...</span>
                        </div>
                      ) : (
                        <a href="/public/CMC_import_Template_v1.xlsx" download="/public/CMC_import_Template_v1.xlsx" className="flex items-center">
                          <Download className="mr-2" size={20} />
                          <span className="text-white hidden md:inline">Download Template</span>
                        </a>
                      )}
                    </button>

                    {/* Add Entry Button */}
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      className="bg-[#0865b3] hover:bg-blue-600 text-white py-1 px-2 rounded flex items-center relative top-4"
                    >
                      <PlusCircle className="mr-2" size={20} />
                      <span>Add Entry</span> {/* Text always visible */}
                      <ChevronDown className="ml-2" size={16} />
                    </button>
                  </div>


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


              </div>

            </div>
            <div>

            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white p-2 rounded-lg shadow mb-3 text-xs">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">Filters</h3>
              <div className="flex items-center gap-2">
                {/* Mobile Filters Dropdown Toggle */}
                <button
                  onClick={() => setIsFiltersDropdownOpen(!isFiltersDropdownOpen)}
                  className="md:hidden text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 flex items-center"
                >
                  <Columns size={14} className="mr-1" />
                  Filters
                </button>

                {/* Column Selector Button */}
                <button
                  onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
                  className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 flex items-center"
                >
                  <Columns size={14} className="mr-1" />
                  Column Visibility
                </button>
              </div>
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
                        disabled={window.innerWidth < 768 && ['actions', 'name', 'email'].includes(column.id)} // Disable toggling for mobile defaults
                      />
                      <span>{column.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filters for Mobile (Dropdown) */}
            {isFiltersDropdownOpen && (
              <div className="md:hidden bg-white border rounded-md shadow-lg p-2 mt-2">
                <div className="grid grid-cols-1 gap-2">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Status</label>
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
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Call Status</label>
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
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Assigned To</label>
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
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Branch</label>
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
            )}

            {/* Filters for Larger Devices (Normal Layout) */}
            <div className="hidden md:grid grid-cols-1 md:grid-cols-5 gap-2">
              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Status</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Call Status</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Assigned To</label>
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
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Branch</label>
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

          {/* Add this JSX between filters and table */}
          <div className="mb-4">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`${activeTab === 'active'
                    ? 'border-[#0865b3] text-[#0865b3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs`}
                >
                  Active Contacts
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`${activeTab === 'all'
                    ? 'border-[#0865b3] text-[#0865b3]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs`}
                >
                  All Contacts
                </button>
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`${activeTab === 'logs'
                      ? 'border-[#0865b3] text-[#0865b3]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-xs`}
                  >
                    Logs
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Updated Table with truncation */}
          <div className="overflow-x-auto">
            {renderTableContent()}
          </div>

          {/* Pagination Controls */}

          {activeTab !== 'logs' && (
            <div className="flex justify-center items-center space-x-4 mt-4 text-xs ">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0865b3] text-white hover:bg-blue-600'
                  }`}
              >
                Previous
              </button>

              <div className="flex items-center space-x-1">
                <span className="font-medium">{currentPage}</span>
                <span className="text-gray-500">of</span>
                <span className="font-medium">{totalPages}</span>
                <span className="text-gray-500 ml-2 hidden md:block">
                  ({filteredAndSortedEntries.length} total entries)
                </span>
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#0865b3] text-white hover:bg-blue-600'
                  }`}
              >
                Next
              </button>

              {/* Rows Per Page Dropdown */}
              <div className="flex self-end space-x-2 ml-auto">
                {/* <span className="text-gray-500">Rows per page:</span> */}
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to the first page when rows per page changes
                  }}
                  className="p-1 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}


          {filteredAndSortedEntries.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No entries found matching your criteria
            </div>
          )}
        </div>

        {/* Comments Modal */}
        {isCommentsModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-[50vh] overflow-y-auto">
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