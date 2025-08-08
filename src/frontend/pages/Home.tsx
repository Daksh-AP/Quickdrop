import React from 'react';
import FileCard from '../components/FileCard';
import GradientBackground from '../components/GradientBackground';

const Home: React.FC = () => {
    return (
        <GradientBackground>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ color: '#fff' }}>Welcome to the P2P File Sharing App</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {/* Example File Cards */}
                    <FileCard fileName="Document.pdf" fileSize="2 MB" />
                    <FileCard fileName="Image.png" fileSize="1.5 MB" />
                    <FileCard fileName="Video.mp4" fileSize="10 MB" />
                </div>
            </div>
        </GradientBackground>
    );
};

export default Home;