import { KeyValue, Uuid } from "@formant/data-sdk";

export type Task = {
  description: string;
  startDate: Date;
  lastCheckedId: Uuid | null;
};

const KEY_PREFIX = "task-recorder-";

// Helper function to prepend the key prefix to the user ID
function getPrefixedUserId(userId: any) {
  return KEY_PREFIX + userId;
}

export const database = {
  async saveTasks(userId: string, tasks: Task[]): Promise<void> {
    const prefixedUserId = getPrefixedUserId(userId);
    await KeyValue.set(prefixedUserId, JSON.stringify(tasks));
  },
  
  async loadTasks(userId: string): Promise<Task[]> {
    const prefixedUserId = getPrefixedUserId(userId);
    try {
      const tasksJson = await KeyValue.get(prefixedUserId);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      return [];
    }
  },
  

  async deleteTask(userId: string, taskIndex: number): Promise<void> {
    const tasks = await this.loadTasks(userId);
    tasks.splice(taskIndex, 1);
    await this.saveTasks(userId, tasks);
  },

  async updateTask(userId: string, taskIndex: number, newTask: Task): Promise<void> {
    const tasks = await this.loadTasks(userId);
    tasks[taskIndex] = newTask;
    await this.saveTasks(userId, tasks);
  }
};