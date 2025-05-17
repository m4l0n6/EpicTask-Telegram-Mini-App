import { toast } from "@/hooks/use-toast";
import { Badge, User } from "@/types";
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
    this.showNotification(
      "Badge Unlocked! 🎉",
      `You've earned the "${badge.title}" badge!`,
      "default",
      true,
      "badge"
    );
    
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
    this.showNotification(
      "Level Up! 🎉",
      `You've reached level ${newLevel}!`,
      "default",
      true,
      "levelUp"
    );
  }

  /**
   * Notify when tokens are added to a user
   */
  notifyTokensAdded(amount: number): void {
    this.showNotification(
      "Tokens Received",
      `You've earned ${amount} tokens!`,
      "default",
      true,
      "token"
    );
    
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
    this.showNotification(
      "Task Completed!",
      `You earned ${xpGained} XP and ${tokenGained} tokens${
        leveledUp ? " and leveled up!" : "!"
      }`,
      "default",
      true,
      "taskCompleted"
    );
  }

  /**
   * Notify when an error occurs
   */
  notifyError(message: string): void {
    this.showNotification("Error", message, "destructive");
  }
}

export const notificationService = new NotificationService();
