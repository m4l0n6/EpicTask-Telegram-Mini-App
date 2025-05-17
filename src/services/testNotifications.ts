// Đây là một file test đơn giản để kiểm tra hệ thống thông báo
import { notificationService } from './notificationService';

export const testNotifications = () => {
  console.log('Testing notification system...');
  
  // Test task completed notification
  notificationService.notifyTaskCompleted(50, 10, false);
  
  // Delay để không hiển thị cùng lúc
  setTimeout(() => {
    // Test badge notification
    notificationService.notifyNewBadge({
      _id: 'test-badge-1',
      title: 'Test Badge',
      description: 'This is a test badge',
      icon: '🏆',
      unlockedAt: new Date().toISOString()
    });
  }, 2000);
  
  // Delay to test level up notification
  setTimeout(() => {
    // Test level up notification
    notificationService.notifyLevelUp(1, 2);
  }, 4000);
  
  // Delay to test token notification
  setTimeout(() => {
    // Test tokens notification
    notificationService.notifyTokensAdded(25);
  }, 6000);
  
  // Delay to test error notification
  setTimeout(() => {
    // Test error notification
    notificationService.notifyError('This is a test error message');
  }, 8000);
  
  console.log('All test notifications queued!');
};
