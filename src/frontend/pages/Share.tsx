import React from 'react';
import FloatingActionButton from '../components/FloatingActionButton';
import GradientBackground from '../components/GradientBackground';
import FileCard from '../components/FileCard';

const Share: React.FC = () => {
    return (
        <GradientBackground>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ color: '#fff' }}>Share Your Files</h1>
                <FileCard />
                <FloatingActionButton />
            </div>
        </GradientBackground>
    );
};

export default Share;