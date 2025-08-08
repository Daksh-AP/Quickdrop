import React from 'react';

interface GradientBackgroundProps {
    children: React.ReactNode;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ children }) => {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #0077BE, #00C4CC, #87CEEB)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0, 119, 190, 0.2)',
        }}>
            {children}
        </div>
    );
};

export default GradientBackground;