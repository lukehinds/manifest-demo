import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTodo,
  filterTodos,
  sortTodos,
  getStats,
  isOverdue,
  isDueToday,
  Priority,
  Category,
} from '../model.js';

test('createTodo creates valid todo item', () => {
  const todo = createTodo({
    text: 'Test task',
    priority: Priority.HIGH,
    category: Category.WORK,
    dueDate: '2026-12-01',
  });

  assert.equal(todo.text, 'Test task');
  assert.equal(todo.priority, 'high');
  assert.equal(todo.category, 'Work');
  assert.equal(todo.dueDate, '2026-12-01');
  assert.equal(todo.completed, false);
  assert.ok(todo.id.startsWith('todo_'));
  assert.ok(todo.createdAt);
});

test('createTodo throws on empty or whitespace-only text', () => {
  assert.throws(() => createTodo({ text: '' }), /Todo text cannot be empty/);
  assert.throws(() => createTodo({ text: '   ' }), /Todo text cannot be empty/);
});

test('filterTodos filters by status, search, priority, category', () => {
  const todos = [
    createTodo({ id: '1', text: 'Buy groceries', priority: Priority.LOW, category: Category.SHOPPING, completed: false }),
    createTodo({ id: '2', text: 'Prepare slides', priority: Priority.HIGH, category: Category.WORK, completed: true }),
    createTodo({ id: '3', text: 'Dentist appointment', priority: Priority.MEDIUM, category: Category.HEALTH, completed: false }),
  ];

  // Status active
  const active = filterTodos(todos, { status: 'active' });
  assert.equal(active.length, 2);
  assert.deepEqual(active.map(t => t.id), ['1', '3']);

  // Status completed
  const completed = filterTodos(todos, { status: 'completed' });
  assert.equal(completed.length, 1);
  assert.equal(completed[0].id, '2');

  // Search text
  const searched = filterTodos(todos, { search: 'grocer' });
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, '1');

  // Priority filter
  const highPriority = filterTodos(todos, { priority: Priority.HIGH });
  assert.equal(highPriority.length, 1);
  assert.equal(highPriority[0].id, '2');

  // Category filter
  const healthCategory = filterTodos(todos, { category: Category.HEALTH });
  assert.equal(healthCategory.length, 1);
  assert.equal(healthCategory[0].id, '3');
});

test('sortTodos sorts by priority and due date', () => {
  const t1 = createTodo({ id: '1', text: 'Low task', priority: Priority.LOW, dueDate: '2026-12-20' });
  const t2 = createTodo({ id: '2', text: 'High task', priority: Priority.HIGH, dueDate: '2026-12-10' });
  const t3 = createTodo({ id: '3', text: 'Med task', priority: Priority.MEDIUM, dueDate: '2026-12-15' });

  const byPriorityDesc = sortTodos([t1, t2, t3], 'priority_desc');
  assert.deepEqual(byPriorityDesc.map(t => t.id), ['2', '3', '1']);

  const byDueDateAsc = sortTodos([t1, t2, t3], 'dueDate_asc');
  assert.deepEqual(byDueDateAsc.map(t => t.id), ['2', '3', '1']);
});

test('getStats calculates correct metrics', () => {
  const pastDate = '2020-01-01';
  const futureDate = '2030-01-01';

  const todos = [
    createTodo({ id: '1', text: 'A', completed: true }),
    createTodo({ id: '2', text: 'B', completed: false, dueDate: pastDate }),
    createTodo({ id: '3', text: 'C', completed: false, dueDate: futureDate }),
    createTodo({ id: '4', text: 'D', completed: false }),
  ];

  const stats = getStats(todos);
  assert.equal(stats.total, 4);
  assert.equal(stats.completed, 1);
  assert.equal(stats.active, 3);
  assert.equal(stats.percent, 25);
  assert.equal(stats.overdue, 1);
});

test('isOverdue and isDueToday flags', () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  assert.equal(isOverdue({ completed: false, dueDate: yesterday }), true);
  assert.equal(isOverdue({ completed: true, dueDate: yesterday }), false);
  assert.equal(isOverdue({ completed: false, dueDate: tomorrow }), false);

  assert.equal(isDueToday({ dueDate: todayStr }), true);
  assert.equal(isDueToday({ dueDate: tomorrow }), false);
});
