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
        while (task.completionStatus.length < daysSinceStart + 1) {
            task.completionStatus.push(false);
        }
        return {
            ...task,
            isCompletedToday: task.completionStatus[daysSinceStart]
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
            if (!checkbox.checked) {
                // If the checkbox is not checked, update the task
                task.completionStatus[task.completionStatus.length - 1] = checkbox.checked;
                await database.saveTasks(userId, tasks.map(t => ({ description: t.description, startDate: t.startDate, completionStatus: t.completionStatus })));
                updateTaskStyle(label, checkbox.checked);
            } else {
                // If the checkbox is checked, apply strikethrough and then disable it
                updateTaskStyle(label, checkbox.checked); // Apply strikethrough before disabling
                checkbox.disabled = true; // Now disable the checkbox
            }
        });
        const label = document.createElement('label');
        label.htmlFor = `task-${index}`;
        label.textContent = task.description;
        console.log(task.isCompletedToday);
        updateTaskStyle(label, task.isCompletedToday);

        taskItem.appendChild(checkbox);
        taskItem.appendChild(label);
        container.appendChild(taskItem);
    });
}

function updateTaskStyle(label: HTMLElement, isCompleted: boolean): void {
    if (isCompleted) {
        label.classList.add('completed');
    } else {
        label.classList.remove('completed');
    }
}
// Function to handle refreshing tasks
async function refreshTasks(userId: string): Promise<void> {
    try {
        let tasks = await database.loadTasks(userId);
        tasks = updateCompletionStatus(tasks);
        displayTasks(tasks, userId);
    } catch (error) {
        console.error("Error refreshing tasks:", error);
    }
}

// Event listener for the refresh button
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
        const userId = Authentication._currentUser.id;
        if (userId) {
            await refreshTasks(userId);
        }
    });
}
