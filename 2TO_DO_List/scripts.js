// DOM Selectors
const toDoInput = document.querySelector(".todo-input");
const dateInput = document.querySelector(".todo-date");
const prioritySelect = document.querySelector(".priority-select");
const toDoBtn = document.querySelector(".todo-btn");
const toDoList = document.querySelector(".todo-list");
const completedList = document.querySelector(".completed-list");
const notCompletedList = document.querySelector("#not-completed-list");
const toggleCompletedBtn = document.getElementById("toggle-completed");
const themeSelect = document.getElementById("theme-select");
const statsBtn = document.getElementById("stats-btn");
const statsModal = document.getElementById("stats-modal");
const closeModal = document.querySelector(".close-modal");
const timeFilters = document.querySelectorAll(".time-filter");

// Initialize theme
let savedTheme = localStorage.getItem("savedTheme") || "standard";
changeTheme(savedTheme);
themeSelect.value = savedTheme;

// Event Listeners
document.getElementById("task-form").addEventListener("submit", addToDo);
toDoList.addEventListener("click", handleTaskAction);
completedList.addEventListener("click", handleTaskAction);
notCompletedList.addEventListener("click", handleTaskAction);
toggleCompletedBtn.addEventListener("click", toggleCompletedTasks);
document.addEventListener("DOMContentLoaded", getTodos);
themeSelect.addEventListener("change", () => changeTheme(themeSelect.value));
statsBtn.addEventListener("click", openStatsModal);
closeModal.addEventListener("click", closeStatsModal);
window.addEventListener("click", (e) => {
  if (e.target === statsModal) closeStatsModal();
});

timeFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    timeFilters.forEach((f) => f.classList.remove("active"));
    filter.classList.add("active");
    filterTasks(filter.dataset.filter);
  });
});

// Functions
function changeTheme(theme) {
  document.body.className = theme;
  document.getElementById("title").className = `${theme}-title`;

  // Update form elements
  toDoInput.className = `todo-input ${theme}-input`;
  toDoBtn.className = `todo-btn ${theme}-button`;
  prioritySelect.className = `priority-select ${theme}-input`;
  dateInput.className = `todo-date ${theme}-input`;

  // Update buttons
  toggleCompletedBtn.className = `standard-button ${theme}-button`;
  timeFilters.forEach((btn) => {
    btn.className = `time-filter ${
      btn.classList.contains("active") ? "active" : ""
    }`;
  });

  localStorage.setItem("savedTheme", theme);
}

