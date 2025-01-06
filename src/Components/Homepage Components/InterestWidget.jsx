import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaNewspaper, FaSpinner } from 'react-icons/fa';

const InterestWidget = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = await response.json();
        
        const stories = await Promise.all(
          storyIds.slice(0, 3).map(async (id) => {
            const storyResponse = await fetch(
              `https://hacker-news.firebaseio.com/v0/item/${id}.json`
            );
            return storyResponse.json();
          })
        );
        
        setNewsData(stories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsData([]);
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="bg-gray-900/80 backdrop-blur-lg rounded-xl p-6 shadow-xl border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="flex-shrink-0 bg-blue-500 rounded-full p-3"
        >
          <FaNewspaper className="w-6 h-6 text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-white">Latest Tech Updates</h3>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSpinner className="text-blue-500 text-2xl" />
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {newsData.map((story) => (
            <motion.a
              key={story.id}
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 
                       border border-gray-600 transition-all duration-200"
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <h4 className="text-white text-base font-semibold mb-2 line-clamp-2">
                {story.title}
              </h4>
              <div className="flex items-center gap-3 text-gray-300 text-sm">
                <span className="flex items-center gap-1">
                  👍 {story.score}
                </span>
                <span>•</span>
                <span className="text-gray-400">
                  {new Date(story.time * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </motion.a>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default InterestWidget; 