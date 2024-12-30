import React from 'react';
import { Trash2 } from 'lucide-react'; // Import the trash icon

const FastingHistory = ({ history, setHistory }) => {
  const handleDelete = (index) => {
    // Create a new array without the deleted item
    const newHistory = history.filter((_, i) => i !== index);
    // Update state and localStorage
    setHistory(newHistory);
    localStorage.setItem('fastingHistory', JSON.stringify(newHistory));
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Fasting History</h2>
      {history.length === 0 ? (
        <p className="text-gray-600">Begin your fasting journey today!</p>
      ) : (
        <div className="space-y-2">
          {history.map((fast, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center p-3 bg-white rounded-lg shadow"
            >
              <div>
                <p className="font-medium">{fast.type}</p>
                <p className="text-sm text-gray-600">
                  Duration: {fast.duration}
                </p>
                <p className="text-sm text-gray-600">
                  Completed: {new Date(fast.completedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                aria-label="Delete fast"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FastingHistory; 