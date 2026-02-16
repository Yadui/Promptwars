import React from 'react';

const MechanicNotification = ({ message }) => {
    if (!message) return null;

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
                letterSpacing: '2px'
            }}>
                {message}
            </h1>
        </div>
    );
};

export default MechanicNotification;
