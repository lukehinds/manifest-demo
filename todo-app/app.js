import {
  createTodo,
  filterTodos,
  sortTodos,
  getStats,
  isOverdue,
  isDueToday,
  Priority,
  Category,
} from './model.js';

// Constants
const STORAGE_KEY = 'focustask_todos_v1';
const THEME_KEY = 'focustask_theme';

// Default starter tasks for new users
const DEFAULT_TODOS = [
  {
    id: 'demo_1',
    text: 'Welcome to FocusTask! Click the checkbox to mark as complete',
    priority: Priority.MEDIUM,
    category: Category.PERSONAL,
    dueDate: new Date().toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_2',
    text: 'Explore priority badges, categories, and due dates',
    priority: Priority.HIGH,
    category: Category.WORK,
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_3',
    text: 'Switch between light and dark themes using the top-right button',
    priority: Priority.LOW,
    category: Category.OTHER,
    dueDate: null,
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

// App State
let todos = [];
let currentFilter = {
  status: 'all',
  search: '',
  category: 'all',
  priority: 'all',
  sortBy: 'createdAt_desc',
};

// DOM Elements
const todoListEl = document.getElementById('todoList');
const emptyStateEl = document.getElementById('emptyState');
const emptyStateTitleEl = document.getElementById('emptyStateTitle');
const emptyStateDescEl = document.getElementById('emptyStateDesc');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

const addTodoForm = document.getElementById('addTodoForm');
const todoInput = document.getElementById('todoInput');
const prioritySelect = document.getElementById('prioritySelect');
const categorySelect = document.getElementById('categorySelect');
const dueDateInput = document.getElementById('dueDateInput');

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const tabButtons = document.querySelectorAll('.tab-btn');
const filterCategoryEl = document.getElementById('filterCategory');
const filterPriorityEl = document.getElementById('filterPriority');
const sortByEl = document.getElementById('sortBy');

const statTotalEl = document.getElementById('statTotal');
const statCompletedEl = document.getElementById('statCompleted');
const statActiveEl = document.getElementById('statActive');
const statOverdueEl = document.getElementById('statOverdue');
const statsPercentEl = document.getElementById('statsPercent');
const progressBarFillEl = document.getElementById('progressBarFill');

const countAllEl = document.getElementById('countAll');
const countActiveEl = document.getElementById('countActive');
const countCompletedEl = document.getElementById('countCompleted');

const bulkSummaryText = document.getElementById('bulkSummaryText');
const toggleAllBtn = document.getElementById('toggleAllBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

const editModal = document.getElementById('editModal');
const editTodoForm = document.getElementById('editTodoForm');
const editTodoId = document.getElementById('editTodoId');
const editTodoText = document.getElementById('editTodoText');
const editPriority = document.getElementById('editPriority');
const editCategory = document.getElementById('editCategory');
const editDueDate = document.getElementById('editDueDate');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const toastContainer = document.getElementById('toastContainer');
const currentDateDisplay = document.getElementById('currentDateDisplay');

// Init
function init() {
  loadTheme();
  loadTodos();
  renderDate();
  bindEvents();
  render();
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  showToast(`Switched to ${next} theme`, 'info');
}

function renderDate() {
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const todayFormatted = new Date().toLocaleDateString(undefined, options);
  currentDateDisplay.textContent = `${todayFormatted} — Stay focused & organized`;
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      todos = JSON.parse(raw);
    } else {
      todos = [...DEFAULT_TODOS];
      saveTodos();
    }
  } catch (err) {
    console.error('Failed to load tasks from storage', err);
    todos = [...DEFAULT_TODOS];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (err) {
    console.error('Failed to save tasks', err);
    showToast('Failed to save changes to storage', 'danger');
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Render UI
function render() {
  updateStats();
  renderTodoList();
}

function updateStats() {
  const stats = getStats(todos);

  statTotalEl.textContent = stats.total;
  statCompletedEl.textContent = stats.completed;
  statActiveEl.textContent = stats.active;
  statOverdueEl.textContent = stats.overdue;

  statsPercentEl.textContent = `${stats.percent}%`;
  progressBarFillEl.style.width = `${stats.percent}%`;

  countAllEl.textContent = stats.total;
  countActiveEl.textContent = stats.active;
  countCompletedEl.textContent = stats.completed;

  // Bulk actions status
  bulkSummaryText.textContent = `${stats.active} remaining · ${stats.completed} completed`;
  toggleAllBtn.textContent = stats.active === 0 && stats.total > 0 ? 'Mark all active' : 'Complete all';
  clearCompletedBtn.style.display = stats.completed > 0 ? 'inline-flex' : 'none';
}

function renderTodoList() {
  const filtered = filterTodos(todos, currentFilter);
  const sorted = sortTodos(filtered, currentFilter.sortBy);

  todoListEl.innerHTML = '';

  if (sorted.length === 0) {
    emptyStateEl.style.display = 'flex';
    const isFiltered = currentFilter.search || currentFilter.status !== 'all' ||
                       currentFilter.category !== 'all' || currentFilter.priority !== 'all';

    if (isFiltered) {
      emptyStateTitleEl.textContent = 'No matching tasks';
      emptyStateDescEl.textContent = 'Try adjusting your filters or search query.';
      resetFiltersBtn.style.display = 'inline-flex';
    } else {
      emptyStateTitleEl.textContent = 'No tasks yet';
      emptyStateDescEl.textContent = 'You have a clean slate! Add a new task above to get started.';
      resetFiltersBtn.style.display = 'none';
    }
    return;
  }

  emptyStateEl.style.display = 'none';

  sorted.forEach((todo) => {
    const li = createTodoElement(todo);
    todoListEl.appendChild(li);
  });
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
  li.dataset.id = todo.id;

  // Checkbox container
  const checkboxContainer = document.createElement('label');
  checkboxContainer.className = 'checkbox-container';
  checkboxContainer.setAttribute('aria-label', `Mark task "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`);

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = todo.completed;
  input.addEventListener('change', () => toggleTodo(todo.id));

  const customCheck = document.createElement('span');
  customCheck.className = 'custom-checkbox';
  customCheck.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `;

  checkboxContainer.appendChild(input);
  checkboxContainer.appendChild(customCheck);

  // Todo body
  const body = document.createElement('div');
  body.className = 'todo-body';

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = todo.text;
  text.title = 'Click to edit';
  text.addEventListener('click', () => openEditModal(todo.id));

  // Badges
  const badges = document.createElement('div');
  badges.className = 'todo-badges';

  // Priority badge
  const priorityBadge = document.createElement('span');
  priorityBadge.className = `badge-pill priority-badge priority-${todo.priority}`;
  priorityBadge.textContent = todo.priority.toUpperCase();
  badges.appendChild(priorityBadge);

  // Category badge
  if (todo.category) {
    const catBadge = document.createElement('span');
    catBadge.className = 'badge-pill category-badge';
    catBadge.textContent = todo.category;
    badges.appendChild(catBadge);
  }

  // Due date badge
  if (todo.dueDate) {
    const dateBadge = document.createElement('span');
    const overdue = isOverdue(todo);
    const today = isDueToday(todo);

    let dateClass = 'badge-pill date-badge';
    let prefix = '📅 ';
    if (overdue) {
      dateClass += ' is-overdue';
      prefix = '⚠️ Overdue: ';
    } else if (today) {
      dateClass += ' is-today';
      prefix = '⏰ Due Today: ';
    }

    dateBadge.className = dateClass;
    dateBadge.textContent = `${prefix}${todo.dueDate}`;
    badges.appendChild(dateBadge);
  }

  body.appendChild(text);
  body.appendChild(badges);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'todo-actions';

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'btn-icon-action';
  editBtn.title = 'Edit task';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  `;
  editBtn.addEventListener('click', () => openEditModal(todo.id));

  // Duplicate button
  const dupBtn = document.createElement('button');
  dupBtn.className = 'btn-icon-action';
  dupBtn.title = 'Duplicate task';
  dupBtn.setAttribute('aria-label', 'Duplicate task');
  dupBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="13" height="13" x="9" y="9" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
  `;
  dupBtn.addEventListener('click', () => duplicateTodo(todo.id));

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'btn-icon-action btn-delete';
  delBtn.title = 'Delete task';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  `;
  delBtn.addEventListener('click', () => deleteTodo(todo.id));

  actions.appendChild(editBtn);
  actions.appendChild(dupBtn);
  actions.appendChild(delBtn);

  li.appendChild(checkboxContainer);
  li.appendChild(body);
  li.appendChild(actions);

  return li;
}

// Handlers
function handleAddTodo(e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;

  try {
    const newTodo = createTodo({
      text,
      priority: prioritySelect.value,
      category: categorySelect.value,
      dueDate: dueDateInput.value || null,
    });

    todos.unshift(newTodo);
    saveTodos();
    render();

    todoInput.value = '';
    dueDateInput.value = '';
    showToast('Task added successfully', 'success');
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function toggleTodo(id) {
  const item = todos.find((t) => t.id === id);
  if (!item) return;

  item.completed = !item.completed;
  saveTodos();
  render();
  showToast(item.completed ? 'Task completed' : 'Task marked active', 'info');
}

function deleteTodo(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return;

  const [removed] = todos.splice(index, 1);
  saveTodos();
  render();
  showToast(`Deleted "${removed.text.slice(0, 24)}..."`, 'info');
}

function duplicateTodo(id) {
  const item = todos.find((t) => t.id === id);
  if (!item) return;

  const copy = createTodo({
    text: `${item.text} (Copy)`,
    priority: item.priority,
    category: item.category,
    dueDate: item.dueDate,
  });

  todos.unshift(copy);
  saveTodos();
  render();
  showToast('Task duplicated', 'success');
}

function toggleAll() {
  const hasActive = todos.some((t) => !t.completed);
  todos.forEach((t) => {
    t.completed = hasActive;
  });
  saveTodos();
  render();
  showToast(hasActive ? 'All tasks marked completed' : 'All tasks marked active', 'info');
}

function clearCompleted() {
  const count = todos.filter((t) => t.completed).length;
  if (count === 0) return;

  todos = todos.filter((t) => !t.completed);
  saveTodos();
  render();
  showToast(`Cleared ${count} completed task${count > 1 ? 's' : ''}`, 'info');
}

// Modal handling
function openEditModal(id) {
  const item = todos.find((t) => t.id === id);
  if (!item) return;

  editTodoId.value = item.id;
  editTodoText.value = item.text;
  editPriority.value = item.priority;
  editCategory.value = item.category;
  editDueDate.value = item.dueDate || '';

  editModal.style.display = 'flex';
  editModal.setAttribute('aria-hidden', 'false');
  editTodoText.focus();
}

function closeEditModal() {
  editModal.style.display = 'none';
  editModal.setAttribute('aria-hidden', 'true');
}

function handleSaveEdit(e) {
  e.preventDefault();
  const id = editTodoId.value;
  const item = todos.find((t) => t.id === id);
  if (!item) return;

  const newText = editTodoText.value.trim();
  if (!newText) {
    showToast('Task description cannot be empty', 'danger');
    return;
  }

  item.text = newText;
  item.priority = editPriority.value;
  item.category = editCategory.value;
  item.dueDate = editDueDate.value || null;

  saveTodos();
  closeEditModal();
  render();
  showToast('Task updated', 'success');
}

// Event Bindings
function bindEvents() {
  addTodoForm.addEventListener('submit', handleAddTodo);

  themeToggleBtn.addEventListener('click', toggleTheme);

  // Search
  searchInput.addEventListener('input', (e) => {
    currentFilter.search = e.target.value;
    clearSearchBtn.style.display = e.target.value ? 'block' : 'none';
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentFilter.search = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    render();
  });

  // Filter tabs
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter.status = btn.dataset.status;
      render();
    });
  });

  // Category and Priority filters
  filterCategoryEl.addEventListener('change', (e) => {
    currentFilter.category = e.target.value;
    render();
  });

  filterPriorityEl.addEventListener('change', (e) => {
    currentFilter.priority = e.target.value;
    render();
  });

  sortByEl.addEventListener('change', (e) => {
    currentFilter.sortBy = e.target.value;
    render();
  });

  resetFiltersBtn.addEventListener('click', () => {
    currentFilter = {
      status: 'all',
      search: '',
      category: 'all',
      priority: 'all',
      sortBy: 'createdAt_desc',
    };
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    filterCategoryEl.value = 'all';
    filterPriorityEl.value = 'all';
    sortByEl.value = 'createdAt_desc';
    tabButtons.forEach((b) => {
      b.classList.toggle('active', b.dataset.status === 'all');
      b.setAttribute('aria-selected', b.dataset.status === 'all');
    });
    render();
  });

  // Bulk actions
  toggleAllBtn.addEventListener('click', toggleAll);
  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Edit Modal events
  editTodoForm.addEventListener('submit', handleSaveEdit);
  closeModalBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      searchInput.focus();
    } else if (e.key === 'Escape') {
      if (editModal.style.display === 'flex') {
        closeEditModal();
      }
    }
  });
}

// Start
document.addEventListener('DOMContentLoaded', init);
