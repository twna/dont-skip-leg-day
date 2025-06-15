import React, { useState, useEffect } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';

const AlarmSetup = ({ onAlarmSet }) => {
  const [alarmDay, setAlarmDay] = useState(0); // Monday by default
  const ALARM_TIME = '02:52'; // Hardcoded time
  const [alarmActive, setAlarmActive] = useState(false);

  useEffect(() => {
    // Load stored alarm settings
    const savedAlarm = getFromStorage('legDayAlarm', null);
    if (savedAlarm) {
      const { day, active } = savedAlarm;
      setAlarmDay(day);
      setAlarmActive(active);
    }
  }, []);

  const handleSetAlarm = () => {
    const alarmData = {
      day: alarmDay,
      time: ALARM_TIME,
      active: true,
    };
    
    // Save to storage
    saveToStorage('legDayAlarm', alarmData);
    setAlarmActive(true);
    
    // Request notification permission
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    
    onAlarmSet(alarmData);
  };

  const handleCancelAlarm = () => {
    const alarmData = {
      day: alarmDay,
      time: ALARM_TIME,
      active: false,
    };
    
    saveToStorage('legDayAlarm', alarmData);
    setAlarmActive(false);
    onAlarmSet(alarmData);
  };

  const dayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 0, label: 'Sunday' },
  ];

  return (
    <div className="bg-purple-100 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-purple-800 mb-4">🦵 Leg Day Alarm Setup</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Day of Week:</label>
        <select 
          value={alarmDay}
          onChange={(e) => setAlarmDay(parseInt(e.target.value))}
          className="w-full p-2 border rounded-md"
          disabled={alarmActive}
        >
          {dayOptions.map(day => (
            <option key={day.value} value={day.value}>{day.label}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Alarm Time:</label>
        <div className="w-full p-2 border rounded-md bg-gray-100">
          {ALARM_TIME} <span className="text-sm text-gray-500">(fixed time)</span>
        </div>
      </div>
      
      {!alarmActive ? (
        <button 
          onClick={handleSetAlarm}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Set Alarm
        </button>
      ) : (
        <div>
          <div className="text-green-600 font-bold mb-2">
            Alarm set for {dayOptions.find(d => d.value === alarmDay)?.label} at {ALARM_TIME}!
          </div>
          <button 
            onClick={handleCancelAlarm}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Cancel Alarm
          </button>
        </div>
      )}
      
      <p className="mt-4 text-sm text-gray-600 italic">
        "Friends don't let friends skip leg day—but we definitely mock them! 😈"
      </p>
    </div>
  );
};

export default AlarmSetup;
