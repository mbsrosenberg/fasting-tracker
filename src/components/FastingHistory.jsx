import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';

const FastingHistoryItem = ({ fast, index, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDuration, setEditedDuration] = useState(fast.duration);
  const [editedDate, setEditedDate] = useState(
    new Date(fast.completedAt).toISOString().split('T')[0]
  );

  const handleSave = () => {
    onEdit(index, {
      ...fast,
      duration: editedDuration,
      completedAt: new Date(editedDate).getTime()
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow mb-2 p-4">
      {!isEditing ? (
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">
              {new Date(fast.completedAt).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <p className="text-sm text-gray-600">
              Duration: {fast.duration}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
              aria-label="Edit fast"
            >
              <Pencil size={20} />
            </button>
            <button
              onClick={() => onDelete(index)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Delete fast"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={editedDate}
              onChange={(e) => setEditedDate(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              value={editedDuration}
              onChange={(e) => setEditedDuration(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <button
              onClick={handleSave}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
            >
              <Check size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FastingHistory = ({ history, setHistory }) => {
  const handleDelete = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('fastingHistory', JSON.stringify(newHistory));
  };

  const handleEdit = (index, updatedFast) => {
    const newHistory = [...history];
    newHistory[index] = updatedFast;
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
            <FastingHistoryItem
              key={index}
              fast={fast}
              index={index}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FastingHistory; 