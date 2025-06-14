import { useEffect } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';

const NotificationManager = ({ onNotificationClick }) => {
  useEffect(() => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.error("This browser does not support notifications");
      return;
    }
    
    // If permission already granted
    if (Notification.permission === "granted") {
      // Set up the notification check interval
      setupNotificationCheck();
    } else if (Notification.permission !== "denied") {
      // Request permission if not denied already
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setupNotificationCheck();
        }
      });
    }
    
    return () => {
      // Clear all intervals and timers when component unmounts
      clearInterval(window.notificationInterval);
      
      if (window.legDayNotificationTimer) {
        clearTimeout(window.legDayNotificationTimer);
      }
      
      if (window.legDayNotificationInterval) {
        clearInterval(window.legDayNotificationInterval);
      }
    };
  }, []);
  
  const setupNotificationCheck = () => {
    // Check for alarm every minute
    window.notificationInterval = setInterval(checkAlarm, 60000);
    
    // Also check immediately
    checkAlarm();
  };
  
  const checkAlarm = () => {
    const savedAlarm = getFromStorage('legDayAlarm');
    
    if (!savedAlarm) return;
    
    const { day, time, active } = savedAlarm;
    
    if (!active) return;
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentDate = now.toDateString();
    
    // Convert alarm time to hours and minutes
    const [alarmHours, alarmMinutes] = time.split(':').map(num => parseInt(num));
    
    // Check if it's the right day and time
    if (currentDay === day) {
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      // Get notification state
      const notificationState = getFromStorage('legDayNotificationState') || {};
      
      // If current time is at or past the alarm time, check if we should show notification
      if ((currentHours > alarmHours) || 
         (currentHours === alarmHours && currentMinutes >= alarmMinutes)) {
        
        // Check if the user has acknowledged today's notification
        if (!notificationState.acknowledged || notificationState.date !== currentDate) {
          // If not acknowledged or it's a new day, show notification
          showNotification();
        }
      }
    } else {
      // Reset notification state if it's not the alarm day
      resetNotificationState();
    }
  };
  
  // Reset notification state (when day changes or user completes verification)
  const resetNotificationState = () => {
    saveToStorage('legDayNotificationState', {
      shown: false,
      acknowledged: false,
      date: null
    });
    
    // Clear all notification timers
    if (window.legDayNotificationTimer) {
      clearTimeout(window.legDayNotificationTimer);
      window.legDayNotificationTimer = null;
    }
    
    if (window.legDayNotificationInterval) {
      clearInterval(window.legDayNotificationInterval);
      window.legDayNotificationInterval = null;
    }
  };
  
  const showNotification = () => {
    // Update notification state
    const now = new Date();
    const currentDate = now.toDateString();
    
    // Get the user's name if available
    const userName = getFromStorage('legDayUserName') || '';
    
    // Update notification state
    saveToStorage('legDayNotificationState', {
      shown: true,
      acknowledged: false,
      date: currentDate
    });
    
    // Update leaderboard data
    if (userName) {
      // Get current leaderboard data
      const leaderboardData = getFromStorage('legDayLeaderboard') || [];
      
      // Find user in leaderboard
      const userIndex = leaderboardData.findIndex(user => user.name === userName);
      
      if (userIndex !== -1) {
        // Update existing user's count
        leaderboardData[userIndex].notificationCount += 1;
      } else {
        // Add new user to leaderboard
        leaderboardData.push({
          name: userName,
          notificationCount: 1
        });
      }
      
      // Save updated leaderboard
      saveToStorage('legDayLeaderboard', leaderboardData);
    }
    
    // Create and show the notification with personalized message if name exists
    const personalized = userName ? `Hey ${userName}! ` : '';
    
    // Use different messages to grab attention
    const messages = [
      `${personalized}It's time to verify those quads! Click here NOW!`,
      `${personalized}DON'T IGNORE LEG DAY! Verify your quads immediately!`,
      `${personalized}Your legs are crying for attention! Click to verify NOW!`,
      `${personalized}WARNING: Skipping leg day detected! Click to verify.`,
      `${personalized}⚠️ URGENT: Leg verification required immediately!`
    ];
    
    // Randomly select a message to keep it fresh and annoying
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Create the notification with more attention-grabbing settings
    const notification = new Notification("🦵 DON'T SKIP LEG DAY! 🦵", {
      body: message,
      icon: "/favicon.ico", // Use app icon if available
      requireInteraction: true, // Notification persists until user interacts with it
      vibrate: [200, 100, 200, 100, 200, 100, 400], // Vibration pattern for mobile
      badge: "/favicon.ico" // For mobile notifications
    });
    
    // Add click handler
    notification.onclick = () => {
      // Focus the window and trigger the verification process
      window.focus();
      onNotificationClick();
      notification.close();
      
      // Mark notification as acknowledged
      const notificationState = getFromStorage('legDayNotificationState') || {};
      saveToStorage('legDayNotificationState', {
        ...notificationState,
        acknowledged: true
      });
      
      // Clear any pending notification timers
      if (window.legDayNotificationTimer) {
        clearTimeout(window.legDayNotificationTimer);
      }
    };
    
    // We'll only try to play sound in response to user interaction
    // This avoids the "play() failed because the user didn't interact with the document" error
    try {
      if (document.hasFocus() && document.querySelector('body').classList.contains('user-interaction')) {
        const audio = new Audio(`${process.env.PUBLIC_URL}/audio/alarm.mp3`);
        audio.loop = false;
        audio.volume = 0.5;
        audio.play().catch(err => {
          console.warn('Could not play notification sound:', err);
        });
        setTimeout(() => audio.pause(), 5000); // Play for 5 seconds
      }
    } catch (err) {
      console.warn('Error with notification sound:', err);
    }
    
    // Schedule the next notification if not acknowledged
    // Using a constant 10-second interval for aggressive notifications
    if (window.legDayNotificationTimer) {
      clearTimeout(window.legDayNotificationTimer);
    }
    
    // Fixed 10-second notification interval
    const TEN_SECONDS = 10 * 1000; 
    
    // Create a simple timer for the first notification after 10 seconds
    window.legDayNotificationTimer = setTimeout(() => {
      const notificationState = getFromStorage('legDayNotificationState') || {};
      // Only show again if not acknowledged
      if (!notificationState.acknowledged) {
        showNotification();
      }
    }, TEN_SECONDS);
    
    // Create a recurring interval that sends notifications every 10 seconds
    if (!window.legDayNotificationInterval) {
      window.legDayNotificationInterval = setInterval(() => {
        const notificationState = getFromStorage('legDayNotificationState') || {};
        
        // Only continue if not acknowledged
        if (!notificationState.acknowledged) {
          // Show notification every 10 seconds
          showNotification();
          console.log('Sending a notification - will repeat every 10 seconds until acknowledged');
        } else {
          // Stop interval if acknowledged
          clearInterval(window.legDayNotificationInterval);
          window.legDayNotificationInterval = null;
        }
      }, TEN_SECONDS);
    }
  };
  
  return null; // No UI needed for this component
};

export default NotificationManager;
