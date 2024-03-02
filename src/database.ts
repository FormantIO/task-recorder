import { KeyValue } from "@formant/data-sdk";

export type Task = {
  description: string;
  startDate: Date;
  completionStatus: boolean[];
};


export const database = {
  async saveTasks(userId: string, tasks: Task[]): Promise<void> {
    await KeyValue.set(userId, JSON.stringify(tasks));
  },
  
  async loadTasks(userId: string): Promise<Task[]> {
    const tasksJson = await KeyValue.get(userId);
    return tasksJson ? JSON.parse(tasksJson) : [];
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
