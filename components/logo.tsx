import React from 'react';

interface LogoProps {
    className?: string;
}

export default function Logo({ className = "h-10 w-auto" }: LogoProps) {
    return (
        <svg 
            viewBox="0 0 120 120" 
            className={className} 
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
        >
            {/* Orange S */}
            <text 
                x="40" 
                y="55" 
                fontFamily="Georgia, 'Times New Roman', serif" 
                fontSize="72" 
                fontWeight="normal"
                fill="#F27121" 
                textAnchor="middle"
            >
                S
            </text>
            
            {/* Diagonal Slash */}
            <line 
                x1="20" 
                y1="100" 
                x2="100" 
                y2="20" 
                stroke="#333333" 
                strokeWidth="4" 
                strokeLinecap="round"
            />
            
            {/* Black T */}
            <text 
                x="80" 
                y="105" 
                fontFamily="Georgia, 'Times New Roman', serif" 
                fontSize="72" 
                fontWeight="normal"
                fill="#222222" 
                textAnchor="middle"
            >
                T
            </text>
        </svg>
    );
}
