import { useEffect, useState } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';

const NotificationManager = ({ onNotificationClick }) => {
  const [notificationSupported, setNotificationSupported] = useState(true);
  const [secureContext, setSecureContext] = useState(true);
  
  useEffect(() => {
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext;
    setSecureContext(isSecureContext);
    
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.error("This browser does not support notifications");
      setNotificationSupported(false);
      return;
    }
    
    // Register service worker for persistent notifications on deployed sites
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
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
    // If notification is not supported or permission not granted, return
    if (!notificationSupported || !secureContext || Notification.permission !== 'granted') {
      console.warn('Notifications not available:', 
        !notificationSupported ? 'Not supported' : 
        !secureContext ? 'Not secure context' : 
        'Permission not granted');
      
      // Fall back to console and document title notifications
      useDocumentTitleNotification();
      return;
    }
    
    // Get the user's name if available
    const userName = getFromStorage('legDayUserName') || '';
    
    // Update notification state
    const notificationState = {
      acknowledged: false,
      date: new Date().toDateString(),
      lastShown: new Date().toISOString()
    };
    saveToStorage('legDayNotificationState', notificationState);
    
    // Try to use service worker for notification if available
    if ('serviceWorker' in navigator && 
        navigator.serviceWorker.controller && 
        window.location.protocol === 'https:') {
      
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification("🦵 DON'T SKIP LEG DAY! 🦵", {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200]
        });
        return;
      }).catch(err => {
        console.error('Service worker notification failed:', err);
        // Fall back to regular notification
        showRegularNotification(message);
      });
    } else {
      // Use regular notification
      showRegularNotification(message);
    }
    
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
    showRegularNotification(message);
  };
  
  // Fallback notification method using document title
  const useDocumentTitleNotification = () => {
    const originalTitle = document.title;
    let titleInterval;
    
    // Alternate the document title as a notification
    titleInterval = setInterval(() => {
      document.title = document.title === originalTitle ? 
        "🦵 DON'T SKIP LEG DAY! 🦵" : originalTitle;
    }, 1000);
    
    // Clear interval after 30 seconds
    setTimeout(() => {
      clearInterval(titleInterval);
      document.title = originalTitle;
    }, 30000);
    
    // Try again after a minute
    setTimeout(() => {
      useDocumentTitleNotification();
    }, 60000);
  };
  
  // Function to show regular browser notification
  const showRegularNotification = (message) => {
      try {
        // Create notification
        const notification = new Notification("🦵 DON'T SKIP LEG DAY! 🦵", {
          body: message,
          requireInteraction: true, // Notification persists until user interacts
          vibrate: [200, 100, 200, 100, 200, 100, 400], // Vibration pattern for mobile
          badge: "/favicon.ico",
          icon: "/favicon.ico"
        });
        
        // Handle notification click
        notification.onclick = () => {
          // Focus on the window if possible
          window.focus();
          
          // Mark as acknowledged
          saveToStorage('legDayNotificationState', {
            acknowledged: true,
            date: new Date().toDateString()
          });
          
          // Clear reminder timers
          if (window.legDayNotificationTimer) {
            clearTimeout(window.legDayNotificationTimer);
          }
          
          if (window.legDayNotificationInterval) {
            clearInterval(window.legDayNotificationInterval);
            window.legDayNotificationInterval = null;
          }
          
          // Close the notification
          notification.close();
          
          // Call the callback if provided
          if (onNotificationClick) {
            onNotificationClick();
          }
        };
      } catch (error) {
        console.error('Failed to show notification:', error);
        useDocumentTitleNotification();
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
  
  // Return null as this component doesn't render any UI
  return null;
};

export default NotificationManager;
