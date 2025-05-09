import React from 'react';
import BadgeList from '@/components/badges/BadgeList';

const BadgesPage: React.FC = () => {
    return (
        <div>
            <h1 className="mb-6 font-bold text-2xl">Your Badges</h1>
            <BadgeList />
        </div>
    );
}

export default BadgesPage;