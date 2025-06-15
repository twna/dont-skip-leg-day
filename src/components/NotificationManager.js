import { useEffect, useState } from 'react';
import { getFromStorage, saveToStorage } from '../utils/storage';

const NotificationManager = ({ onNotificationClick }) => {
  const [notificationSupported, setNotificationSupported] = useState(true);
  const [secureContext, setSecureContext] = useState(true);

  // Fallback notification method using document title
  const flashDocumentTitle = () => {
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
      flashDocumentTitle();
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
      
      // Add click event handler to stop notifications when clicked
      notification.onclick = function() {
        console.log('Notification clicked - stopping notifications');
        // Mark as acknowledged
        const notificationState = {
          acknowledged: true,
          date: new Date().toDateString(),
          lastShown: new Date().toISOString()
        };
        saveToStorage('legDayNotificationState', notificationState);
        
        // Clear any notification intervals
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
        
        // Focus the window
        window.focus();
      };
    } catch (error) {
      console.error('Failed to show notification:', error);
      flashDocumentTitle();
    }
  };

  // Main notification function
  const showNotification = () => {
    // If notification is not supported or permission not granted, return
    if (!notificationSupported || !secureContext || Notification.permission !== 'granted') {
      console.warn('Notifications not available:', 
        !notificationSupported ? 'Not supported' : 
        !secureContext ? 'Not secure context' : 
        'Permission not granted');
      
      // Fall back to console and document title notifications
      flashDocumentTitle();
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
    
    // Use different messages to grab attention
    const messages = [
      `${userName ? `Hey ${userName}! ` : ''}It's time to verify those quads! Click here NOW!`,
      `${userName ? `Hey ${userName}! ` : ''}DON'T IGNORE LEG DAY! Verify your quads immediately!`,
      `${userName ? `Hey ${userName}! ` : ''}Your legs are crying for attention! Click to verify NOW!`,
      `${userName ? `Hey ${userName}! ` : ''}WARNING: Skipping leg day detected! Click to verify.`,
      `${userName ? `Hey ${userName}! ` : ''}⚠️ URGENT: Leg verification required immediately!`
    ];
    
    // Randomly select a message to keep it fresh and annoying
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    // Try to use service worker for notification if available
    if ('serviceWorker' in navigator && 
        navigator.serviceWorker.controller && 
        window.location.protocol === 'https:') {
      
      navigator.serviceWorker.ready.then(registration => {
        console.log('Service worker ready, sending notification');
        registration.showNotification("🦵 DON'T SKIP LEG DAY! 🦵", {
          body: message,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
          data: { acknowledged: true }, // Add data for the click handler
          actions: [
            { action: 'acknowledge', title: 'Acknowledge' }
          ]
        });
        console.log('Notification sent via service worker');
        
        // Add notification click event listener to service worker
        navigator.serviceWorker.addEventListener('message', function(event) {
          if (event.data && event.data.action === 'notificationClick') {
            console.log('Notification was clicked - stopping notifications');
            // Mark as acknowledged
            const notificationState = {
              acknowledged: true,
              date: new Date().toDateString(),
              lastShown: new Date().toISOString()
            };
            saveToStorage('legDayNotificationState', notificationState);
            
            // Clear notification interval
            if (window.legDayNotificationInterval) {
              clearInterval(window.legDayNotificationInterval);
              window.legDayNotificationInterval = null;
            }
          }
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
    
    // Update leaderboard data if we have a username
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
    
    // We'll only try to play sound in response to user interaction
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
  
  // Setup notification check interval
  const setupNotificationCheck = () => {
    // Check for alarm every minute
    window.notificationInterval = setInterval(checkAlarm, 60000);
    
    // Also check immediately
    checkAlarm();
  };
  
  // Show notification immediately without checking day or time
  const checkAlarm = () => {
    console.log('Checking alarm - immediate notification mode');
    const savedAlarm = getFromStorage('legDayAlarm');
    
    if (!savedAlarm) {
      console.log('No alarm data found in storage, showing notification anyway');
      showNotification();
      return;
    }
    
    const { active } = savedAlarm;
    console.log('Alarm active status:', active);
    
    // Even if alarm is not active, we'll still show notification in this mode
    // Just log the status but proceed anyway
    if (!active) {
      console.log('Alarm is not active, but showing notification anyway');
    }
    
    const now = new Date();
    const currentDate = now.toDateString();
    
    // Get notification state
    const notificationState = getFromStorage('legDayNotificationState') || {};
    console.log('Notification state:', notificationState);
    
    // Check if notification has been acknowledged today
    if (!notificationState.acknowledged || notificationState.date !== currentDate) {
      console.log('Showing notification - always mode');
      showNotification();
    } else {
      console.log('Notification already acknowledged today, but showing again anyway');
      // In always mode, we'll reset acknowledgment to trigger new notifications
      const resetState = {
        acknowledged: false,
        date: currentDate,
        lastShown: new Date().toISOString()
      };
      saveToStorage('legDayNotificationState', resetState);
      showNotification();
    }
  };
  
  useEffect(() => {
    console.log('NotificationManager initialized');
    // Check if we're in a secure context (HTTPS or localhost)
    const isSecureContext = window.isSecureContext;
    console.log('Secure context?', isSecureContext);
    setSecureContext(isSecureContext);
    
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.error("This browser does not support notifications");
      setNotificationSupported(false);
      return;
    }
    console.log('Notifications supported, permission:', Notification.permission);
    
    // Always register service worker
    if ('serviceWorker' in navigator) {
      console.log('Service worker supported, registering');
      const swPath = window.location.protocol === 'https:' ? '/dont-skip-leg-day/service-worker.js' : '/service-worker.js';
      navigator.serviceWorker.register(swPath)
        .then(registration => {
          console.log('ServiceWorker registration successful', registration);
        })
        .catch(err => {
          console.error('ServiceWorker registration failed: ', err);
        });
    } else {
      console.log('Service worker not supported');
    }
    
    // If permission already granted
    if (Notification.permission === "granted") {
      console.log('Notification permission already granted');
      // Set up the notification check interval
      setupNotificationCheck();
      
      // Immediately check if we should show a notification for testing
      setTimeout(() => {
        console.log('Testing notification display');
        checkAlarm();
      }, 3000);
      
    } else if (Notification.permission !== "denied") {
      console.log('Requesting notification permission');
      // Request permission if not denied already
      Notification.requestPermission().then(permission => {
        console.log('Permission response:', permission);
        if (permission === "granted") {
          setupNotificationCheck();
          
          // Test notification after permission granted
          setTimeout(() => {
            console.log('Testing notification after permission granted');
            showNotification();
          }, 2000);
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
  
  // This component doesn't render any UI
  return null;
};

export default NotificationManager;
