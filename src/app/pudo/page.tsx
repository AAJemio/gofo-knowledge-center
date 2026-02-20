
import React from 'react';
import AKCNavigation from '@/components/AKCNavigation';
import PudoList from './PudoList';

export default function PudoPage() {
    return (
        <div className="min-h-screen bg-[#FFFBF0] dark:bg-[#0a0a0a] transition-colors duration-300">
            <AKCNavigation />
            <PudoList />
        </div>
    );
}
