import React from 'react';

const MechanicNotification = ({ message }) => {
    if (!message) return null;

    const isIncrease = message.includes("SPEED") || message.includes("ADRENALINE");
    const isDecrease = message.includes("SLOWING");

    const gradient = isIncrease
        ? 'linear-gradient(180deg, #ff4d4d 0%, #cc0000 100%)'
        : isDecrease
            ? 'linear-gradient(180deg, #4dff4d 0%, #00cc00 100%)'
            : 'linear-gradient(180deg, #ffeb3b 0%, #f44336 100%)';

    return (
        <div style={{
            position: 'absolute',
            top: '20%',
            left: '0',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 100
        }}>
            <h1 className="mechanic-notification" style={{
                fontSize: '2.5rem',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '2px',
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                {message}
            </h1>
        </div>
    );
};

export default MechanicNotification;
