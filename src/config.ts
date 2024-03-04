// src/config.ts
import { database } from "./database";
import { Authentication } from "@formant/data-sdk";
import { database, Task } from "./database";


let tasks: Task[] = [];

const modal = document.getElementById("taskModal") as HTMLElement;
const btn = document.getElementById("taskConfigBtn") as HTMLElement;
const span = document.getElementsByClassName("close")[0] as HTMLElement;
const tasksList = document.getElementById("tasksList") as HTMLElement;

btn.onclick = async function() {
  modal.style.display = "block";
  const userId = Authentication._currentUser.id;
  if (userId) {
    tasks = await database.loadTasks(userId);
    updateTasksList();
  }
};

span.onclick = function() {
  modal.style.display = "none";
  // Dispatch a custom event
  document.dispatchEvent(new Event('modalClosed'));
};

window.onclick = function(event: MouseEvent) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function updateTasksList(): void {
  tasksList.innerHTML = '';
  tasks.forEach((task, index) => {
    const listItem = document.createElement('li');
  
    const textSpan = document.createElement('span');
    textSpan.textContent = task.description;
    listItem.appendChild(textSpan);
    
      
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.classList.add('icon-button'); 
      deleteButton.onclick = async () => {
        const userId = Authentication._currentUser.id;
        if (userId) {
          await database.deleteTask(userId, index);
          tasks.splice(index, 1); // Update local tasks array
          updateTasksList(); // Update UI
        }
      };
  
      const editButton = document.createElement('button');
      editButton.innerHTML = '<i class="fas fa-edit"></i>';
      editButton.classList.add('icon-button'); 
      editButton.onclick = async () => {
        const newDescription = prompt('Edit task description:', task.description);
        if (newDescription !== null) {
          const userId = Authentication._currentUser.id;
          if (userId) {
            const newTask: Task = { ...task, description: newDescription };
            await database.updateTask(userId, index, newTask);
            tasks[index] = newTask; // Update local tasks array
            updateTasksList(); // Update UI
          }
        }
      };
  
      listItem.appendChild(deleteButton);
      listItem.appendChild(editButton);
      tasksList.appendChild(listItem);
    });
  }

async function addTask(): Promise<void> {
    const taskInput = document.getElementById("taskInput") as HTMLInputElement;
    if (taskInput.value) {
      const newTask: Task = {
        description: taskInput.value,
        startDate: new Date(),
        completionStatus: [false] // Initialize with false, meaning not completed
      };
      tasks.push(newTask);
      updateTasksList();
      taskInput.value = '';
  
      const userId = Authentication._currentUser.id;
      if (userId) {
        await database.saveTasks(userId, tasks);
      }
    }
  }
  

document.getElementById("addTaskBtn")?.addEventListener("click", addTask);

