
import React from 'react';
import NotificationList from '@/components/notifications/NotificationList';

const NotificationsPage: React.FC = () => {
  return (
    <div className="mx-auto py-6 container">
      <h1 className="mb-6 font-bold text-2xl">Your Notifications</h1>
      <NotificationList />
    </div>
  );
};

export default NotificationsPage;
