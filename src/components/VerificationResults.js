import React from 'react';
import chickenLegs from '../assets/memes/chicken-legs.png';
import cautionChickenLegs from '../assets/memes/caution-chicken-legs.png';

const VerificationResults = ({ result, onPunishmentStart, onSuccess }) => {
  const successMessages = [
    "Incredible gains detected! Alarm off!",
    "Those are TREE TRUNKS, not legs! You pass!",
    "We're impressed! Your quads are MASSIVE!",
    "Leg day champion detected! Keep up the good work!",
    "Squatting beast mode confirmed! You're free to go!",
    "SQUATS DETECTED! We're so proud of you!",
    "THICK THIGHS SAVE LIVES! Nice work!",
    "Impressive quads! You didn't skip leg day!"
  ];
  
  const failureMessages = [
    "Chicken legs spotted! Punishment mode activated.",
    "Did you say you've been skipping leg day? It shows...",
    "ERROR: Unable to differentiate between toothpicks and legs.",
    "Your calves have filed a missing persons report!",
    "Leg size insufficient. Please try again after leg day.",
    "404: MUSCLES NOT FOUND. Have you tried squats?",
    "Your quads called... they miss you!",
    "ALERT: Barbie Girl music inbound as punishment!",
    "Scanners detected twigs where legs should be!"
  ];
  
  const randomSuccessMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
  const randomFailureMessage = failureMessages[Math.floor(Math.random() * failureMessages.length)];
  
  return (
    <div className="card" style={{
      background: result.success ? 
        'linear-gradient(145deg, #e6ffec, #c1f8d2)' : 
        'linear-gradient(145deg, #ffefe8, #ffccc4)',
      padding: '1.5rem',
      animation: 'bounceIn 0.8s'
    }}>
      <h2 className="app-title" style={{
        fontSize: '1.8rem', 
        color: result.success ? '#15803d' : '#b91c1c',
        textShadow: '2px 2px 0 rgba(0,0,0,0.1)',
        animation: result.success ? 'pulse 2s infinite' : 'shake 0.8s infinite'
      }}>
        <span style={{ fontSize: '2rem' }}>
          {result.success ? '✅' : '❌'}
        </span> 
        {result.success ? 'VERIFICATION SUCCESS!' : 'VERIFICATION FAILED!'}
      </h2>
      
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '1rem',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '1rem',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        animation: 'bounceIn 1s'
      }}>
        <p style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: result.success ? '#15803d' : '#b91c1c',
          textAlign: 'center',
          margin: '0 0 1rem 0'
        }}>
          {result.success ? randomSuccessMessage : randomFailureMessage}
        </p>
        
        {result.success ? (
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.8)',
            border: '2px solid #86efac',
            textAlign: 'center'
          }}>
            <p style={{ color: '#166534', fontWeight: 'bold' }}>
              Congratulations! You've proven your dedication to leg day.
            </p>
            <p style={{ color: '#166534' }}>
              Your alarm has been silenced until next week.
            </p>
            <div style={{ fontSize: '3rem', margin: '1rem 0', textAlign: 'center' }}>
              💪 🏆 🎉
            </div>
          </div>
        ) : (
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            background: 'rgba(255,255,255,0.8)',
            border: '2px solid #fecaca',
            textAlign: 'center'
          }}>
            <p style={{ color: '#b91c1c', fontWeight: 'bold' }}>
              Our highly sophisticated* leg detection AI has determined that you've been skipping leg day.
            </p>
            <p style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
              *Not actually sophisticated at all
            </p>
            <div style={{ fontSize: '2rem', margin: '0.5rem 0', textAlign: 'center', animation: 'shake 2s infinite' }}>
              🐓 🦵 🚫
            </div>
          </div>
        )}
      </div>
      
      {!result.success && (
        <div style={{ marginBottom: '1.5rem', animation: 'bounceIn 1s' }}>
          <h3 style={{ 
            fontSize: '1.2rem', 
            fontWeight: 'bold', 
            color: '#b91c1c',
            textAlign: 'center',
            margin: '0 0 1rem 0'
          }}>
            CHICKEN LEG MEMES:
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div className="card" style={{
              padding: '0.5rem',
              background: 'white',
              transform: 'rotate(-1deg)',
              boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
            }}>
              <img src={chickenLegs} alt="Chicken legs meme" style={{
                width: '100%',
                borderRadius: '0.5rem'
              }} />
              <p style={{ marginTop: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                Your legs after skipping leg day
              </p>
            </div>
            <div className="card" style={{
              padding: '0.5rem',
              background: 'white',
              transform: 'rotate(1deg)',
              boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
            }}>
              <img src={cautionChickenLegs} alt="Caution chicken legs meme" style={{
                width: '100%',
                borderRadius: '0.5rem'
              }} />
              <p style={{ marginTop: '0.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                CAUTION: CHICKEN LEGS!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '1.5rem' }}>
        {result.success ? (
          <button
            onClick={onSuccess}
            style={{
              width: '100%',
              background: 'linear-gradient(145deg, #34d399, #10b981)',
              color: 'white',
              fontWeight: 'bold',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: '60px'
            }}>
            Awesome! See You Next Week! 💪
          </button>
        ) : (
          <button
            onClick={onPunishmentStart}
            style={{
              width: '100%',
              background: 'linear-gradient(145deg, #f87171, #dc2626)',
              color: 'white',
              fontWeight: 'bold',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontSize: '1.1rem',
              boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minHeight: '60px',
              animation: 'pulse 2s infinite'
            }}>
            Time For Punishment! 😭
          </button>
        )}
      </div>
    </div>
  );
};

export default VerificationResults;
