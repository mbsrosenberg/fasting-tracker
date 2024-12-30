import React, { useState, useEffect } from 'react';
import { Heart, Play, Square, History, Download, Sparkles, Settings, X } from 'lucide-react';
import FastingHistory from './FastingHistory';

const FastingTracker = () => {
  const [fastStartTime, setFastStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [fastHistory, setFastHistory] = useState([]);
  const [fastingGoal, setFastingGoal] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('fastingHistory');
    return saved ? JSON.parse(saved) : [];
  });

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
            <button
              onClick={startFast}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-2xl active:opacity-90 transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300"
            >
              Begin Fasting Journey
            </button>
          ) : (
            <button
              onClick={stopFast}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-lg font-semibold rounded-2xl active:opacity-90 transition-all duration-300 shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300"
            >
              Complete Fast
            </button>
          )}
        </div>

        {/* History Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <History size={20} className="text-purple-500" />
            Fasting History
          </h2>
          <div className="space-y-4">
            {fastHistory.slice().reverse().map((fast, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-purple-50/50 rounded-xl px-3 transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {fast.startTime.toLocaleDateString(undefined, { 
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: {formatTime(fast.duration)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-purple-600">
                    {(fast.duration / 3600).toFixed(1)}h
                  </div>
                </div>
              </div>
            ))}
            {fastHistory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-300" />
                Begin your fasting journey today!
              </div>
            )}
          </div>
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
      <FastingHistory history={history} setHistory={setHistory} />
    </div>
  );
};

export default FastingTracker;
