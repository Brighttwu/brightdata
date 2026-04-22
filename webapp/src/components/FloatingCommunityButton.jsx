import React from 'react';
import { MessageCircle, Globe } from 'lucide-react';

const FloatingCommunityButton = ({ link }) => {
    if (!link || link === '#') return null;

    return (
        <a 
            href={link} 
            target="_blank" 
            rel="noreferrer"
            style={{
                position: 'fixed',
                bottom: 30,
                right: 30,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                zIndex: 1000,
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'pointer',
                textDecoration: 'none'
            }}
            className="floating-community-btn"
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        >
            <Globe size={28} />
            <div style={{
                position: 'absolute',
                right: -5,
                top: -5,
                background: '#fff',
                color: '#10b981',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 900,
                border: '2px solid #10b981',
                animation: 'pulse 2s infinite'
            }}>
                JOIN
            </div>
            
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                @media (max-width: 768px) {
                    .floating-community-btn { bottom: 20px; right: 20px; width: 50px; height: 50px; }
                }
            `}</style>
        </a>
    );
};

export default FloatingCommunityButton;
