import { Authentication } from "@formant/data-sdk";
import { database, Task } from "./database";

let tasks: Task[] = [];

const modal = document.getElementById("taskModal") as HTMLElement;
const btn = document.getElementById("taskConfigBtn") as HTMLElement;
const addTasks = document.getElementById("noTasksMessage") as HTMLElement;
const tasksList = document.getElementById("tasksList") as HTMLElement;
const doneBtn = document.getElementById("doneBtn") as HTMLElement;

let userId: any = null;
btn.onclick = async function() {
  openConfig();
};

addTasks.onclick = async function (){
  openConfig();
}

async function openConfig(){
  modal.style.display = "block";
  userId =  (Authentication as any)._currentUser.id;
  if (userId) {
    tasks = await database.loadTasks(userId);
    updateTasksList();
  }
}

doneBtn.onclick = function() {
  modal.style.display = "none";
  // Dispatch a custom event if necessary
  document.dispatchEvent(new Event('modalClosed'));
};


window.onclick = function(event) {
  var modalBackground = document.getElementById('taskModal');
  var taskError = document.getElementById("taskError") as HTMLSpanElement;
  if (event.target === modalBackground) {
    
    modal.style.display = "none";
    taskError.style.display = "none";
    document.dispatchEvent(new Event('modalClosed'));
  }
};

function updateTasksList(): void {
  tasksList.innerHTML = '';
  tasks.forEach((task, index) => {
    const listItem = document.createElement('li');
  
    const textSpan = document.createElement('span');
    textSpan.classList.add("taskSpan");
    textSpan.textContent = task.description;
    listItem.appendChild(textSpan);
    
    const deleteButton = createDeleteButton(index);
    const editButton = createEditButton(task, index, textSpan, listItem);
    
    const taskBtnContainer = document.createElement('div');
    taskBtnContainer.classList.add("taskBtnContainer");
    taskBtnContainer.appendChild(deleteButton);
    taskBtnContainer.appendChild(editButton);
    listItem.appendChild(taskBtnContainer);

    tasksList.appendChild(listItem);
  });
}
function createDeleteButton(index: number) {
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<img src="/task-recorder/icons/delete.svg" alt="Delete">';
  deleteButton.classList.add('icon-button'); 
  deleteButton.onclick = async () => {
    if (userId) {
      await database.deleteTask(userId, index);
      tasks.splice(index, 1); // Update local tasks array
      updateTasksList(); // Update UI
    }
  };
  return deleteButton;
}



function createEditButton(task: Task, index: number, textSpan: HTMLSpanElement, listItem: HTMLLIElement) {
  const editButton = document.createElement('button');
  editButton.innerHTML = '<img src="/task-recorder/icons/edit.svg" alt="Edit">';
  editButton.classList.add('icon-button');
  editButton.onclick = () => {
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = task.description;
    inputField.classList.add('task-edit-input');
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.classList.add('icon-button');

    saveButton.onclick = async () => {
      const updatedDescription = inputField.value.trim();
      if (updatedDescription) {
        const newTask: Task = { ...task, description: updatedDescription };
        await database.updateTask(userId, index, newTask);
        tasks[index] = newTask; // Update local tasks array
        updateTasksList(); // Update UI
      }
    };

    listItem.replaceChild(inputField, textSpan);
    listItem.appendChild(saveButton);
    inputField.focus();
    editButton.style.display = 'none';
  };
  return editButton;
}


async function addTask() {
  const taskInput = document.getElementById("taskInput") as HTMLInputElement;
  const taskError = document.getElementById("taskError") as HTMLSpanElement;
  const newTaskDescription = taskInput.value.trim();
  
  if (newTaskDescription) {
      if (userId) {
          const existingTasks = await database.loadTasks(userId);
          
          // Check if a task with the same description already exists
          const isDuplicate = existingTasks.some(task => task.description.toLowerCase() === newTaskDescription.toLowerCase());

          if (!isDuplicate) {
              const newTask: Task = {
                  description: newTaskDescription,
                  startDate: new Date(),
                  lastCheckedId: null
              };
              tasks.push(newTask);
              await database.saveTasks(userId, tasks);
              updateTasksList();
              taskInput.value = ''; // Clear the input field
              taskError.style.display = 'none'; // Hide error message
          } else {
              taskError.textContent = 'A task with this description already exists.';
              taskError.style.display = 'block'; // Show error message
          }
      }
  } else {
      taskError.textContent = 'Please enter a task description.';
      taskError.style.display = 'block'; // Show error message
  }
}


document.getElementById("taskInput")?.addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
    addTask();
  }
});

document.getElementById("addTaskBtn")?.addEventListener("click", addTask);