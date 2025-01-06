import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPalette, FaImage, FaTimes, FaUpload } from 'react-icons/fa';

const ThemeSelector = ({ isOpen, onClose, onSelectTheme, currentTheme }) => {
  const [activeTab, setActiveTab] = useState('colors');
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        onSelectTheme({
          type: 'image',
          value: e.target?.result || '',
          isCustom: true,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const colors = [
    // Vibrant Gradients
    { name: 'Cosmic', value: 'linear-gradient(to right, #ff00cc, #333399)' },
    { name: 'Sunset', value: 'linear-gradient(to right, #ff416c, #ff4b2b)' },
    { name: 'Ocean', value: 'linear-gradient(to right, #2193b0, #6dd5ed)' },
    { name: 'Forest', value: 'linear-gradient(to right, #134e5e, #71b280)' },
    { name: 'Night', value: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' },
    
    // Professional Gradients
    { name: 'Corporate', value: 'linear-gradient(to right, #2c3e50, #3498db)' },
    { name: 'Elegant', value: 'linear-gradient(to right, #000046, #1CB5E0)' },
    { name: 'Business', value: 'linear-gradient(to right, #373B44, #4286f4)' },
    { name: 'Premium', value: 'linear-gradient(to right, #1a2a6c, #b21f1f, #fdbb2d)' },
    { name: 'Executive', value: 'linear-gradient(to right, #141E30, #243B55)' },

    // Nature Inspired
    { name: 'Spring', value: 'linear-gradient(to right, #00b09b, #96c93d)' },
    { name: 'Autumn', value: 'linear-gradient(to right, #DAD299, #B0DAB9)' },
    { name: 'Summer', value: 'linear-gradient(to right, #f2994a, #f2c94c)' },
    { name: 'Winter', value: 'linear-gradient(to right, #E6DADA, #274046)' },
    { name: 'Forest Dawn', value: 'linear-gradient(to right, #2c3e50, #3498db)' },

    // Modern & Trendy
    { name: 'Ultra Violet', value: 'linear-gradient(to right, #654ea3, #eaafc8)' },
    { name: 'Neo', value: 'linear-gradient(to right, #00c6ff, #0072ff)' },
    { name: 'Cyber', value: 'linear-gradient(to right, #4facfe, #00f2fe)' },
    { name: 'Digital', value: 'linear-gradient(to right, #396afc, #2948ff)' },
    { name: 'Tech', value: 'linear-gradient(to right, #0cebeb, #20e3b2, #29ffc6)' },

    // Calm & Serene
    { name: 'Peaceful', value: 'linear-gradient(to right, #2193b0, #6dd5ed)' },
    { name: 'Tranquil', value: 'linear-gradient(to right, #1cd8d2, #93edc7)' },
    { name: 'Zen', value: 'linear-gradient(to right, #3494E6, #EC6EAD)' },
    { name: 'Harmony', value: 'linear-gradient(to right, #4CA1AF, #C4E0E5)' },
    { name: 'Serenity', value: 'linear-gradient(to right, #5614B0, #DBD65C)' },

    // Vibrant & Bold
    { name: 'Electric', value: 'linear-gradient(to right, #4776E6, #8E54E9)' },
    { name: 'Neon', value: 'linear-gradient(to right, #12c2e9, #c471ed, #f64f59)' },
    { name: 'Vivid', value: 'linear-gradient(to right, #FF0099, #493240)' },
    { name: 'Dynamic', value: 'linear-gradient(to right, #8E2DE2, #4A00E0)' },
    { name: 'Energy', value: 'linear-gradient(to right, #1FA2FF, #12D8FA, #A6FFCB)' },

    // Warm Tones
    { name: 'Sunset Dream', value: 'linear-gradient(to right, #FA8BFF, #2BD2FF, #2BFF88)' },
    { name: 'Golden Hour', value: 'linear-gradient(to right, #FFB75E, #ED8F03)' },
    { name: 'Warm Coral', value: 'linear-gradient(to right, #ff9966, #ff5e62)' },
    { name: 'Desert', value: 'linear-gradient(to right, #F4C183, #FC7D7D)' },
    { name: 'Amber', value: 'linear-gradient(to right, #f7b733, #fc4a1a)' },

    // Cool Tones
    { name: 'Arctic', value: 'linear-gradient(to right, #4ECDC4, #556270)' },
    { name: 'Polar', value: 'linear-gradient(to right, #2193b0, #6dd5ed)' },
    { name: 'Ice', value: 'linear-gradient(to right, #7F7FD5, #86A8E7, #91EAE4)' },
    { name: 'Frost', value: 'linear-gradient(to right, #00B4DB, #0083B0)' },
    { name: 'Winter Sky', value: 'linear-gradient(to right, #E0EAFC, #CFDEF3)' },

    // Dark Themes
    { name: 'Midnight', value: 'linear-gradient(to right, #232526, #414345)' },
    { name: 'Dark Matter', value: 'linear-gradient(to right, #1e130c, #9a8478)' },
    { name: 'Deep Space', value: 'linear-gradient(to right, #000000, #434343)' },
    { name: 'Shadow', value: 'linear-gradient(to right, #3d3d3d, #000000)' },
    { name: 'Obsidian', value: 'linear-gradient(to right, #283048, #859398)' },

    // Light Themes
    { name: 'Cloud', value: 'linear-gradient(to right, #ECE9E6, #FFFFFF)' },
    { name: 'Pearl', value: 'linear-gradient(to right, #D3CCE3, #E9E4F0)' },
    { name: 'Snow', value: 'linear-gradient(to right, #E6DADA, #274046)' },
    { name: 'Silk', value: 'linear-gradient(to right, #fffcdc, #d9a7c7)' },
    { name: 'Cotton', value: 'linear-gradient(to right, #F0F2F0, #000C40)' },

    // Special Effects
    { name: 'Rainbow', value: 'linear-gradient(to right, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8B00FF)' },
    { name: 'Aurora', value: 'linear-gradient(to right, #00C9FF, #92FE9D)' },
    { name: 'Northern Lights', value: 'linear-gradient(to right, #43C6AC, #191654)' },
    { name: 'Prism', value: 'linear-gradient(to right, #FC466B, #3F5EFB)' },
    { name: 'Holographic', value: 'linear-gradient(to right, #17EAD9, #6078EA)' }
  ];

  const images = [
    {
      name: 'City',
      url: 'https://images.pexels.com/photos/169647/pexels-photo-169647.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    },
    {
      name: 'Nature',
      url: 'https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      name: 'Abstract',
      url: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      name: 'Workspace',
      url: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      name: 'Modern',
      url: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=1200'
    }
  ];

  // Helper function to check if a theme is currently selected
  const isActiveTheme = (type, value) => {
    return currentTheme?.type === type && currentTheme?.value === value;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-[95%] max-w-5xl max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Customize Theme</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setActiveTab('colors')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'colors' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaPalette />
                  <span>Colors</span>
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'images' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaImage />
                  <span>Images</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {activeTab === 'images' && (
                <div className="mb-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-gray-300 rounded-lg
                             flex flex-col items-center justify-center gap-2
                             hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaUpload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload your own image
                    </span>
                    <span className="text-xs text-gray-400">
                      Max size: 5MB | Supported formats: JPG, PNG, GIF
                    </span>
                  </motion.button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {activeTab === 'colors' ? (
                  colors.map(color => (
                    <motion.button
                      key={color.name}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative h-28 rounded-lg overflow-hidden shadow-md group
                                ${isActiveTheme('color', color.value) ? 'ring-4 ring-blue-500' : ''}`}
                      style={{ background: color.value }}
                      onClick={() => onSelectTheme({ type: 'color', value: color.value })}
                    >
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 
                                  transition-colors duration-200 flex items-center justify-center">
                        <span className="text-white text-sm font-medium opacity-0 
                                     group-hover:opacity-100 transition-opacity duration-200 
                                     px-2 py-1 bg-black/40 rounded-full">
                          {color.name}
                          {isActiveTheme('color', color.value) && ' (Active)'}
                        </span>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <>
                    {/* Show uploaded image if exists */}
                    {currentTheme?.isCustom && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative h-28 rounded-lg overflow-hidden shadow-md ring-4 ring-blue-500"
                      >
                        <img 
                          src={currentTheme.value} 
                          alt="Custom upload"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="text-white text-sm font-medium px-2 py-1 bg-black/40 rounded-full">
                            Custom Upload (Active)
                          </span>
                        </div>
                      </motion.button>
                    )}
                    
                    {/* Existing preset images */}
                    {images.map(image => (
                      <motion.button
                        key={image.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative h-28 rounded-lg overflow-hidden shadow-md
                                  ${isActiveTheme('image', image.url) ? 'ring-4 ring-blue-500' : ''}`}
                        onClick={() => onSelectTheme({ type: 'image', value: image.url })}
                      >
                        <img 
                          src={image.url} 
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <span className="text-white text-sm font-medium px-2 py-1 
                                       bg-black/40 rounded-full">
                            {image.name}
                            {isActiveTheme('image', image.url) && ' (Active)'}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ThemeSelector; 