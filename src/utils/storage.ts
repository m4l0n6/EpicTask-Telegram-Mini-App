// Kho chứa thực hiện các chức năng lưu trữ dữ liệu
import { User, Task, Badge } from '@/types';

const STORAGE_KEYS = {
    USER: 'epicTasks_user',
    TASKS: 'epicTasks_tasks',
    BADGES: 'epicTasks_badges',
    NOTIFICATIONS: 'epicTasks_notifications',
    USERS: 'epicTasks_users', // Cho phần xếp hạng
    AUTH_TOKEN: 'epicTasks_auth_token' // Thêm key này
}

// Các hàm lưu trữ và lấy dữ liệu của người dùng
// Lưu người dùng 
export const saveUser = (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)); 

    //Cập nhật người dùng này vào danh sách người dùng cho bảng xếp hạng
    const users = getUsers();
    const existingUserIndex = users.findIndex(u => u._id === user._id); // Tìm chỉ số của người dùng hiện tại trong danh sách người dùng
    if (existingUserIndex >= 0) {
        users[existingUserIndex] = user; // Cập nhật thông tin người dùng
    }
    else {
        users.push(user); // Thêm người dùng mới vào danh sách
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); // Lưu danh sách người dùng vào localStorage
}

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


// Các chắc năng của bảng xếp hạng
export const getUsers = (): User[] =>{
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
}

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Thêm các hàm này
export const saveAuthToken = (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
}

export const getAuthToken = (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

export const clearAuthToken = (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}


