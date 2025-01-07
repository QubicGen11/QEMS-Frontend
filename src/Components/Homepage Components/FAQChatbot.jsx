import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaUser, FaPaperPlane } from 'react-icons/fa';

// Initialize the Gemini AI with safety settings
const genAI = new GoogleGenerativeAI('AIzaSyCBaVGevet0hoQL8Z_5gkHobZiquJgUt_E');

const MODEL_NAME = "gemini-pro";
const SAFETY_SETTINGS = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE",
  },
];

const FAQChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your QubicGen assistant. How can I help you today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Initialize the model with safety settings
      const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        safetySettings: SAFETY_SETTINGS,
      });

      // Create initial prompt to set context
      const prompt = `You are a helpful assistant for QubicGen Software Solutions. 
                     You help employees with their queries about the company, HR policies, 
                     and general work-related questions. 
                     Keep responses concise and professional.
                     Query: ${inputMessage}`;

      // Generate response
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      if (response && response.text) {
        const botMessage = {
          role: 'assistant',
          content: response.text()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('No response generated');
      }

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // More specific error handling
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message?.includes('API key')) {
        errorMessage = 'API key error. Please contact support.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 p-4 bg-emerald-500 text-white rounded-full 
                   shadow-lg hover:bg-emerald-600 transition-all duration-200 
                   hover:scale-110 z-50"
      >
        <FaRobot className="text-xl" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 left-4 w-96 h-[600px] bg-white rounded-2xl 
                     shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-200"
          >
            {/* Header */}
            <div className="bg-emerald-500 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FaRobot className="text-white text-xl" />
                <h3 className="text-white font-medium">QubicGen Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-emerald-600 p-2 rounded-full transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                  ${message.role === 'user' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                      {message.role === 'user' ? (
                        <FaUser className="text-white text-sm" />
                      ) : (
                        <FaRobot className="text-white text-sm" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none 
                           focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FAQChatbot; 