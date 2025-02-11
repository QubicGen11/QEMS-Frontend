import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import './Infotiles.css'
import cookie from 'js-cookie';

const InfoTiles = ({ totalCompleted, activeContacts, pendingFollowUp, assignedLeads, totalLeads }) => {
  const [data, setData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch data from the API
  const fetchData = async () => {
    const token = cookie.get('token'); // Get token from cookies
    if (!token) {
      console.error('Authentication token not found');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/qems/cms/entries/counts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      if (result.success) {
        setData(result.data); // Set the fetched data
      } else {
        console.error('Failed to fetch data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []);

  const token = cookie.get('token');
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const mainPosition = decodedToken?.mainPosition;

  const baseTiles = [
    { title: "Total Completed", value: totalCompleted, bgColor: "bg-gradient-to-r from-green-400 to-green-600" },
    { title: "Active Contacts", value: activeContacts,  bgColor: "bg-gradient-to-r from-blue-400 to-blue-600" },
    { title: "Pending Follow-ups", value: pendingFollowUp,bgColor: "bg-gradient-to-r from-orange-400 to-red-500" },
    { title: "Total Leads", value: totalLeads, bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-600" }
  ];

  const tiles = mainPosition === 'Executive' 
    ? baseTiles 
    : [...baseTiles, { title: "Assigned Leads", value: assignedLeads, bgColor: "bg-gradient-to-r from-gray-500 to-gray-700" }];

  const tileVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  // Check if tiles are in view
  const handleScroll = () => {
    const tilesElement = document.getElementById("info-tiles");
    const rect = tilesElement.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-9">
      {tiles.map((tile, index) => (
        <motion.div
          key={index}
          className={`p-3 text-white rounded-lg shadow-md ${tile.bgColor} ${isVisible ? 'glow' : ''} flex flex-col items-center justify-center`}
          variants={tileVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.05 }}
        >
            
          <div className="flex w-60 md:w-44   gap-3 h-3 items-center justify-between flex-row-reverse ">
            <p className="text-lg font-bold text-center">{tile.value}</p>
            <h3 className="text-md font-semibold text-center whitespace-nowrap">{tile.title}</h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default InfoTiles;