function addToDo(e) {
  e.preventDefault();
  const text = toDoInput.value.trim();
  const dueDate = dateInput.value;
  const priority = prioritySelect.value;

  if (!text) return showAlert("Please enter a task!");
  if (!dueDate) return showAlert("Please select a due date!");

  const task = {
    id: Date.now().toString(),
    text,
    dueDate,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  addTaskToDOM(task);
  saveLocal(task);
  logActivity(`Added task: "${text}"`, "added");
  toDoInput.value = "";
  dateInput.value = "";
  prioritySelect.value = "normal";
  toDoInput.focus();
  updateTaskCounts();
  filterTasks(document.querySelector(".time-filter.active").dataset.filter);
}

function addTaskToDOM(task) {
  const todoItem = document.createElement("li");
  todoItem.className = `todo-item ${
    task.priority !== "normal" ? `priority-${task.priority}` : ""
  }`;
  todoItem.dataset.id = task.id;
  todoItem.dataset.dueDate = task.dueDate;
  todoItem.dataset.priority = task.priority;

  const now = new Date();
  const taskDate = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (task.completed) {
    todoItem.classList.add("completed");
  } else if (taskDate < today) {
    todoItem.classList.add("overdue");
  }

  todoItem.innerHTML = `
    <div class="todo-content">
      <div class="todo-text">${task.text}</div>
      <div class="todo-actions">
        <button class="todo-btn check-btn">
          <i class="fas fa-check"></i>
        </button>
        <button class="todo-btn delete-btn">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="todo-details">
      <div class="todo-date">
        <i class="far fa-calendar-alt"></i>
        ${formatDate(task.dueDate)}
      </div>
      ${
        task.priority !== "normal"
          ? `
        <div class="todo-priority priority-${task.priority}">
          ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </div>
      `
          : ""
      }
    </div>
  `;

  if (task.completed) {
    completedList.appendChild(todoItem);
  } else if (taskDate < now) {
    notCompletedList.appendChild(todoItem);
  } else {
    toDoList.appendChild(todoItem);
  }

  animateTask(todoItem);
  updateTaskCounts();
}

function handleTaskAction(e) {
  const item = e.target.closest("button");
  if (!item) return;

  const taskItem = item.closest(".todo-item");
  const taskId = taskItem.dataset.id;
  const todos = JSON.parse(localStorage.getItem("todos") || "[]");
  const taskIndex = todos.findIndex((todo) => todo.id === taskId);

  if (taskIndex === -1) return;

  const task = todos[taskIndex];

  if (item.classList.contains("delete-btn")) {
    animateDelete(taskItem, () => {
      taskItem.remove();
      removeLocal(taskId);
      logActivity(`Deleted task: "${task.text}"`, "deleted");
      updateTaskCounts();
    });
  } else if (item.classList.contains("check-btn")) {
    const isCompleted = !task.completed;
    const updatedTask = { ...task, completed: isCompleted };

    // Update in storage first
    removeLocal(taskId);
    saveLocal(updatedTask);

    // Then update DOM
    taskItem.remove();
    addTaskToDOM(updatedTask);
    logActivity(
      `${isCompleted ? "Completed" : "Marked incomplete"} task: "${task.text}"`,
      isCompleted ? "completed" : "added"
    );
    updateTaskCounts();
  }
}

function toggleCompletedTasks() {
  completedList.classList.toggle("hidden");
  toggleCompletedBtn.innerHTML = completedList.classList.contains("hidden")
    ? '<i class="fas fa-eye"></i> Show Completed'
    : '<i class="fas fa-eye-slash"></i> Hide Completed';
}

function filterTasks(filter) {
  const allTasks = [...document.querySelectorAll(".todo-item")];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (6 - today.getDay()));

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  allTasks.forEach((task) => {
    const dueDate = new Date(task.dataset.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    let showTask = false;

    switch (filter) {
      case "all":
        showTask = true;
        break;
      case "today":
        showTask = dueDate.getTime() === today.getTime();
        break;
      case "tomorrow":
        showTask = dueDate.getTime() === tomorrow.getTime();
        break;
      case "week":
        showTask = dueDate >= today && dueDate <= endOfWeek;
        break;
      case "month":
        showTask = dueDate >= today && dueDate <= endOfMonth;
        break;
      case "future":
        showTask = dueDate > endOfMonth;
        break;
    }

    task.style.display = showTask ? "block" : "none";
  });

  updateTaskCounts();
}

function updateTaskCounts() {
  const filter = document.querySelector(".time-filter.active").dataset.filter;
  const allTasks = [...document.querySelectorAll(".todo-item")];

  const assignedCount = allTasks.filter(
    (task) => task.parentElement === toDoList && task.style.display !== "none"
  ).length;

  const completedCount = allTasks.filter(
    (task) =>
      task.parentElement === completedList && task.style.display !== "none"
  ).length;

  const overdueCount = allTasks.filter(
    (task) =>
      task.parentElement === notCompletedList && task.style.display !== "none"
  ).length;

  document.querySelector("#assigned-tasks .task-count").textContent =
    assignedCount;
  document.querySelector("#completed-tasks .task-count").textContent =
    completedCount;
  document.querySelector("#not-completed-tasks .task-count").textContent =
    overdueCount;
}

function saveLocal(task) {
  let todos = JSON.parse(localStorage.getItem("todos") || []);
  todos.push(task);
  localStorage.setItem("todos", JSON.stringify(todos));
}

function removeLocal(taskId) {
  let todos = JSON.parse(localStorage.getItem("todos") || []);
  todos = todos.filter((todo) => todo.id !== taskId);
  localStorage.setItem("todos", JSON.stringify(todos));
}

function getTodos() {
  let todos = JSON.parse(localStorage.getItem("todos") || []);

  // Sort tasks by due date (ascending)
  todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  todos.forEach((task) => addTaskToDOM(task));
  updateTaskCounts();
  filterTasks("all");
}

function openStatsModal() {
  statsModal.style.display = "flex";
  updateStats();
}

function closeStatsModal() {
  statsModal.style.display = "none";
}

function updateStats() {
  const todos = JSON.parse(localStorage.getItem("todos") || []);
  const completed = todos.filter((todo) => todo.completed).length;
  const overdue = todos.filter((todo) => {
    const dueDate = new Date(todo.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !todo.completed && dueDate < today;
  }).length;

  document.getElementById("total-tasks").textContent = todos.length;
  document.getElementById("completed-tasks-count").textContent = completed;
  document.getElementById("overdue-tasks").textContent = overdue;
  document.getElementById("completion-rate").textContent =
    todos.length > 0
      ? `${Math.round((completed / todos.length) * 100)}%`
      : "0%";

  renderChart();
  renderActivityLog();
}

function renderChart() {
  const ctx = document.getElementById("productivity-chart").getContext("2d");

  // Destroy previous chart if it exists
  if (window.productivityChart) {
    window.productivityChart.destroy();
  }

  const todos = JSON.parse(localStorage.getItem("todos") || []);
  const activities = JSON.parse(localStorage.getItem("activities") || []);

  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const completedData = last7Days.map((day) => {
    return activities.filter(
      (act) =>
        act.type === "completed" &&
        new Date(act.timestamp).toISOString().split("T")[0] === day
    ).length;
  });

  const createdData = last7Days.map((day) => {
    return todos.filter(
      (todo) => new Date(todo.createdAt).toISOString().split("T")[0] === day
    ).length;
  });

  window.productivityChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: last7Days.map((day) => formatDate(day)),
      datasets: [
        {
          label: "Tasks Completed",
          data: completedData,
          backgroundColor: "rgba(40, 167, 69, 0.7)",
          borderColor: "rgba(40, 167, 69, 1)",
          borderWidth: 1,
        },
        {
          label: "Tasks Created",
          data: createdData,
          backgroundColor: "rgba(74, 111, 165, 0.7)",
          borderColor: "rgba(74, 111, 165, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}

function renderActivityLog() {
  const activityList = document.getElementById("activity-list");
  activityList.innerHTML = "";

  const activities = JSON.parse(localStorage.getItem("activities") || []);
  const recentActivities = activities.slice(-10).reverse();

  recentActivities.forEach((activity) => {
    const activityItem = document.createElement("li");
    activityItem.className = "activity-item";

    const iconClass =
      activity.type === "added"
        ? "fa-plus-circle"
        : activity.type === "completed"
        ? "fa-check-circle"
        : "fa-trash-alt";

    const iconBg =
      activity.type === "added"
        ? "added"
        : activity.type === "completed"
        ? "completed"
        : "deleted";

    activityItem.innerHTML = `
      <div class="activity-icon ${iconBg}">
        <i class="fas ${iconClass}"></i>
      </div>
      <div class="activity-text">${activity.text}</div>
      <div class="activity-time">${formatTime(activity.timestamp)}</div>
    `;

    activityList.appendChild(activityItem);
  });
}

function logActivity(text, type) {
  const activities = JSON.parse(localStorage.getItem("activities") || []);
  activities.push({
    text,
    type,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem("activities", JSON.stringify(activities));
}

// Utility Functions
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timestamp) {
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  if (diffInMinutes < 1440)
    return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
}

function showAlert(message) {
  const alert = document.createElement("div");
  alert.className = "alert";
  alert.textContent = message;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

function animateTask(taskElement) {
  taskElement.style.opacity = "0";
  taskElement.style.transform = "translateY(20px)";

  setTimeout(() => {
    taskElement.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    taskElement.style.opacity = "1";
    taskElement.style.transform = "translateY(0)";
  }, 10);
}

function animateDelete(element, callback) {
  element.style.transition = "all 0.3s ease";
  element.style.transform = "translateX(100%)";
  element.style.opacity = "0";

  setTimeout(() => {
    callback();
  }, 300);
}

// Initialize
getTodos();
