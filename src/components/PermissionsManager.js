import React, { useState, useEffect } from 'react';
import { saveToStorage, getFromStorage } from '../utils/storage';

const PermissionsManager = () => {
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState({
    notifications: false,
    camera: false,
    audio: false
  });

  useEffect(() => {
    // Check if we've already requested permissions
    const savedPermissions = getFromStorage('legDayPermissions');
    
    // If not, show the permission alert
    if (!savedPermissions || !savedPermissions.requested) {
      setShowPermissionAlert(true);
    } else {
      // Check current permission statuses
      checkPermissionStatuses();
    }
  }, []);

  const checkPermissionStatuses = async () => {
    // Check notification permission
    const notificationPermission = "Notification" in window ? 
      Notification.permission === "granted" : false;

    // Check camera permission (indirectly)
    let cameraPermission = false;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      if (cameras.length > 0) {
        // We can't directly check permission status, but we can see if cameras are accessible
        cameraPermission = true;
      }
    } catch (err) {
      console.log('Camera permission check failed:', err);
    }

    // Update state with current permissions
    setPermissionsGranted({
      notifications: notificationPermission,
      camera: cameraPermission,
      audio: true // Audio doesn't need persistent permission in most browsers
    });
  };

  const requestAllPermissions = async () => {
    // Request notification permission
    if ("Notification" in window) {
      const notificationResult = await Notification.requestPermission();
      setPermissionsGranted(prev => ({
        ...prev, 
        notifications: notificationResult === 'granted'
      }));
    }

    // Request camera permission
    try {
      // Just requesting camera access will trigger browser permission prompt
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setPermissionsGranted(prev => ({ ...prev, camera: true }));
      
      // Always release the camera after permission check
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.log('Camera permission denied:', err);
      setPermissionsGranted(prev => ({ ...prev, camera: false }));
    }

    // Test audio playback
    try {
      const audio = new Audio();
      audio.src = `${process.env.PUBLIC_URL}/success.mp3`;
      // Just loading it is enough to test if audio can be played
      audio.load();
      audio.volume = 0.1;
      const playPromise = audio.play();
      
      if (playPromise) {
        playPromise.then(() => {
          // Audio played successfully
          setPermissionsGranted(prev => ({ ...prev, audio: true }));
          // Stop the audio after a brief moment
          setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
          }, 500);
        }).catch(err => {
          console.log('Audio permission issue:', err);
          setPermissionsGranted(prev => ({ ...prev, audio: false }));
        });
      }
    } catch (err) {
      console.log('Audio test error:', err);
    }

    // Save that we've requested permissions
    saveToStorage('legDayPermissions', { requested: true });
    
    // Hide the alert
    setShowPermissionAlert(false);
  };

  if (!showPermissionAlert) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          color: '#1e40af',
          marginBottom: '10px' 
        }}>🦵 Don't Skip Permissions Day! 🦵</h2>
        
        <p style={{ fontSize: '16px', marginBottom: '15px' }}>
          This app needs the following permissions to function properly:
        </p>
        
        <ul style={{ 
          textAlign: 'left', 
          margin: '20px auto',
          maxWidth: '400px',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          <li><strong>Notifications</strong> - To remind you about leg day</li>
          <li><strong>Camera</strong> - To verify your quad gains</li>
          <li><strong>Audio</strong> - For audio feedback and motivation</li>
        </ul>
        
        <p style={{ fontSize: '14px', marginBottom: '20px', fontStyle: 'italic' }}>
          You'll be prompted to accept each permission by your browser.
          Please accept all to enjoy the full "Don't Skip Leg Day" experience!
        </p>
        
        <button onClick={requestAllPermissions} style={{
          backgroundColor: '#1e40af',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '12px 24px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}>
          Accept All Permissions
        </button>
      </div>
    </div>
  );
};

export default PermissionsManager;
