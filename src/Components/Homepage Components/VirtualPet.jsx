import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip';

const PETS = {
  CHICK: {
    sprites: {
      idle: "🥚",
      walk: ["🐣", "🐤"],
      climb: ["🐥", "🐤"],
      sleep: "😴"
    },
    name: "Chicky"
  }
};

const VirtualPet = () => {
  const [pet, setPet] = useState(() => {
    const saved = localStorage.getItem('virtualPet');
    return saved ? JSON.parse(saved) : {
      type: 'CHICK',
      state: 'egg',
      action: 'idle',
      position: { x: 20, y: -40 },
      direction: 1,
      experience: 0
    };
  });

  const containerRef = useRef(null);
  const [spriteIndex, setSpriteIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem('virtualPet', JSON.stringify(pet));
  }, [pet]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpriteIndex(prev => (prev + 1) % 2);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handlePetClick = () => {
    console.log('Pet clicked!');
    if (pet.state === 'egg') {
      setPet(prev => ({
        ...prev,
        state: 'hatched',
        action: 'walk'
      }));
    } else {
      setPet(prev => ({
        ...prev,
        experience: prev.experience + 1
      }));
    }
  };

  const getCurrentSprite = () => {
    const petType = PETS[pet.type];
    if (pet.state === 'egg') return petType.sprites.idle;
    const sprites = petType.sprites[pet.action];
    return Array.isArray(sprites) ? sprites[spriteIndex] : sprites;
  };

  return (
    <div 
      ref={containerRef}
      className="fixed bottom-20 left-0 right-0 h-32 z-50"
      style={{ pointerEvents: 'none' }}
    >
      <motion.div
        className="absolute cursor-pointer"
        style={{
          left: '20px',
          bottom: '20px',
          fontSize: '2.5rem',
          pointerEvents: 'auto',
          zIndex: 1000
        }}
        animate={{
          scale: pet.action === 'idle' ? [1, 1.1, 1] : 1,
          x: pet.position.x,
          y: pet.position.y
        }}
        transition={{
          duration: 2,
          repeat: Infinity
        }}
        onClick={handlePetClick}
        data-tooltip-id="pet-tooltip"
      >
        <span style={{ display: 'inline-block', transform: `scaleX(${pet.direction})` }}>
          {getCurrentSprite()}
        </span>
      </motion.div>

      <Tooltip id="pet-tooltip">
        <div className="text-center">
          <div className="font-medium">{PETS[pet.type].name}</div>
          <div className="text-sm">Experience: {pet.experience}</div>
          <div className="text-xs">
            {pet.state === 'egg' ? 'Click to hatch!' : 'Click to pat!'}
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

export default VirtualPet; 