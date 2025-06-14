import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = ({ onVerificationComplete }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [fileUpload, setFileUpload] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const webcamRef = useRef(null);

  const capture = () => {
    setIsCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setIsCapturing(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
        setFileUpload(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setFileUpload(null);
  };

  const verifyLegs = () => {
    setIsVerifying(true);
    
    // Simulate verification process with a silly "analysis"
    setTimeout(() => {
      // Always fail - 0% chance of success, 100% chance of failure
      const isSuccess = false;
      
      onVerificationComplete({
        success: isSuccess,
        image: capturedImage
      });
      
      setIsVerifying(false);
      setCapturedImage(null);
      setFileUpload(null);
    }, 2000);
  };

  const webcamHeight = 480;
  const webcamWidth = 640;

  return (
    <div className="card" style={{
      background: 'linear-gradient(145deg, #e6f2ff, #c1e1ff)',
      padding: '1.5rem',
      animation: 'bounceIn 0.8s'
    }}>
      <h2 className="app-title" style={{ 
        fontSize: '1.8rem', 
        color: '#1e40af', 
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: '2rem', animation: 'pulse 2s infinite' }}>📷</span> 
        QUAD VERIFICATION
      </h2>
      
      {!capturedImage ? (
        <div>
          <div style={{ 
            position: 'relative', 
            marginBottom: '1.5rem',
            boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: 'user'
              }}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                border: '4px solid #93c5fd'
              }}
            />
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '5px',
              padding: '5px 10px',
              color: 'white',
              fontSize: '0.8rem'
            }}>
              Show those legs!
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <button 
              onClick={capture}
              disabled={isCapturing}
              style={{
                background: 'linear-gradient(145deg, #3b82f6, #1d4ed8)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                minHeight: '60px',
                opacity: isCapturing ? '0.7' : '1',
                transition: 'all 0.3s ease'
              }}
            >
              {isCapturing ? '📸 Capturing...' : '📸 Capture Your Legs'}
            </button>
            
            <div>
              <label style={{
                display: 'block',
                background: 'linear-gradient(145deg, #6b7280, #4b5563)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                minHeight: '60px'
              }}>
                📁 Upload Leg Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '0.75rem',
            fontStyle: 'italic',
            animation: 'bounceIn 1s' 
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              "Show us those quads! 💪"
            </p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              We promise our AI can totally tell the difference between chicken legs and tree trunks! 🐓 🌳
            </p>
            <div style={{ fontSize: '2rem', marginTop: '0.5rem' }}>
              💡 🦵 🔎
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ 
            marginBottom: '1.5rem',
            position: 'relative',
            boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <img 
              src={capturedImage} 
              alt="Captured" 
              style={{
                width: '100%',
                borderRadius: '12px',
                border: '4px solid #93c5fd'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              background: 'rgba(0,0,0,0.7)',
              borderRadius: '5px',
              padding: '5px 10px',
              color: 'white',
              fontSize: '0.8rem'
            }}>
              {fileUpload ? `File: ${fileUpload}` : 'Webcam capture'}
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <button 
              onClick={resetCapture}
              style={{
                background: 'linear-gradient(145deg, #6b7280, #4b5563)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                minHeight: '48px'
              }}
            >
              ♻️ Retake Photo
            </button>
            
            <button 
              onClick={verifyLegs}
              disabled={isVerifying}
              style={{
                background: 'linear-gradient(145deg, #10b981, #059669)',
                color: 'white',
                fontWeight: 'bold',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                minHeight: '48px',
                opacity: isVerifying ? '0.7' : '1',
                transition: 'all 0.3s ease',
                animation: 'pulse 2s infinite'
              }}
            >
              {isVerifying ? '🤓 Analyzing those quads...' : '🔍 Verify Leg Day'}
            </button>
          </div>
          
          {isVerifying && (
            <div style={{
              marginTop: '1rem',
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '0.75rem',
              animation: 'pulse 1.5s infinite'
            }}>
              <p style={{
                fontWeight: 'bold',
                color: '#1e40af',
                fontSize: '1.1rem'
              }}>
                🧠 Running state-of-the-art chicken leg detection...
              </p>
              <div style={{
                fontSize: '2rem',
                marginTop: '0.5rem',
                animation: 'spin 2s linear infinite'
              }}>
                🔍
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
