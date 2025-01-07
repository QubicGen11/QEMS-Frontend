import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaQuestionCircle, FaTrash, FaExclamation } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

const QuickNotes = () => {
  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem('quickNotes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('quickTodos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [newNote, setNewNote] = useState('');
  const [newTodo, setNewTodo] = useState('');
  const [todoPriority, setTodoPriority] = useState('medium');

  // Save to localStorage whenever notes or todos change
  useEffect(() => {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
    localStorage.setItem('quickTodos', JSON.stringify(todos));
  }, [notes, todos]);

  const addNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      content: newNote.trim(),
      timestamp: new Date().toISOString()
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const todo = {
      id: Date.now(),
      content: newTodo.trim(),
      priority: todoPriority,
      completed: false,
      timestamp: new Date().toISOString()
    };
    
    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
    setTodoPriority('medium');
  };

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // Add clear all function
  const clearAllTodos = () => {
    if (window.confirm('Are you sure you want to clear all todos?')) {
      setTodos([]);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Quick Notes Section */}
      
        {/* Todo List Section */}
        <div className="bg-white/80 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Prioritized To-Do</h2>
              <FaQuestionCircle 
                className="text-gray-400 cursor-help"
                data-tooltip-id="todo-tooltip"
              />
              <Tooltip 
                id="todo-tooltip"
                content="Tasks are sorted by priority and stored locally in your browser"
                place="top"
              />
            </div>
            {/* Add Clear All button */}
            {todos.length > 0 && (
              <button
                onClick={clearAllTodos}
                className="px-3 py-1 text-sm text-red-500 hover:text-red-600 
                         hover:bg-red-50 rounded-md transition-colors duration-200
                         flex items-center gap-1"
              >
                <FaTrash size={12} />
                Clear All
              </button>
            )}
          </div>

          <form onSubmit={addTodo} className="mb-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a task..."
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none 
                           focus:border-emerald-500 transition-colors"
                />
                <select
                  value={todoPriority}
                  onChange={(e) => setTodoPriority(e.target.value)}
                  className="p-2 border border-gray-200 rounded-lg focus:outline-none 
                           focus:border-emerald-500 transition-colors"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <button
                  type="submit"
                  disabled={!newTodo.trim()}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg 
                           hover:bg-emerald-600 transition-colors disabled:opacity-50"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            <AnimatePresence>
              {todos
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map(todo => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`group flex items-center gap-3 p-3 rounded-lg
                              ${todo.completed ? 'bg-gray-50' : 'bg-white border border-gray-100'}`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-500 
                               focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {todo.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full
                        ${todo.priority === 'high' ? 'bg-red-100 text-red-600' :
                          todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'}`}>
                        {todo.priority}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 
                                 hover:text-red-600 transition-opacity"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickNotes; 