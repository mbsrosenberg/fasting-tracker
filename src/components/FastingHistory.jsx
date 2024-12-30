import React from 'react';
import { useDrag } from '@use-gesture/react';
import { animated, useSpring } from '@react-spring/web';
import { Trash2 } from 'lucide-react';

const SwipeableHistoryItem = ({ fast, onDelete, index }) => {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(({ movement: [mx], down, direction: [xDir], velocity: [vx] }) => {
    const trigger = vx > 0.2 || Math.abs(mx) > 100;
    
    if (!down && trigger && xDir > 0) {
      api.start({ x: 500, config: { duration: 200 } });
      setTimeout(() => onDelete(index), 200);
    } else {
      api.start({ x: down ? mx : 0, immediate: down });
    }
  }, { axis: 'x', filterTaps: true });

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        touchAction: 'pan-y',
        position: 'relative',
      }}
      className="bg-white rounded-lg shadow mb-2 cursor-grab active:cursor-grabbing"
    >
      <div className="p-4">
        <p className="font-medium">{fast.type}</p>
        <p className="text-sm text-gray-600">
          Duration: {fast.duration}
        </p>
        <p className="text-sm text-gray-600">
          Completed: {new Date(fast.completedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
        <Trash2 size={20} />
      </div>
    </animated.div>
  );
};

const FastingHistory = ({ history, setHistory }) => {
  const handleDelete = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('fastingHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="text-purple-600">⏰</span> 
        Fasting History
      </h2>
      {history.length === 0 ? (
        <p className="text-gray-600">Begin your fasting journey today!</p>
      ) : (
        <div className="space-y-2">
          {history.map((fast, index) => (
            <SwipeableHistoryItem
              key={index}
              fast={fast}
              index={index}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FastingHistory; 