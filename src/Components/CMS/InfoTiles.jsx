import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import './Infotiles.css';
import cookie from 'js-cookie';
import config from "../config";
import DailyTips from "../Homepage Components/DailyTips";
import axios from "axios";

const InfoTiles = ({ totalCompleted, activeContacts, pendingFollowUp, assignedLeads, totalLeads }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [financialData, setFinancialData] = useState({
    totalProjectedAmount: 0,
    totalPreRegisteredAmount: 0,
    totalRemainingAmount: 0
  });
  const [adminAccess, setAdminAccess] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint in Tailwind
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const token = cookie.get('token');
        if (!token) return;

        const response = await axios.get(
          `${config.apiUrl}/qems/cms/entries/counts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
       

        if (response.data?.success) {
          setFinancialData(response.data.data.financialData || {
            totalProjectedAmount: 0,
            totalPreRegisteredAmount: 0,
            totalRemainingAmount: 0
          });
          setAdminAccess(response.data.data.adminAccess || []);
        }
      } catch (error) {
        console.error('Error fetching financial data:', error);
      }
    };

    fetchFinancialData();
  }, []);

  if (isMobile) {
    return (
      <div id="info-tiles" className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:hidden">
        {[
          { title: "Total Completed", value: totalCompleted, bgColor: "bg-gradient-to-r from-green-400 to-green-600" },
          { title: "Active Contacts", value: activeContacts, bgColor: "bg-gradient-to-r from-blue-400 to-blue-600" },
          { title: "Pending Follow-ups", value: pendingFollowUp, bgColor: "bg-gradient-to-r from-orange-400 to-red-500" },
          { title: "Total Leads", value: totalLeads, bgColor: "bg-gradient-to-r from-yellow-400 to-yellow-600" },
          ...(cookie.get('token') ? [{ title: "Assigned Leads", value: assignedLeads, bgColor: "bg-gradient-to-r from-gray-500 to-gray-700" }] : []),
          ...(!adminAccess.includes('hide') ? [{ title: "Financial Summary", value: financialData, bgColor: "bg-gradient-to-r from-purple-400 to-purple-600" }] : [])
        ].map((tile, index) => (
          <motion.div
            key={index}
            className={`p-3 text-white rounded-lg shadow-md ${tile.bgColor} relative overflow-hidden`}
            initial={{ opacity: 0, scale: 0.8 }}
            
          >
            <motion.div className="absolute inset-0 bg-white/10 blur-md" animate={{ opacity: 1, transition: { duration: 1, repeat: Infinity, repeatType: "mirror" } }} />
            <motion.div className="transform perspective-1000" >
              {tile.title === "Financial Summary" ? (
                <div className="flex flex-col w-full gap-1 p-2">
                  <h3 className="text-sm font-semibold text-center mb-1">Financial Summary</h3>
                  <div className="grid grid-cols-2 gap-1 text-center">
                    <div className="col-span-2">

                      <p className="text-xs">Projected</p>
                      <p className="text-sm font-bold">₹{tile.value?.totalProjectedAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[0.65rem]">Pre-registered</p>
                      <p className="text-xs">₹{tile.value?.totalPreRegisteredAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[0.65rem]">Remaining</p>
                      <p className="text-xs">₹{tile.value?.totalRemainingAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex w-60 md:w-44 gap-3 h-3 items-center justify-between flex-row-reverse">
                  <p className="text-lg font-bold text-center">{tile.value}</p>
                  <h3 className="text-md font-semibold text-center whitespace-nowrap">{tile.title}</h3>
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative p-2 hidden lg:block">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent"></div>
      </div>

      <div className="relative flex flex-col lg:flex-row space-x-2">
        <div className="hidden lg:block"><DailyTips /></div>

        <div id="info-tiles" className="relative flex flex-col lg:flex-row lg:gap-4 justify-center items-end w-full">
          {[
            { title: "Active", value: activeContacts, bgColor: "from-blue-400 to-blue-600", height: "h-16" },
            { title: "Followups", value: pendingFollowUp, bgColor: "from-orange-400 to-red-500", height: "h-24" },
            { title: "Completed", value: totalCompleted, bgColor: "from-green-400 to-green-600", height: "h-28" },
            { title: "Total Leads", value: totalLeads, bgColor: "from-yellow-400 to-yellow-600", height: "h-32" },
            ...(cookie.get('token') ? [{ title: "Assigned Leads", value: assignedLeads, bgColor: "from-gray-500 to-gray-700", height: "h-36" }] : []),
            ...(!adminAccess.includes('hide') ? [{ 
              title: "Financial Summary",
              value: financialData,
              bgColor: "from-purple-400 to-purple-600", 
              height: "h-40"
            }] : [])
          ].map((tile, index) => (
            <motion.div
              key={index}
              className={`relative overflow-hidden p-5 text-white rounded-xl shadow-lg bg-gradient-to-r ${tile.bgColor} ${tile.height} flex flex-col justify-center items-center w-full lg:w-auto`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
              whileHover={{ scale: 1.07,  boxShadow: "0px 0px 20px rgba(255, 255, 255, 0.7)" }}
            >
              <motion.div className="absolute inset-0 bg-white/20 blur-lg rounded-xl" animate={{ opacity: 0.7, transition: { duration: 1.5, repeat: Infinity, repeatType: "mirror" } }} />
              <motion.div className="transform perspective-1000 flex flex-col items-center justify-center h-full" >
                {tile.title === "Financial Summary" ? (
                  <div className="space-y-2 text-center">
                    <div className="space-y-1">
                      <p className="text-xs opacity-80">Total Projected</p>
                      <p className="text-xl font-bold">₹{tile.value?.totalProjectedAmount?.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs opacity-80">Pre-registered</p>
                        <p className="text-sm">₹{tile.value?.totalPreRegisteredAmount?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-80">Remaining</p>
                        <p className="text-sm">₹{tile.value?.totalRemainingAmount?.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-extrabold">{tile.value > 0 ? "✅" : "❌"}</p>
                    <p className="text-xl font-extrabold">{tile.value}</p>
                    <h3 className="text-sm font-normal text-center">{tile.title}</h3>
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoTiles;
