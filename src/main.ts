import { Authentication } from "@formant/data-sdk";
import { database, Task } from "./database";
import { getEvent, createEvent } from "./events"; 


document.addEventListener("DOMContentLoaded", async () => {
    try {
        await Authentication.waitTilAuthenticated();
        const userId = Authentication._currentUser.id;
        if (userId) {
            await displayAndRefreshTasks(userId);
        }
    } catch (error) {
        console.error("Authentication failed", error);
    }
});

function updateTaskStyle(label: HTMLElement, isCompleted: boolean): void {
    if (isCompleted) {
        label.classList.add('completed');
    } else {
        label.classList.remove('completed');
    }
}

document.addEventListener('modalClosed', async () => {
    const userId = Authentication._currentUser.id;
    if (userId) {
      await displayAndRefreshTasks(userId);
    }
  });
  
  async function displayAndRefreshTasks(userId: string): Promise<void> {
    const container = document.getElementById('tasksContainer');
    container.innerHTML = '';

    const tasks = await database.loadTasks(userId);
    const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in UTC

    // Fetch all events in parallel
    const eventsPromises = tasks.map(task => 
        task.lastCheckedId ? getEvent(Authentication._token, task.lastCheckedId) : Promise.resolve(null)
    );
    const events = await Promise.all(eventsPromises);

    tasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `task-${index}`;

        const label = document.createElement('label');
        label.htmlFor = `task-${index}`;
        label.textContent = task.description;

        taskItem.appendChild(checkbox);
        taskItem.appendChild(label);
        container.appendChild(taskItem);

        const event = events[index];
        if (event && event.message !== "NotFoundError") {
            if (event.tags && event.tags.date === currentDate) {
                checkbox.checked = true;
                checkbox.disabled = true;
                updateTaskStyle(label, true);
            }
        }

        checkbox.addEventListener('change', async () => {
            if (checkbox.checked) {
                try {
                    checkbox.disabled = true;
                    updateTaskStyle(label, true);
                    let uuid = await createEvent(Authentication._token, userId, task.description);
                    const newTask: Task = { ...task, lastCheckedId: uuid };
                    await database.updateTask(userId, index, newTask);
                    tasks[index] = newTask;
                    
                } catch (error) {
                    console.error("Error creating event for task:", error);
                    checkbox.checked = false;
                }
            }
        });
    });
}

