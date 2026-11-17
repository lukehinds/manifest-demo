# FocusTask — Modern Todo App

A responsive, high-performance, and feature-rich Todo single-page application built with vanilla modern Web Standards (HTML5, CSS3, and ES Modules) and zero external runtime dependencies.

## Features

- **Core Task Management**: Create, view, edit (modal dialog), duplicate, and delete tasks.
- **Organization & Metadata**:
  - **Priorities**: High, Medium, Low (with color-coded badge indicators).
  - **Categories**: Personal, Work, Shopping, Health, Other.
  - **Due Dates**: Automatic detection for "Due Today" (amber) and "Overdue" (red).
- **Instant Search & Multi-Criteria Filtering**:
  - Full-text search across titles and categories (shortcut: `Ctrl+/` or `Cmd+/`).
  - Status tabs: All, Active, Completed with live item counts.
  - Category and Priority dropdown filters.
  - Sort by: Newest First, Oldest First, Due Date (Soonest), Priority (High to Low), Alphabetical (A-Z).
- **Progress Tracking**: Real-time progress bar and metrics (Total, Completed, Active, Overdue).
- **Dark & Light Mode**: Seamless theme toggle with automatic OS preference detection and persistence.
- **Bulk Operations**: "Complete All" / "Mark All Active" and "Clear Completed".
- **Keyboard Shortcuts**: `Ctrl+/` or `Cmd+/` to search, `Enter` to add/save, `Escape` to close modals.
- **Persistence**: Automatic client-side persistence via `localStorage`.

## Project Structure

```
todo-app/
├── index.html        # Main application markup & accessible UI elements
├── styles.css        # Modern design system (light/dark themes, responsive)
├── app.js            # Frontend application logic & event listeners
├── model.js          # Pure business logic (filtering, sorting, stats calculation)
├── server.mjs        # Zero-dependency static HTTP & unix socket server
├── package.json      # Scripts and metadata
└── tests/
    ├── todo.test.mjs   # Unit tests for todo model and business logic
    └── server.test.mjs # Integration tests for the static file server
```

## Running the Application

To start the static file server:

```bash
cd todo-app
npm start
```

Or open `index.html` directly in any modern web browser.

## Running Tests

Run the built-in Node test suite:

```bash
cd todo-app
npm test
```
