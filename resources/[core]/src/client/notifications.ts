import type { NotificationType } from "@framework/types";
import { uuid } from "@framework/utils";

interface QueuedNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration: number;
}

export class NotificationManager {
  private queue: QueuedNotification[] = [];
  private showing: boolean = false;

  /**
   * Show a notification
   */
  show(type: NotificationType, title: string, message: string, duration: number = 5000): void {
    const notification: QueuedNotification = {
      id: uuid(),
      type,
      title,
      message,
      duration,
    };

    SendNUIMessage({
      action: "showNotification",
      data: notification,
    });
  }

  /**
   * Show success notification
   */
  success(title: string, message: string, duration?: number): void {
    this.show("success", title, message, duration);
  }

  /**
   * Show error notification
   */
  error(title: string, message: string, duration?: number): void {
    this.show("error", title, message, duration);
  }

  /**
   * Show warning notification
   */
  warning(title: string, message: string, duration?: number): void {
    this.show("warning", title, message, duration);
  }

  /**
   * Show info notification
   */
  info(title: string, message: string, duration?: number): void {
    this.show("info", title, message, duration);
  }
}

// Export singleton for use by other client modules
export const notifications = new NotificationManager();
