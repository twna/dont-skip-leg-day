import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { getFromStorage } from '../utils/storage';

const PunishmentMode = ({ onComplete, onCheatingDetected }) => {
  const [squatCount, setSquatCount] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [encouragement, setEncouragement] = useState('Get ready to squat!');
  const [calibrationState, setCalibrationState] = useState('waiting'); // waiting, calibrating, ready
  
  const webcamRef = useRef(null);
  const timerRef = useRef(null);
  const analyzingRef = useRef(false);
  const audioRef = useRef(null);
  
  // Define required number of squats
  const requiredSquats = 30;
  
  // Simple messages for feedback
  const messages = [
    "Keep going! You can do it!",
    "Good job! Keep squatting!",
    "You're making progress!",
    "Great work! Don't stop now!",
    "Almost there! Keep it up!"
  ];
  
  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start motion detection when tracking is enabled
  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(analyzeMotion, 200);
      
      return () => {
        clearInterval(timerRef.current);
      };
    }
  }, [isTracking]);
  
  // Complete punishment when done
  useEffect(() => {
    if (squatCount >= requiredSquats) {
      onComplete();
    }
  }, [squatCount, onComplete, requiredSquats]);

  // Sound effects for feedback
  useEffect(() => {
    // Create audio elements for feedback
    audioRef.current = {
      success: new Audio('/success.mp3'),
      complete: new Audio('/complete.mp3')
    };
    
    // Set audio volumes
    Object.values(audioRef.current).forEach(audio => {
      if (audio) audio.volume = 0.5;
    });
    
    // Clean up audio
    return () => {
      Object.values(audioRef.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);
  
  // Start calibration process
  const startCalibration = () => {
    setCalibrationState('calibrating');
    setEncouragement('Stand back from the phone so we can measure the ambient light...');
    
    // Reset state
    setSquatCount(0);
    baselineBrightnessRef.current = null;
    brightnessBufferRef.current = [];
    squatStateRef.current = 'up';
    
    // After 3 seconds, start tracking
    setTimeout(() => {
      setCalibrationState('ready');
      setIsTracking(true);
      setEncouragement('Calibration complete! Start your squats by positioning yourself over the phone.');
      
      // Play success sound
      if (audioRef.current?.success) {
        audioRef.current.success.play().catch(err => console.log('Audio play error:', err));
      }
    }, 3000);
  };
  
  // References for squat detection
  const lastFrameTimeRef = useRef(0);
  const brightnessBufferRef = useRef([]);
  const squatStateRef = useRef('up'); // Current state: 'up' or 'down'
  const baselineBrightnessRef = useRef(null); // Baseline brightness when nobody is above camera
  
  // Basic brightness detection for squats
  const analyzeMotion = () => {
    if (analyzingRef.current || !webcamRef.current || !webcamRef.current.video.readyState) {
      return;
    }
    
    analyzingRef.current = true;
    
    try {
      // Get video element
      const video = webcamRef.current.video;
      const { videoHeight, videoWidth } = video;
      
      // Create canvas to analyze
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoWidth;
      canvas.height = videoHeight;
      
      // Draw current video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get full frame image data for analysis
      const fullFrameData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Calculate overall brightness of the frame
      const brightness = calculateBrightness(fullFrameData);
      
      // Update brightness buffer for stability (last 3 readings)
      brightnessBufferRef.current.push(brightness);
      if (brightnessBufferRef.current.length > 3) {
        brightnessBufferRef.current.shift();
      }
      
      // Average the last few readings for stability
      const avgBrightness = brightnessBufferRef.current.reduce((sum, val) => sum + val, 0) / 
                          brightnessBufferRef.current.length;
      
      // Calibration phase
      if (calibrationState === 'calibrating') {
        if (baselineBrightnessRef.current === null) {
          baselineBrightnessRef.current = avgBrightness;
          console.log("Initial baseline brightness set to", avgBrightness);
        }
        return; // Don't process further during calibration
      }
      
      // Establish baseline if not set (brightness when nobody is above camera)
      if (baselineBrightnessRef.current === null) {
        baselineBrightnessRef.current = avgBrightness;
        console.log("Baseline brightness set to", avgBrightness);
        setEncouragement("Place your phone on the floor facing up, then start squatting above it!");
        return;
      }
      
      // Current time for debouncing
      const now = Date.now();
      
      // Calculate brightness drop as a percentage of baseline
      // When someone is above the camera, brightness should drop significantly
      const brightnessDrop = Math.max(0, 1 - (avgBrightness / baselineBrightnessRef.current));
      
      // Detect squat based on brightness changes
      const SQUAT_THRESHOLD = 0.3; // 30% brightness drop to count as a squat
      const timeSinceLastFrame = now - lastFrameTimeRef.current;
      
      // Simple state machine for squat detection
      if (brightnessDrop > SQUAT_THRESHOLD && squatStateRef.current === 'up' && timeSinceLastFrame > 700) {
        // Transition to down state - someone is over the camera
        squatStateRef.current = 'down';
        setEncouragement("Going down! Keep it up!");
      } 
      else if (brightnessDrop < 0.15 && squatStateRef.current === 'down' && timeSinceLastFrame > 700) {
        // Transition back to up state - complete squat
        squatStateRef.current = 'up';
        lastFrameTimeRef.current = now;
        
        // Increment squat count
        setSquatCount(prevCount => {
          const newCount = prevCount + 1;
          
          // Play success sound
          if (audioRef.current?.success) {
            audioRef.current.success.play().catch(err => console.log('Audio error:', err));
          }
          
          // Show random encouragement message
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setEncouragement(`${randomMessage} (${newCount}/${requiredSquats})`);
          
          return newCount;
        });
      }
    } catch (error) {
      console.error('Error analyzing motion:', error);
    } finally {
      analyzingRef.current = false;
    }
  };
  
  // Helper function to calculate brightness of image data
  const calculateBrightness = (imageData) => {
    let totalBrightness = 0;
    const { data, width, height } = imageData;
    const pixelCount = width * height;
    
    // Process pixels (sampling every 20th pixel for performance)
    for (let i = 0; i < data.length; i += 80) { // 4 channels * 20 pixels
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate brightness (simple average)
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
    }
    
    // Calculate average brightness - scale by 20 due to sampling
    return totalBrightness / (pixelCount / 20);
  };
  
  return (
    <div className="punishment-mode">
      <div className="webcam-container">
        <Webcam
          ref={webcamRef}
          audio={false}
          width={640}
          height={480}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: "user" }}
          className="webcam"
        />
        
        {/* Overlay with squat counter */}
        <div className="squat-counter">
          <div className="counter-background"></div>
          <div className="counter-text">
            <span className="count">{squatCount}</span>
            <span className="total">/ {requiredSquats}</span>
          </div>
        </div>
        
        {/* Instruction/encouragement display */}
        <div className="encouragement">
          <div className="encouragement-background"></div>
          <div className="encouragement-text">{encouragement}</div>
        </div>
      </div>

      {/* Calibration & instruction buttons */}
      <div className="controls">
        {calibrationState === 'waiting' && (
          <button onClick={startCalibration} className="start-button">
            Start Calibration
          </button>
        )}
        
        {/* Instructions for using the phone for squats */}
        <div className="instructions">
          <h3>How to use:</h3>
          <ol>
            <li>Place your phone on the floor facing up</li>
            <li>Press "Start Calibration"</li>
            <li>Stand back during calibration</li>
            <li>Once calibrated, squat directly above your phone</li>
            <li>Complete {requiredSquats} squats to finish</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PunishmentMode;
