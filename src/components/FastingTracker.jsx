import React, { useState, useEffect } from 'react';
import { Heart, Play, Square, History, Download, Sparkles, Settings, X, Calendar, Clock, Pencil, Trash2, Check } from 'lucide-react';
import FastingHistory from './FastingHistory';
import axios from 'axios';

const HistoryItem = ({ fast, index, onDelete, onEdit }) => {
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

const FastingTracker = () => {
  const [fastStartTime, setFastStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [fastHistory, setFastHistory] = useState([]);
  const [fastingGoal, setFastingGoal] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState([]);
  const [showCustomStart, setShowCustomStart] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('');

  // Load saved data on component mount
  useEffect(() => {
    try {
      let savedHistory = localStorage.getItem('fastHistory_v2');
      const savedGoal = localStorage.getItem('fastingGoal_v2');
      const savedActiveState = localStorage.getItem('activeFast_v2');

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setFastHistory(parsedHistory.map(fast => ({
          ...fast,
          startTime: new Date(fast.startTime),
          endTime: new Date(fast.endTime)
        })));
      }
      
      if (savedGoal) {
        setFastingGoal(parseInt(savedGoal));
      }

      if (savedActiveState) {
        const activeFast = JSON.parse(savedActiveState);
        setFastStartTime(new Date(activeFast.startTime));
        setIsActive(true);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, []);

  // Storage effects
  useEffect(() => {
    if (fastHistory.length > 0) {
      localStorage.setItem('fastHistory_v2', JSON.stringify(fastHistory));
    }
  }, [fastHistory]);

  useEffect(() => {
    localStorage.setItem('fastingGoal_v2', fastingGoal.toString());
  }, [fastingGoal]);

  useEffect(() => {
    if (isActive && fastStartTime) {
      localStorage.setItem('activeFast_v2', JSON.stringify({ startTime: fastStartTime }));
    } else {
      localStorage.removeItem('activeFast_v2');
    }
  }, [isActive, fastStartTime]);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        const currentTime = new Date().getTime();
        const startTime = fastStartTime.getTime();
        setElapsedTime(Math.floor((currentTime - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, fastStartTime]);

  useEffect(() => {
    // Fetch history from server
    axios.get('/api/history')
      .then(response => setHistory(response.data))
      .catch(error => console.error('Error fetching history:', error));
  }, []);

  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    axios.post('/api/history', newHistory)
      .catch(error => console.error('Error saving history:', error));
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startFast = () => {
    setFastStartTime(new Date());
    setIsActive(true);
    setElapsedTime(0);
  };

  const stopFast = () => {
    const endTime = new Date();
    const duration = elapsedTime;
    setFastHistory([...fastHistory, {
      startTime: fastStartTime,
      duration: duration,
      endTime: endTime
    }]);
    setIsActive(false);
    setFastStartTime(null);
    setElapsedTime(0);
  };

  const getProgressPercentage = () => {
    return Math.min((elapsedTime / (fastingGoal * 3600)) * 100, 100);
  };

  const handleCustomStart = (e) => {
    e.preventDefault();
    if (!customStartTime) return;

    const customDate = new Date();
    const [hours, minutes] = customStartTime.split(':');
    customDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // If the time is in the future, subtract 24 hours
    if (customDate > new Date()) {
      customDate.setDate(customDate.getDate() - 1);
    }

    setFastStartTime(customDate.getTime());
    setIsActive(true);
    setShowCustomStart(false);
  };

  const handleDeleteFast = (index) => {
    const updatedHistory = history.filter((_, i) => i !== index);
    saveHistory(updatedHistory);
  };

  const handleEditFast = (index, updatedFast) => {
    const updatedHistory = [...history];
    updatedHistory[index] = updatedFast;
    saveHistory(updatedHistory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      {/* iOS-style status bar space */}
      <div className="h-12 bg-transparent"></div>

      {/* Main Content */}
      <div className="px-6 pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mindful Fast
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track your fasting journey</p>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 text-gray-600 hover:bg-white/50 active:bg-white/80 rounded-full transition-all duration-300"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* Timer Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-8 mb-6">
          {/* Current Fast Type */}
          <div className="text-center mb-4">
            <span className="text-sm font-medium px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
              {fastingGoal}:8 Intermittent Fast
            </span>
          </div>

          {/* Large Timer Display */}
          <div className="text-center mb-8">
            <div className="text-7xl font-light tracking-tight text-gray-900 font-mono">
              {formatTime(elapsedTime)}
            </div>
            <div className="mt-3 text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              Target: {formatTime(fastingGoal * 3600)}
            </div>
          </div>

          {/* Progress Circle */}
          <div className="relative w-56 h-56 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-gray-100"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r="80"
                cx="112"
                cy="112"
              />
              <circle
                className="text-purple-500 transition-all duration-500"
                strokeWidth="6"
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="80"
                cx="112"
                cy="112"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - getProgressPercentage() / 100)}`}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-semibold text-purple-700">
                {getProgressPercentage().toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">completed</div>
            </div>
          </div>

          {/* Action Button */}
          {!isActive ? (
            <div className="mt-8 space-y-4">
              <button
                onClick={() => setFastStartTime(Date.now())}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Begin Fasting Journey
              </button>
              
              <button
                onClick={() => setShowCustomStart(true)}
                className="w-full bg-white text-purple-600 border border-purple-600 py-3 px-6 rounded-lg font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <Clock size={20} />
                Set Custom Start Time
              </button>
            </div>
          ) : (
            <button
              onClick={stopFast}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-lg font-semibold rounded-2xl active:opacity-90 transition-all duration-300 shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300"
            >
              Complete Fast
            </button>
          )}
        </div>

        {/* Fasting History Section */}
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
                <HistoryItem
                  key={index}
                  fast={fast}
                  index={index}
                  onDelete={handleDeleteFast}
                  onEdit={handleEditFast}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Fasting Duration</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {[16, 18, 24, 48].map((hours) => (
                <button
                  key={hours}
                  onClick={() => {
                    setFastingGoal(hours);
                    setShowSettings(false);
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    fastingGoal === hours 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{hours}:8 Fast</div>
                  <div className="text-sm opacity-80">
                    {hours === 16 && "Popular intermediate fasting pattern"}
                    {hours === 18 && "Extended intermediate fasting"}
                    {hours === 24 && "One meal a day (OMAD)"}
                    {hours === 48 && "Extended fasting period"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Custom Start Time Modal */}
      {showCustomStart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-bold mb-4">Set Custom Start Time</h3>
            <form onSubmit={handleCustomStart} className="space-y-4">
              <div>
                <label htmlFor="customTime" className="block text-sm font-medium text-gray-700 mb-1">
                  When did you start fasting?
                </label>
                <input
                  type="time"
                  id="customTime"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCustomStart(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Start Fast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FastingHistory history={history} setHistory={setHistory} />
    </div>
  );
};

export default FastingTracker;
