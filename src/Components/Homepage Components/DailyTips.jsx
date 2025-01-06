import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaClock } from 'react-icons/fa';

const DailyTips = () => {
  const tips = [
    // Productivity Tips
    "Follow the 20-20-20 rule - Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.",
    "Use the Pomodoro Technique: Work for 25 minutes, then take a 5-minute break to maintain focus and productivity.",
    "Stay hydrated! Drink water regularly throughout your work day to maintain energy levels and concentration.",
    "Practice good posture while working. Align your screen at eye level and keep your feet flat on the floor.",
    "Take short walks during breaks to improve blood circulation and refresh your mind.",
    "Start your day by completing your most challenging task first - eat that frog!",
    "Use keyboard shortcuts to save time and increase efficiency.",
    "Keep your workspace clean and organized to minimize distractions.",
    "Practice deep breathing exercises when feeling stressed or overwhelmed.",
    "Set SMART goals: Specific, Measurable, Achievable, Relevant, and Time-bound.",
    
    // Time Management
    "Plan your next day the evening before to hit the ground running.",
    "Use the 2-minute rule: If a task takes less than 2 minutes, do it now.",
    "Block distracting websites during focused work periods.",
    "Group similar tasks together to maintain workflow and momentum.",
    "Schedule buffer time between meetings to stay organized and prepared.",
    
    // Health & Wellness
    "Maintain proper screen distance - about arm's length away from your monitor.",
    "Do desk stretches every hour to prevent muscle tension.",
    "Use blue light filters on your devices, especially in the evening.",
    "Practice mindful eating during lunch breaks.",
    "Keep healthy snacks at your desk to maintain energy levels.",
    
    // Mental Health
    "Take regular mental health breaks to prevent burnout.",
    "Practice gratitude by noting three good things each day.",
    "Don't hesitate to ask for help when needed.",
    "Celebrate small wins and achievements.",
    "Set boundaries between work and personal life.",
    
    // Communication
    "Use clear and concise language in your emails.",
    "Practice active listening during meetings.",
    "Respond to important messages promptly.",
    "Use video calls for complex discussions.",
    "Document important decisions and action items.",
    
    // Professional Development
    "Learn one new skill or tool each month.",
    "Read industry news for 15 minutes daily.",
    "Network with colleagues from different departments.",
    "Seek feedback regularly to improve performance.",
    "Keep your professional profiles updated.",
    
    // Work Environment
    "Adjust your chair height for optimal ergonomics.",
    "Use natural lighting when possible.",
    "Keep indoor plants nearby to improve air quality.",
    "Maintain a clutter-free digital desktop.",
    "Create a dedicated workspace at home.",
    
    // Team Collaboration
    "Share knowledge with team members regularly.",
    "Offer help to colleagues when you can.",
    "Be punctual for meetings and deadlines.",
    "Give credit where credit is due.",
    "Contribute positively to team discussions.",
    
    // Focus & Concentration
    "Use noise-canceling headphones when needed.",
    "Work in 90-minute focus blocks.",
    "Take micro-breaks to maintain concentration.",
    "Keep a task list to avoid mental overload.",
    "Minimize multitasking for better quality work.",
    
    // Work-Life Balance
    "Set clear work hours and stick to them.",
    "Take all your vacation days.",
    "Pursue hobbies outside of work.",
    "Make time for physical exercise.",
    "Disconnect from work emails after hours.",
    
    // Digital Wellness
    "Organize your email inbox regularly.",
    "Back up important files weekly.",
    "Use password managers for security.",
    "Clean up digital files monthly.",
    "Update software regularly.",
    
    // Stress Management
    "Practice progressive muscle relaxation.",
    "Use stress balls or fidget toys.",
    "Listen to calming music while working.",
    "Take deep breaths during stressful moments.",
    "Maintain a worry journal.",
    
    // Office Relationships
    "Show appreciation to colleagues.",
    "Practice empathy in workplace interactions.",
    "Address conflicts professionally.",
    "Celebrate team successes.",
    "Support new team members.",
    
    // Personal Growth
    "Read one professional development book monthly.",
    "Attend industry webinars regularly.",
    "Mentor junior colleagues.",
    "Set quarterly personal goals.",
    "Reflect on lessons learned from challenges.",
    
    // Innovation
    "Share creative ideas in meetings.",
    "Think outside the box for solutions.",
    "Learn from competitors' successes.",
    "Experiment with new tools and methods.",
    "Challenge assumptions regularly.",
    
    // Remote Work
    "Create a morning routine for remote work.",
    "Take virtual coffee breaks with colleagues.",
    "Use time zone tools for global collaboration.",
    "Maintain regular video check-ins.",
    "Set up a proper home office setup.",
    
    // Career Development
    "Update your skills portfolio regularly.",
    "Seek mentorship opportunities.",
    "Network within your industry.",
    "Track your achievements.",
    "Plan your career path.",
    
    // Meeting Efficiency
    "Prepare an agenda for every meeting.",
    "Take effective meeting notes.",
    "Follow up with action items promptly.",
    "Keep meetings focused and on-track.",
    "Start and end meetings on time.",
    
    // Personal Efficiency
    "Use templates for recurring tasks.",
    "Automate repetitive processes.",
    "Batch similar tasks together.",
    "Maintain an organized calendar.",
    "Review and optimize workflows regularly.",
    
    // Workplace Wellness
    "Practice good keyboard typing posture.",
    "Use ergonomic office equipment.",
    "Take regular eye breaks.",
    "Stay active during the workday.",
    "Maintain work-life boundaries."
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const today = new Date().getDate();
    setCurrentTip(today % tips.length);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7 }}
      className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
    >
      <motion.div 
        className="flex items-start gap-3"
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
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
          className="flex-shrink-0 bg-yellow-400 rounded-full p-2"
        >
          <FaLightbulb className="w-5 h-5 text-yellow-900" />
        </motion.div>
        
        <div>
          <motion.h3 
            className="text-yellow-300 font-semibold text-sm mb-1"
            animate={{
              color: ['#fde047', '#fcd34d', '#fde047'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            💡 Tip of the Day
          </motion.h3>
          
          <motion.p 
            className="text-white/90 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            "{tips[currentTip]}"
          </motion.p>

          <motion.div 
            className="mt-2 flex items-center gap-2 text-xs text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <FaClock className="w-3 h-3" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DailyTips; 