import { Authentication } from "@formant/data-sdk";
import { database, Task } from "./database";

type TaskWithStatus = Task & { isCompletedToday: boolean };

document.addEventListener("DOMContentLoaded", async () => {
    try {
        await Authentication.waitTilAuthenticated();
        const userId = Authentication._currentUser.id;
        if (userId) {
            let tasks = await database.loadTasks(userId);
            tasks = updateCompletionStatus(tasks);
            displayTasks(tasks, userId);
        }
    } catch (error) {
        console.error("Authentication failed", error);
    }
});

function updateCompletionStatus(tasks: Task[]): TaskWithStatus[] {
    const today = new Date();
    return tasks.map(task => {
        const daysSinceStart = Math.ceil((today.getTime() - new Date(task.startDate).getTime()) / (1000 * 3600 * 24));
        // Fill in the missing days with 'false' for not completed
        while (task.completionStatus.length < daysSinceStart) {
            task.completionStatus.push(false);
        }
        return {
            ...task,
            isCompletedToday: task.completionStatus[daysSinceStart - 1]
        };
    });
}

function displayTasks(tasks: TaskWithStatus[], userId: string): void {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';

    tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `task-${index}`;
        checkbox.checked = task.isCompletedToday;

        checkbox.addEventListener('change', async () => {
            if (checkbox.checked) {
                task.completionStatus[task.completionStatus.length - 1] = true;
                await database.saveTasks(userId, tasks.map(t => ({ description: t.description, startDate: t.startDate, completionStatus: t.completionStatus })));
            }
            const label = document.querySelector(`label[for="task-${index}"]`);
            if (checkbox.checked) {
              label.classList.add('completed');
            } else {
              label.classList.remove('completed');
            }
        });

        const label = document.createElement('label');
        label.htmlFor = `task-${index}`;
        label.textContent = task.description;

        if (!task.isCompletedToday) {
            taskItem.appendChild(checkbox);
            taskItem.appendChild(label);
            container.appendChild(taskItem);
        }
    });
}