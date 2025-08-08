import React from 'react';

const GradientBackground: React.FC = ({ children }) => {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #FF6F61, #6FA3EF)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}>
            {children}
        </div>
    );
};

export default GradientBackground;