// Kho chứa thực hiện các chức năng lưu trữ dữ liệu
import { User, Task, DailyTask, Badge } from '@/types';

const STORAGE_KEYS = {
    USER: 'epicTasks_user',
    TASKS: 'epicTasks_tasks',
    BADGES: 'epicTasks_badges',
    NOTIFICATIONS: 'epicTasks_notifications',
    USERS: 'epicTasks_users', // Cho phần xếp hạng
    DAILY_TASKS: 'epicTasks_daily_tasks',
}

// Các hàm lưu trữ và lấy dữ liệu của người dùng
// Lưu người dùng 
export const saveUser = (user: User): void => {
  const displayName = user.first_name || user.username || "User"; // Ưu tiên first_name
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify({ ...user, displayName }));
};

// Lấy người dùng 
export const getUser = (): User | null => {
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
}

// Xóa người dùng 
export const clearUser = (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER);
}

// Lưu nhiêm vụ 
export const saveTasks = (task: Task[]):void => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(task));
}

// Lấy nhiệm vụ
export const getTasks = (): Task[] => {
    const taskJson = localStorage.getItem(STORAGE_KEYS.TASKS);
    return taskJson ? JSON.parse(taskJson) : [];
}

// Thêm mới nhiệm vụ
export const addTask = (task: Task): void => {
    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks)
}

// Cập nhật nhiệm vụ
export const updateTask = (updateTask: Task): void => {
    const tasks = getTasks();
    const index = tasks.findIndex(task => task._id === updateTask._id);
    if (index !== 1){
        tasks[index] = updateTask;
        saveTasks(tasks)
    }
}

// Xóa nhiệm vụ
export const deleteTask = (taskId: string): void => {
  const tasks = getTasks();
  const filteredTasks = tasks.filter((task) => task._id !== taskId);
  saveTasks(filteredTasks);
};

// Các chức năng của nhiệm vụ hằng ngày
// Lưu 
export const saveDailyTasks = (tasks: DailyTask[]): void => {
  localStorage.setItem(STORAGE_KEYS.DAILY_TASKS, JSON.stringify(tasks));
};

// Lấy
export const getDailyTasks = (): DailyTask[] => {
  const tasksJson = localStorage.getItem(STORAGE_KEYS.DAILY_TASKS);
  return tasksJson ? JSON.parse(tasksJson) : [];
};

// Các chắc năng của huy hiệu
// Lưu
export const saveBadges = (badges: Badge[]): void => {
  localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
};

// Lấy
export const getBadges = (): Badge[] => {
  const badgesJson = localStorage.getItem(STORAGE_KEYS.BADGES);
  return badgesJson ? JSON.parse(badgesJson) : [];
};

// Mở khóa
export const unlockBadge = (badgeId: string): Badge | null => {
  const badges = getBadges();
  const badgeIndex = badges.findIndex((badge) => badge._id === badgeId);

  if (badgeIndex !== -1 && !badges[badgeIndex].unlockedAt) {
    badges[badgeIndex].unlockedAt = new Date().toISOString();
    saveBadges(badges);
    return badges[badgeIndex];
  }

  return null;
};

// // Chắc năng của thông báo
// export const saveNotifications = (notifications: Notification[]): void => {
//   localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
// };

// export const getNotifications = (): Notification[] => {
//   const notificationsJson = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
//   return notificationsJson ? JSON.parse(notificationsJson) : [];
// };

// export const addNotification = (notification: Notification): void => {
//   const notifications = getNotifications();
//   notifications.unshift(notification); // thêm thông báo vào đầu
//   saveNotifications(notifications);
// };

// // Đánh dãu thông báo
// export const markNotificationAsRead = (notificationId: string): void => {
//   const notifications = getNotifications();
//   const index = notifications.findIndex(notification => notification.id === notificationId);
//   if (index !== -1) {
//     notifications[index].read = true;
//     saveNotifications(notifications);
//   }
// };


// Các chắc năng của bảng xếp hạng
export const getUsers = (): User[] =>{
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
}

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};


