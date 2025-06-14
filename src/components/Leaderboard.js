import React, { useState, useEffect } from 'react';
import { getFromStorage } from '../utils/storage';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fake user data to populate the leaderboard
  const fakeUsers = [
    { name: "Chicken Legs Alvin", notificationCount: 14 },
    { name: "Skip-a-lot Kim You", notificationCount: 8 },
    { name: "No-Show Nancy", notificationCount: 6 },
    { name: "Barbie Girl Barry", notificationCount: 5 },
    { name: "Lazy Legs Larry", notificationCount: 3 },
    { name: "Dodging Dan", notificationCount: 2 }
  ];

  useEffect(() => {
    // Load leaderboard data from localStorage
    let data = getFromStorage('legDayLeaderboard') || [];
    
    // If we have no data or just 1 user, add fake users for a better experience
    if (data.length <= 1) {
      // If we have a real user, keep them in the data
      const realUser = data.length === 1 ? data[0] : null;
      
      // Add fake users to the data
      data = [...fakeUsers];
      
      // Add the real user back if they exist
      if (realUser) {
        data.push(realUser);
      }
      
      // Save to localStorage for persistence
      // We don't actually save the fake users to avoid confusion with real data
      // saveToStorage('legDayLeaderboard', data);
    }
    
    // Sort by notification count (highest first)
    const sortedData = [...data].sort((a, b) => b.notificationCount - a.notificationCount);
    
    setLeaderboardData(sortedData);
    setLoading(false);
  }, []);

  // Get a suitable emoji for each ranking position
  const getPositionEmoji = (position) => {
    switch(position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };
  
  // Get a funny message based on rank
  const getRankingMessage = (position) => {
    switch(position) {
      case 0: return 'Ultimate Leg Day Skipper!';
      case 1: return 'Almost the Worst Skipper!';
      case 2: return 'Bronze in Skipping!';
      case 3: return 'Honorable Mention in Laziness';
      case 4: return 'Working Their Way Up in Slacking';
      default: return 'Occasional Skipper';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
      borderRadius: '15px',
      padding: '20px',
      margin: '20px auto',
      maxWidth: '600px',
      width: '100%',
      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)'
    }}>
        <h2 style={{
          color: 'white',
          fontSize: '24px',
          margin: '0 0 15px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          🦵 Chicken Legs Leaderboard 🏆
        </h2>
        
        <p style={{
          color: 'white',
          marginBottom: '20px'
        }}>
          The Wall of Shame: Users ranked by most leg day notifications received!
        </p>
        
        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Loading leaderboard...</p>
        ) : leaderboardData.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'white', margin: 0 }}>No leg day skippers yet! Be the first to join the leaderboard!</p>
          </div>
        ) : (
          <div>
            {leaderboardData.map((user, index) => (
              <div 
                key={user.name} 
                style={{
                  backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                  padding: '15px',
                  borderRadius: '10px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: index === 0 ? '2px solid gold' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '24px',
                    marginRight: '15px'
                  }}>
                    {getPositionEmoji(index)}
                  </span>
                  <div>
                    <p style={{ 
                      color: 'white', 
                      margin: '0 0 5px 0',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {user.name}
                    </p>
                    <p style={{ 
                      color: 'white', 
                      margin: 0,
                      fontSize: '14px',
                      opacity: 0.9
                    }}>
                      {getRankingMessage(index)}
                    </p>
                  </div>
                </div>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  <span style={{ 
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {user.notificationCount} 
                  </span>
                  <span style={{ 
                    color: 'white',
                    marginLeft: '3px',
                    fontSize: '14px'
                  }}>
                    {user.notificationCount === 1 ? 'skip' : 'skips'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
};

export default Leaderboard;
