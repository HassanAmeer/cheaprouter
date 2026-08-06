import { v4 as uuidv4 } from 'uuid';

export type Notification = {
  id: string;
  title: string;
  message: string;
  targetUserId: string; // 'ALL' or specific user ID
  date: string;
  read: boolean;
};

// In-memory store
let notifications: Notification[] = [
  {
    id: 'notif_demo1',
    title: 'Welcome to CheapAgents!',
    message: 'We are glad to have you on board. Check out our new models.',
    targetUserId: 'ALL',
    date: new Date().toISOString(),
    read: false,
  }
];

export const notificationsDb = {
  getAll: () => notifications,
  
  getByUser: (userId: string) => {
    return notifications.filter(n => n.targetUserId === 'ALL' || n.targetUserId === userId);
  },

  create: (title: string, message: string, targetUserId: string = 'ALL') => {
    const newNotif: Notification = {
      id: `notif_${uuidv4()}`,
      title,
      message,
      targetUserId,
      date: new Date().toISOString(),
      read: false
    };
    notifications.unshift(newNotif);
    return newNotif;
  },

  markAsRead: (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
    }
  },
  
  markAllAsRead: (userId: string) => {
    notifications.forEach(n => {
      if (n.targetUserId === 'ALL' || n.targetUserId === userId) {
        n.read = true;
      }
    });
  }
};
