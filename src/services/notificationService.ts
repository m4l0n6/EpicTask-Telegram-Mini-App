import { toast } from "@/hooks/use-toast";
import { Badge } from "@/types";
import { addNotification } from "@/utils/storage";
import { v4 as uuidv4 } from "uuid";

/**
 * Service to handle notifications in the application without using sockets
 */
class NotificationService {
  /**
   * Show a toast notification and optionally save to local storage
   */
  showNotification(
    title: string,
    description: string,
    variant: "default" | "destructive" = "default",
    saveToStorage: boolean = false,
    type: string = "general"
  ): void {
    // Show toast
    toast({
      title,
      description,
      variant,
    });

    // Save to storage if needed
    if (saveToStorage) {
      addNotification({
        id: uuidv4(),
        type,
        message: description,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  /**
   * Notify when a user unlocks a new badge
   */
  notifyNewBadge(badge: Badge): void {
    const badgeData = JSON.stringify({ badge });
    
    // Show toast notification
    toast({
      title: "Badge Unlocked! 🎉",
      description: `You've earned the "${badge.title}" badge!`,
    });

    // Save to storage with badge data
    addNotification({
      id: uuidv4(),
      type: "new_badge",
      message: `You've earned the "${badge.title}" badge! ${badgeData}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    
    // Dispatch event for other components
    document.dispatchEvent(
      new CustomEvent("badgeUnlocked", {
        detail: { badge },
      })
    );
  }

  /**
   * Notify when a user levels up
   */
  notifyLevelUp(oldLevel: number, newLevel: number): void {
    const levelData = JSON.stringify({ level: newLevel, oldLevel });
    
    // Show toast notification
    toast({
      title: "Level Up! 🎉",
      description: `You've reached level ${newLevel}!`,
    });

    // Save to storage with level data
    addNotification({
      id: uuidv4(),
      type: "level_up",
      message: `You've reached level ${newLevel}! ${levelData}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Notify when tokens are added to a user
   */
  notifyTokensAdded(amount: number): void {
    const tokenData = JSON.stringify({ tokens: amount });
    
    // Show toast notification
    toast({
      title: "Tokens Received",
      description: `You've earned ${amount} tokens!`,
    });

    // Save to storage with token data
    addNotification({
      id: uuidv4(),
      type: "token",
      message: `You've earned ${amount} tokens! ${tokenData}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
    
    // Dispatch event for other components
    document.dispatchEvent(
      new CustomEvent("tokensAdded", {
        detail: { amount },
      })
    );
  }

  /**
   * Notify when a task is completed
   */
  notifyTaskCompleted(
    xpGained: number,
    tokenGained: number,
    leveledUp: boolean
  ): void {
    const taskData = JSON.stringify({ 
      xp: xpGained, 
      tokens: tokenGained, 
      leveledUp 
    });
    
    // Show toast notification
    toast({
      title: "Task Completed!",
      description: `You earned ${xpGained} XP and ${tokenGained} tokens${
        leveledUp ? " and leveled up!" : "!"
      }`,
    });

    // Save to storage with task data
    addNotification({
      id: uuidv4(),
      type: "task_completed",
      message: `You earned ${xpGained} XP and ${tokenGained} tokens${
        leveledUp ? " and leveled up!" : "!"
      } ${taskData}`,
      read: false,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Notify when an error occurs
   */
  notifyError(message: string): void {
    this.showNotification("Error", message, "destructive");
  }
}

export const notificationService = new NotificationService();
