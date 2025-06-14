import React, { useState } from 'react';
import { saveToStorage } from '../utils/storage';

const UserNameInput = ({ onNameSet }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    // Save name to localStorage
    saveToStorage('legDayUserName', name.trim());
    
    // Notify parent component
    onNameSet(name.trim());
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
      borderRadius: '15px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
    }}>
      <h2 style={{ 
        color: 'white',
        marginBottom: '20px',
        fontWeight: 'bold',
        fontSize: '28px'
      }}>
        👋 Welcome to Don't Skip Leg Day!
      </h2>
      
      <p style={{
        color: 'white',
        marginBottom: '20px',
        fontSize: '18px'
      }}>
        I'll be your personal leg day reminder. Let's start with your name:
      </p>
      
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '350px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError('');
          }}
          placeholder="Enter your name"
          style={{
            padding: '12px 15px',
            fontSize: '16px',
            width: '100%',
            borderRadius: '8px',
            border: '2px solid #fff',
            marginBottom: '10px',
            background: 'rgba(255,255,255,0.9)'
          }}
        />
        
        {error && (
          <p style={{ color: '#fff', fontWeight: 'bold', marginBottom: '10px' }}>
            {error}
          </p>
        )}
        
        <button 
          type="submit"
          style={{
            padding: '12px 20px',
            background: '#2a2a72',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            width: '100%',
            transition: 'background 0.3s ease'
          }}
        >
          Let's Get Started! 💪
        </button>
      </form>
    </div>
  );
};

export default UserNameInput;
