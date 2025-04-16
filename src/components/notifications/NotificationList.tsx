
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Check, Calendar, Trophy, Award } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Loading from '../ui/Loading';

const NotificationList: React.FC = () => {
  const notifications = [
    {
      id: "1",
      type: "deadline",
      message: 'Your task "Complete React project" is due tomorrow!',
      createdAt: "2023-10-01T10:00:00Z",
      read: false,
    },
    {
      id: "2",
      type: "levelUp",
      message: "Congratulations! You have leveled up to Level 5!",
      createdAt: "2023-09-30T15:30:00Z",
      read: true,
    },
    {
      id: "3",
      type: "badge",
      message: 'You earned the "Top Performer" badge!',
      createdAt: "2023-09-29T08:45:00Z",
      read: false,
    },
    {
      id: "4",
      type: "leaderboard",
      message: "You are now ranked #3 on the leaderboard!",
      createdAt: "2023-09-28T12:00:00Z",
      read: true,
    },
  ];

  
  const markAllAsRead = () => {
    notifications.forEach(notification => {
      notification.read = true;
    });
    // Ideally, update the state or backend here if notifications are managed in state or fetched from an API.
  };

  const markAsRead = (id: string) => {
    const notification = notifications.find(notification => notification.id === id);
    if (notification) {
      notification.read = true;
    }
    // Ideally, update the state or backend here if notifications are managed in state or fetched from an API.
  };

  // Calculate unread notifications count
  const unreadCount = notifications.filter(notification => !notification.read).length;

  if (!notifications) {
    return <Loading message="Loading notifications..." />;
  }
  
  // Helper function to get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Calendar className="w-5 h-5 text-epic-blue" />;
      case 'levelUp':
        return <Trophy className="w-5 h-5 text-epic-yellow" />;
      case 'badge':
        return <Award className="w-5 h-5 text-epic-purple" />;
      case 'leaderboard':
        return <Trophy className="w-5 h-5 text-epic-green" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center pb-2">
        <CardTitle className="font-bold text-2xl">Notifications</CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <Check className="mr-1 w-3 h-3" />
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-10 text-muted-foreground">
            <BellOff className="opacity-50 mb-2 w-10 h-10" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.read ? "bg-background" : "bg-accent"
                } animate-fade-in`}
                onClick={() =>
                  !notification.read && markAsRead(notification.id)
                }
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`${
                        notification.read
                          ? "text-muted-foreground"
                          : "font-medium"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      {formatDistanceToNow(parseISO(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="bg-epic-blue rounded-full w-2 h-2"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationList;
