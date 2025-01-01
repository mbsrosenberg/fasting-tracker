import React, { useState, useEffect } from 'react';
import { Heart, Play, Square, History, Download, Sparkles, Settings, X, Calendar, Clock, Pencil, Trash2, Check } from 'lucide-react';
import axios from 'axios';

const FastingHistoryItem = ({ fast, index, onDelete, onEdit, onContinue }) => {
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
              onClick={() => onContinue(fast)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
              aria-label="Continue fast"
            >
              <Play size={20} />
            </button>
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
  const [periodType, setPeriodType] = useState('fasting');
  const [history, setHistory] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const [fastStartTime, setFastStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [fastingGoal, setFastingGoal] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomStart, setShowCustomStart] = useState(false);
  const [customStartTime, setCustomStartTime] = useState('');
  const [analytics, setAnalytics] = useState({
    currentStreak: 0,
    totalFasts: 0,
    averageDuration: 0,
    longestFast: 0,
    completionRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const EATING_PERIOD = 8 * 3600;

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await axios.get('/api/history');
        if (response.data && Array.isArray(response.data)) {
          setHistory(response.data);
          localStorage.setItem('fastingHistory', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error loading from server:', error);
        const savedHistory = localStorage.getItem('fastingHistory');
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const saveHistory = async (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem('fastingHistory', JSON.stringify(newHistory));
    
    try {
      await axios.post('/api/history', newHistory);
    } catch (error) {
      console.error('Error saving to server:', error);
    }
  };

  useEffect(() => {
    const savedActiveState = localStorage.getItem('activePeriod');
    if (savedActiveState) {
      try {
        const { type, startTime } = JSON.parse(savedActiveState);
        setPeriodType(type);
        setFastStartTime(new Date(startTime));
        setIsActive(true);
      } catch (error) {
        console.error('Error loading active period:', error);
      }
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && fastStartTime) {
      interval = setInterval(() => {
        const currentTime = new Date().getTime();
        const startTime = new Date(fastStartTime).getTime();
        const newElapsedTime = Math.floor((currentTime - startTime) / 1000);
        setElapsedTime(newElapsedTime);

        const targetSeconds = periodType === 'fasting' 
          ? fastingGoal * 3600 
          : EATING_PERIOD;
        
        if (newElapsedTime >= targetSeconds) {
          if (periodType === 'fasting') {
            handleCompleteFast();
          } else {
            handleCompleteEating();
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, fastStartTime, periodType, fastingGoal]);

  const handleCompleteFast = () => {
    const endTime = Date.now();
    const duration = formatDuration(endTime - fastStartTime.getTime());
    
    const existingFastIndex = history.findIndex(fast => {
      if (!fast.startTime) return false;
      const timeDiff = Math.abs(fast.startTime - fastStartTime.getTime());
      return timeDiff < 5000;
    });

    const newFast = {
      type: `${fastingGoal}:8 Fast`,
      duration,
      completedAt: endTime,
      startTime: fastStartTime.getTime()
    };

    let updatedHistory;
    if (existingFastIndex !== -1) {
      updatedHistory = history.map((fast, index) => 
        index === existingFastIndex ? newFast : fast
      );
    } else {
      updatedHistory = [newFast, ...history];
    }

    saveHistory(updatedHistory);
    
    setPeriodType('eating');
    setFastStartTime(new Date());
    setElapsedTime(0);
    setIsActive(true);
    localStorage.setItem('activePeriod', JSON.stringify({ 
      type: 'eating',
      startTime: new Date().getTime()
    }));
  };

  const handleCompleteEating = () => {
    setPeriodType('fasting');
    setFastStartTime(new Date());
    setElapsedTime(0);
    setIsActive(true);
    localStorage.setItem('activePeriod', JSON.stringify({ 
      type: 'fasting',
      startTime: new Date().getTime()
    }));
  };

  const handleStartFast = (customDate = null) => {
    const startTime = customDate || new Date();
    setFastStartTime(startTime);
    setIsActive(true);
    setElapsedTime(0);
    setShowCustomStart(false);
  };

  const handleCustomStart = (e) => {
    e.preventDefault();
    if (!customStartTime) return;

    const [hours, minutes] = customStartTime.split(':');
    const customDate = new Date();
    customDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    if (customDate > new Date()) {
      customDate.setDate(customDate.getDate() - 1);
    }

    handleStartFast(customDate);
  };

  const handleDeleteFast = async (index) => {
    try {
      const updatedHistory = history.filter((_, i) => i !== index);
      await axios.post('/api/history', updatedHistory);
      
      const [historyResponse, analyticsResponse] = await Promise.all([
        axios.get('/api/history'),
        axios.get('/api/analytics')
      ]);
      
      setHistory(historyResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Error deleting fast:', error);
      setError('Failed to delete fast. Please try again.');
    }
  };

  const handleEditFast = async (index, updatedFast) => {
    try {
      const updatedHistory = [...history];
      updatedHistory[index] = updatedFast;
      await axios.post('/api/history', updatedHistory);
      
      const [historyResponse, analyticsResponse] = await Promise.all([
        axios.get('/api/history'),
        axios.get('/api/analytics')
      ]);
      
      setHistory(historyResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Error updating fast:', error);
      setError('Failed to update fast. Please try again.');
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const targetSeconds = periodType === 'fasting' 
      ? fastingGoal * 3600 
      : EATING_PERIOD;
    return Math.min((elapsedTime / targetSeconds) * 100, 100);
  };

  const handleContinueFast = (fast) => {
    const startTime = new Date(fast.startTime);
    setFastStartTime(startTime);
    setIsActive(true);
    setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
  };

  const handleCompleteClick = () => {
    console.log('Button clicked!');
    if (periodType === 'fasting') {
      handleCompleteFast();
    } else {
      handleCompleteEating();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="h-12 bg-transparent"></div>

      <div className="px-6 pb-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
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

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-gray-500">Current Streak</div>
              <div className="text-2xl font-bold text-purple-600">{analytics.currentStreak} days</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-2xl font-bold text-blue-600">{analytics.completionRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-gray-500">Longest Fast</div>
              <div className="text-2xl font-bold text-green-600">{formatTime(analytics.longestFast)}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-gray-500">Average Duration</div>
              <div className="text-2xl font-bold text-orange-600">{formatTime(analytics.averageDuration)}</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-8 mb-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">
              {periodType === 'fasting' ? 'Fasting Period' : 'Eating Period'}
            </h2>
            <p className="text-gray-600">
              {periodType === 'fasting' 
                ? `Target: ${fastingGoal}:00:00`
                : 'Target: 08:00:00'
              }
            </p>
          </div>

          <div className="text-center mb-8">
            <div className="text-7xl font-light tracking-tight text-gray-900 font-mono">
              {formatTime(elapsedTime)}
            </div>
            <div className="mt-3 text-sm text-gray-500 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              Target: {formatTime(periodType === 'fasting' 
                ? fastingGoal * 3600 
                : EATING_PERIOD
              )}
            </div>
          </div>

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

          {!isActive ? (
            <div className="mt-8 space-y-4">
              <button
                onClick={() => {
                  const startTime = new Date();
                  setFastStartTime(startTime);
                  setIsActive(true);
                  setElapsedTime(0);
                }}
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
              onClick={handleCompleteClick}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity mt-4"
            >
              {periodType === 'fasting' ? 'Complete Fast' : 'Complete Eating Period'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-400 hover:text-red-600"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
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
                    onDelete={handleDeleteFast}
                    onEdit={handleEditFast}
                    onContinue={handleContinueFast}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default FastingTracker;
