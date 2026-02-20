import React from 'react';

interface BrandLogoProps {
    className?: string;
    variant?: 'color' | 'white'; // In case we have different versions of the logo
}

export function BrandLogo({ className = "h-8 w-auto", variant = 'color' }: BrandLogoProps) {
    // Using the new high-quality logo. 
    // Assuming 'Gofo.png' is the color version.
    const logoSrc = "/Gofo logo 2.png";

    return (
        <img
            src={logoSrc}
            alt="Gofo Logo"
            className={`object-contain ${className}`}
        />
    );
}
