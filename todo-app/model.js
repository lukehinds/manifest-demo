/**
 * Model and utility functions for the Todo Application
 */

export const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const Category = {
  WORK: 'Work',
  PERSONAL: 'Personal',
  SHOPPING: 'Shopping',
  HEALTH: 'Health',
  OTHER: 'Other',
};

export function createTodo({
  id = generateId(),
  text = '',
  priority = Priority.MEDIUM,
  category = Category.PERSONAL,
  dueDate = null,
  completed = false,
  createdAt = new Date().toISOString(),
} = {}) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Todo text cannot be empty');
  }

  const validPriorities = Object.values(Priority);
  if (!validPriorities.includes(priority)) {
    priority = Priority.MEDIUM;
  }

  return {
    id: String(id),
    text: trimmed,
    priority,
    category: category || Category.OTHER,
    dueDate: dueDate ? new Date(dueDate).toISOString().split('T')[0] : null,
    completed: Boolean(completed),
    createdAt,
  };
}

export function generateId() {
  return 'todo_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

export function filterTodos(todos = [], {
  status = 'all',
  search = '',
  category = 'all',
  priority = 'all',
} = {}) {
  const query = search.trim().toLowerCase();

  return todos.filter((todo) => {
    // Status filter
    if (status === 'active' && todo.completed) return false;
    if (status === 'completed' && !todo.completed) return false;

    // Category filter
    if (category !== 'all' && todo.category !== category) return false;

    // Priority filter
    if (priority !== 'all' && todo.priority !== priority) return false;

    // Search query filter
    if (query) {
      const matchText = todo.text.toLowerCase().includes(query);
      const matchCategory = todo.category.toLowerCase().includes(query);
      if (!matchText && !matchCategory) return false;
    }

    return true;
  });
}

export function sortTodos(todos = [], sortBy = 'createdAt_desc') {
  const list = [...todos];
  const priorityWeight = {
    [Priority.HIGH]: 3,
    [Priority.MEDIUM]: 2,
    [Priority.LOW]: 1,
  };

  return list.sort((a, b) => {
    switch (sortBy) {
      case 'priority_desc':
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      case 'priority_asc':
        return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
      case 'dueDate_asc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      case 'dueDate_desc':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return b.dueDate.localeCompare(a.dueDate);
      case 'text_asc':
        return a.text.localeCompare(b.text);
      case 'createdAt_asc':
        return a.createdAt.localeCompare(b.createdAt);
      case 'createdAt_desc':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}

export function getStats(todos = []) {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const today = new Date().toISOString().split('T')[0];
  const overdue = todos.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;

  return {
    total,
    completed,
    active,
    percent,
    overdue,
  };
}

export function isOverdue(todo) {
  if (!todo || todo.completed || !todo.dueDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return todo.dueDate < today;
}

export function isDueToday(todo) {
  if (!todo || !todo.dueDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return todo.dueDate === today;
}
