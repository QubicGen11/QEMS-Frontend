import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLightbulb, FaTimes, FaPaperPlane, FaQuestionCircle, FaEye } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import axios from 'axios';
import { toast } from 'react-toastify';
import config from '../config';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AnonymousSuggestion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  // Fetch suggestions from API
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${config.apiUrl}/qubinest/api/suggestions`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast.error('Failed to load suggestions');
      } finally {
        setIsLoading(false);
      }
    };

    if (isViewMode) {
      fetchSuggestions();
    }
  }, [isViewMode]);

  // Submit new suggestion
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${config.apiUrl}/qubinest/api/suggestions`, {
        content: suggestion.trim(),
        category
      });

      setSuggestions(prev => [response.data, ...prev]);
      toast.success('Suggestion submitted anonymously!');
      setSuggestion('');
      setCategory('general');
      setIsOpen(false);
    } catch (error) {
      console.error('Suggestion submission error:', error);
      toast.error('Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-600',
      workplace: 'bg-green-100 text-green-600',
      process: 'bg-purple-100 text-purple-600',
      culture: 'bg-yellow-100 text-yellow-600',
      other: 'bg-gray-100 text-gray-600'
    };
    return colors[category] || colors.other;
  };

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-10"
    >
      <FaLightbulb className="mx-auto text-4xl text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-600 mb-2">
        No suggestions yet
      </h3>
      <p className="text-gray-500 mb-4">
        Be the first to share your thoughts anonymously!
      </p>
      <button
        onClick={() => {
          setIsViewMode(false);
          setIsOpen(true);
        }}
        className="px-4 py-2 bg-indigo-500 text-white rounded-lg 
                   hover:bg-indigo-600 transition-colors inline-flex 
                   items-center gap-2"
      >
        <FaPaperPlane />
        Share a Suggestion
      </button>
    </motion.div>
  );

  const LoadingState = () => (
    <div className="flex items-center justify-center py-10">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <>
      {/* Floating Buttons */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-4">
        <button
          onClick={() => {
            setIsViewMode(true);
            setIsOpen(true);
          }}
          className="p-4 bg-emerald-500 text-white rounded-full 
                     shadow-lg hover:bg-emerald-600 transition-all duration-200 
                     hover:scale-110 z-[1]"
          data-tooltip-id="view-tooltip"
        >
          <FaEye className="text-xl" />
        </button>

        <button
          onClick={() => {
            setIsViewMode(false);
            setIsOpen(true);
          }}
          className="p-4 bg-indigo-500 text-white rounded-full 
                     shadow-lg hover:bg-indigo-600 transition-all duration-200 
                     hover:scale-110 z-[3]"
          data-tooltip-id="suggestion-tooltip"
        >
          <FaLightbulb className="text-xl" />
        </button>
      </div>

      <Tooltip id="view-tooltip" className='z-[9999]' place="left">
        View anonymous suggestions
      </Tooltip>

        <Tooltip id="suggestion-tooltip" place="left">
        Share your suggestions anonymously
      </Tooltip>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[1002] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => {
                setIsOpen(false);
                setSelectedSuggestion(null);
              }}
            />

            {/* Modal Content */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  {isViewMode ? <FaEye className="text-emerald-500" /> : <FaLightbulb className="text-indigo-500" />}
                  <h2 className="text-lg font-semibold text-gray-800">
                    {isViewMode ? 'Anonymous Suggestions' : 'Anonymous Suggestion Box'}
                  </h2>
                  <div className="relative">
                    <FaQuestionCircle 
                      className="text-gray-400 cursor-help"
                      data-tooltip-id="anon-info-tooltip"
                      data-tooltip-place="right"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedSuggestion(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {isViewMode ? (
                  isLoading ? (
                    <LoadingState />
                  ) : suggestions.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <AnimatePresence>
                        {suggestions.map((item) => (
                          <motion.div
                            key={item.id}
                            layoutId={`suggestion-${item.id}`}
                            onClick={() => setSelectedSuggestion(item)}
                            className={`p-4 rounded-lg shadow-md cursor-pointer 
                                      hover:shadow-lg transition-shadow
                                      ${getCategoryColor(item.category)}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="text-sm font-medium mb-2">
                              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                            </div>
                            <p className="text-sm truncate">Click to reveal</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )
                ) : (
                  // Your existing form JSX
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none 
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="general">General Improvement</option>
                        <option value="workplace">Workplace</option>
                        <option value="process">Process Improvement</option>
                        <option value="culture">Company Culture</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your Suggestion
                      </label>
                      <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none 
                                 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                                 min-h-[120px] resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!suggestion.trim() || isSubmitting}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg 
                                 hover:bg-indigo-600 transition-colors flex items-center gap-2
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaPaperPlane />
                        {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Suggestion Popup */}
      <AnimatePresence>
        {selectedSuggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[1003] flex items-center justify-center p-4"
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full relative"
              layoutId={`suggestion-${selectedSuggestion.id}`}
            >
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 
                             ${getCategoryColor(selectedSuggestion.category)}`}>
                {selectedSuggestion.category}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedSuggestion.content}</p>
              <div className="mt-4 text-sm text-gray-500">
                Submitted on {new Date(selectedSuggestion.timestamp).toLocaleDateString()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tooltip 
        id="anon-info-tooltip"
        place="right"
        className="z-[1005]"
        style={{
          backgroundColor: '#333',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '14px',
          maxWidth: '250px'
        }}
      >
        Your suggestion will be submitted anonymously. No identifying information is stored.
      </Tooltip>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </>
  );
};

export default AnonymousSuggestion; 