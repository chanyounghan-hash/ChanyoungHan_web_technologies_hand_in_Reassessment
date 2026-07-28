# Todo App

This website is a simple Todo List application consisting of three pages: a Todo page for adding tasks, a Completed page for viewing completed tasks, and an About page containing a name and email address.

## Features

- **Todo Management**: Add, edit, complete, and delete todos
- **Completed Tasks**: View completed tasks ordered by newest first, and delete them
- **Persistence**: Automatic SQLite database storage via Sequelize ORM

## Project Structure

```
.
├── public/         # HTML, CSS, and client-side JavaScript
├── views/          # EJS templates
├── server.js       # Express server, database models, and API
├── package.json
└── package-lock.json
```

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

Open `http://localhost:3000` in your browser.

## Pages

- `/` — Todo list page
- `/complete` — Completed tasks page
- `/about` — About page
