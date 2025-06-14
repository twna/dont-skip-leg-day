import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import AlarmSetup from './components/AlarmSetup';
import NotificationManager from './components/NotificationManager';
import WebcamCapture from './components/WebcamCapture';
import VerificationResults from './components/VerificationResults';
import PunishmentMode from './components/PunishmentMode';
import UserNameInput from './components/UserNameInput';
import Leaderboard from './components/Leaderboard';
import PermissionsManager from './components/PermissionsManager';
import { getFromStorage, saveToStorage } from './utils/storage';

function App() {
  // App states
  const [appState, setAppState] = useState('name-check'); // Start with name-check instead of setup
  const [alarmData, setAlarmData] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [alarmActive, setAlarmActive] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Audio reference
  const audioRef = useRef(null);
  
  // Track user interaction to allow audio playback
  useEffect(() => {
    const markUserInteraction = () => {
      document.body.classList.add('user-interaction');
    };
    
    // Add listeners for various user interactions
    document.addEventListener('click', markUserInteraction);
    document.addEventListener('touchstart', markUserInteraction);
    document.addEventListener('keydown', markUserInteraction);
    
    return () => {
      document.removeEventListener('click', markUserInteraction);
      document.removeEventListener('touchstart', markUserInteraction);
      document.removeEventListener('keydown', markUserInteraction);
    };
  }, []);
  
  // Check for stored username on component mount
  useEffect(() => {
    const storedName = getFromStorage('legDayUserName');
    if (storedName) {
      setUserName(storedName);
      setAppState('setup');
    }
  }, []);
  
  // Handle when user sets their name
  const handleNameSet = (name) => {
    setUserName(name);
    setAppState('setup');
  };
  
  // Pre-load audio file path for later use
  useEffect(() => {
    // We're not initializing audio here anymore - just checking if audio exists
    const audioFile = `${process.env.PUBLIC_URL}/audio/barbie-girl.mp3`;
    const testAudio = new Audio();
    testAudio.src = audioFile;
    testAudio.preload = 'metadata';
    
    // Just test if we can load the metadata
    testAudio.onloadedmetadata = () => {
      console.log("Barbie Girl audio file is available!");
    };
    
    testAudio.onerror = () => {
      console.error("Couldn't find the audio file. Check that it exists in the public/audio folder.");
    };
    
    // We're not keeping this audio instance, just testing the file exists
    return () => {
      testAudio.src = '';
    };
  }, []); // Empty dependency array since this only needs to run once
  
  // Audio play/stop functions using native Audio API instead of Howler.js
  // This approach is more reliable across browsers
  const playAudio = () => {
    if (audioPlaying) return; // Don't create multiple instances
    
    try {
      // Clean up any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      // Create a new Audio element
      const audio = new Audio(`${process.env.PUBLIC_URL}/audio/barbie-girl.mp3`);
      audio.loop = true;
      audio.volume = 0.7;
      
      // Add event listeners
      audio.oncanplaythrough = () => {
        console.log('Audio can play through!');
      };
      
      audio.onplay = () => {
        console.log('Playing Barbie Girl!');
        setAudioPlaying(true);
      };
      
      audio.onerror = (e) => {
        console.error('Audio error:', e);
      };
      
      // Store in ref
      audioRef.current = audio;
      
      // Play with user gesture (this should work since we've added user interaction tracking)
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Audio playback started successfully');
          })
          .catch(err => {
            console.warn('Audio playback was prevented:', err);
            // Create a play button as fallback if autoplay is blocked
            const playButton = document.createElement('button');
            playButton.textContent = '▶️ Play Punishment Music';
            playButton.style.position = 'fixed';
            playButton.style.top = '10px';
            playButton.style.right = '10px';
            playButton.style.zIndex = '9999';
            playButton.style.padding = '10px';
            playButton.style.background = 'red';
            playButton.style.color = 'white';
            playButton.style.borderRadius = '8px';
            playButton.onclick = () => {
              audio.play();
              document.body.removeChild(playButton);
            };
            document.body.appendChild(playButton);
          });
      }
    } catch (err) {
      console.error('Failed to play audio:', err);
    }
  };
  
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setAudioPlaying(false);
      console.log('Stopped Barbie Girl');
    }
  };
  
  // Auto-set alarm on component mount
  useEffect(() => {
    // Default alarm settings
    const currentDay = new Date().getDay(); // 0 is Sunday in JavaScript
    const defaultAlarmDay = currentDay === 0 ? 1 : currentDay; // If Sunday, set to Monday
    const defaultAlarmTime = '01:27'; // Hardcoded time
    
    // Auto create and set the alarm
    const autoAlarmData = {
      day: defaultAlarmDay,
      time: defaultAlarmTime,
      active: true
    };
    
    // Save alarm data
    saveToStorage('legDayAlarm', autoAlarmData);
    setAlarmData(autoAlarmData);
    setAlarmActive(true);
    
    // Request notification permission automatically
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);
  
  // Handle alarm set/cancel
  const handleAlarmSet = (data) => {
    setAlarmData(data);
    
    // If alarm is being canceled, go back to setup state
    if (!data.active) {
      setAppState('setup');
      setAlarmActive(false);
    }
  };
  
  // Handle notification click
  const handleNotificationClick = () => {
    setAlarmActive(true);
    setAppState('verification');
  };
  
  // Handle verification complete
  const handleVerificationComplete = (result) => {
    setVerificationResult(result);
    setAppState('results');
    
    // If verification failed, start playing audio immediately
    if (!result.success) {
      playAudio();
    }
  };
  
  // Handle punishment start
  const handlePunishmentStart = () => {
    setAppState('punishment');
    
    // Force play audio again to ensure it's playing during punishment
    setTimeout(() => {
      // This fixes the issue where audio might not play due to browser restrictions
      document.body.classList.add('user-interaction'); // Force user-interaction class
      playAudio();
      
      // Create a visible play button if autoplay is still blocked
      // This is an additional failsafe if the auto-play doesn't work
      const container = document.createElement('div');
      container.id = 'punishment-audio-control';
      container.style.position = 'fixed';
      container.style.bottom = '20px';
      container.style.left = '20px';
      container.style.zIndex = '9999';
      container.style.background = '#ff4b4b';
      container.style.padding = '15px';
      container.style.borderRadius = '10px';
      container.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
      container.innerHTML = `
        <p style="margin:0 0 10px;font-weight:bold;color:white">🔊 Can't hear Barbie Girl?</p>
        <button id="force-play-button" style="background:#fff;color:#000;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;font-weight:bold">
          ▶️ PLAY PUNISHMENT MUSIC
        </button>
      `;
      
      // Only add this if it doesn't already exist
      if (!document.getElementById('punishment-audio-control')) {
        document.body.appendChild(container);
        document.getElementById('force-play-button').addEventListener('click', () => {
          // Create a brand new audio element and play it directly
          const barbieAudio = new Audio(`${process.env.PUBLIC_URL}/audio/barbie-girl.mp3`);
          barbieAudio.loop = true;
          barbieAudio.volume = 0.7;
          barbieAudio.play();
          audioRef.current = barbieAudio;
          setAudioPlaying(true);
          
          // Remove the control after playing
          document.body.removeChild(container);
        });
      }
    }, 500); // Small delay to ensure DOM is ready
  };
  
  // Handle punishment complete
  const handlePunishmentComplete = () => {
    // Stop the audio
    stopAudio();
    
    // Remove audio control if it exists
    const audioControl = document.getElementById('punishment-audio-control');
    if (audioControl) {
      audioControl.remove();
    }
    
    // Clear any timer
    if (window.legDayNotificationTimer) {
      clearTimeout(window.legDayNotificationTimer);
    }
    
    // Reset the alarm for next week
    const updatedAlarm = { ...alarmData, active: true };
    saveToStorage('legDayAlarm', updatedAlarm);
    setAlarmData(updatedAlarm);
    setAlarmActive(false);
    setAppState('setup');
  };
  
  // Handle cheating detected
  const handleCheatingDetected = () => {
    // Add funny messages when cheating is detected
    const messages = [
      "Nice try! We saw that!",
      "Did you think we wouldn't notice?",
      "Uh oh, motion detection police here!",
      "Trying to cheat the system? How dare you!"
    ];
    
    // Display a random message
    alert(messages[Math.floor(Math.random() * messages.length)]);
  };
  
  // Create emoji confetti
  const createEmojiConfetti = useCallback(() => {
    const emojis = ['💪', '🏋️', '🦵', '🏆', '🎉', '🥇', '👟', '🔥', '💯'];
    const confettiCount = 30;
    
    for (let i = 0; i < confettiCount; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'emoji-confetti';
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.fontSize = `${Math.random() * 20 + 20}px`;
      emoji.style.animationDuration = `${Math.random() * 2 + 2}s`;
      emoji.style.animationDelay = `${Math.random()}s`;
      
      document.body.appendChild(emoji);
      
      // Remove emoji after animation completes
      setTimeout(() => {
        document.body.removeChild(emoji);
      }, 4000);
    }
  }, []);
  
  // Success handler
  const handleSuccess = () => {
    // Make sure audio is stopped if it was playing
    stopAudio();
    
    // Launch emoji confetti celebration
    createEmojiConfetti();
    
    // Reset the notification state so they won't be bothered until next time
    saveToStorage('legDayNotificationState', {
      shown: false,
      acknowledged: true,
      date: new Date().toDateString()
    });
    
    // Clear any timer
    if (window.legDayNotificationTimer) {
      clearTimeout(window.legDayNotificationTimer);
    }
    
    // Reset the alarm for next week
    const updatedAlarm = { ...alarmData, active: true };
    saveToStorage('legDayAlarm', updatedAlarm);
    setAlarmData(updatedAlarm);
    setAlarmActive(false);
    setAppState('setup');
  };
  
  return (
    <div className="app-container">
      {/* Show permissions manager to request permissions */}
      <PermissionsManager />
      
      <div className="app-wrapper">
        {/* Header */}
        <header className="app-header">
          <h1 className="app-title">
            <span className="leg-emoji">🦵</span> 
            DON'T SKIP LEG DAY ALARM 
            <span className="leg-emoji">🦵</span>
          </h1>
          <p className="app-subtitle">"Friends don't let friends skip leg day—but we definitely mock them!"</p>
        </header>
        
        {/* Main content area */}
        <main className="main-content">
          {/* Show appropriate component based on app state */}
          {appState === 'name-check' && (
            <UserNameInput onNameSet={handleNameSet} />
          )}
          
          {appState === 'setup' && (
            <>
              <div style={{
                padding: '20px',
                backgroundColor: '#f0e6ff',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                textAlign: 'center',
                margin: '0 auto 20px',
                maxWidth: '600px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  color: '#4a148c'
                }}>
                  Hey {userName}! Your Leg Day Alarm is Active! 🎯
                </h2>
                <p style={{
                  marginBottom: '16px',
                  fontSize: '16px'
                }}>
                  Your leg day alarm has been automatically set for you.
                </p>
                <p style={{
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}>
                  Prepare those legs for a workout! We'll notify you when it's time.
                </p>
              </div>
              
              {/* Show leaderboard directly in the setup screen */}
              {userName && <Leaderboard />}
            </>
          )}
          
          {appState === 'verification' && (
            <WebcamCapture onVerificationComplete={handleVerificationComplete} />
          )}
          
          {appState === 'results' && verificationResult && (
            <VerificationResults 
              result={verificationResult} 
              onPunishmentStart={handlePunishmentStart}
              onSuccess={handleSuccess}
            />
          )}
          
          {appState === 'punishment' && (
            <PunishmentMode 
              onComplete={handlePunishmentComplete} 
              onCheatingDetected={handleCheatingDetected}
            />
          )}
        </main>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Don't Skip Leg Day Alarm</p>
          <p className="mt-1">Built with 💪 and lots of humor!</p>
        </footer>
      </div>
      
      {/* Notification manager */}
      {alarmData && alarmData.active && (
        <NotificationManager onNotificationClick={handleNotificationClick} />
      )}

      {/* No popup leaderboard anymore */}
    </div>
  );
}

export default App;
