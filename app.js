// Select DOM elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const filterMenu = document.getElementById('filterMenu');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const completedCount = document.getElementById('completedCount');

// Load tasks from localStorage on startup
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Load filter preference from localStorage
let currentFilter = localStorage.getItem('taskFilter') || 'all';
filterMenu.value = currentFilter;

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === '') {
        taskInput.focus();
        taskInput.style.borderColor = '#ff4757';
        setTimeout(() => taskInput.style.borderColor = '#e0e0e0', 2000);
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    // Clear input
    taskInput.value = '';
}

// Toggle task completion
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// Render all tasks
function renderTasks() {
    const filteredTasks = filterTasks();
    taskList.innerHTML = '';

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) {
            li.classList.add('completed');
        }

        li.innerHTML = `
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})">
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="task-delete" onclick="deleteTask(${task.id})">Delete</button>
        `;

        taskList.appendChild(li);
    });

    // Update stats with filter-specific counts
    const activeTasks = tasks.filter(t => !t.completed).length;
    const completedTasks = tasks.filter(t => t.completed).length;

    let filterLabel = currentFilter === 'all' ? 'all' : currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1);
    taskCount.textContent = `${activeTasks} active tasks`;
    completedCount.textContent = `${completedTasks} completed`;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Filter tasks based on current selection
function filterTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        return tasks.filter(t => t.completed);
    }
    return tasks; // 'all' filter
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterMenu.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    localStorage.setItem('taskFilter', currentFilter);
    renderTasks();
});

// Initial render
filterMenu.addEventListener('change', renderTasks);
renderTasks();
