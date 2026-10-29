# Todo App

This website is a Todo List application with four pages: a Todo page for managing tasks, a Text Editor page for writing notes, a Completed page for viewing completed tasks, and an About page containing a name and email address.

## Features

- **Todo Management**: Add, edit, complete, and delete todos
- **Completed Tasks**: View completed tasks ordered by newest first, and delete them
- **Persistence**: Todo and completed tasks are stored in SQLite via Sequelize ORM
- **Text Editor**: Write plain text with Markdown syntax highlighting
- **Share Notes**: Copy a link containing the encoded note
- **Export Notes**: Download notes as TXT from the editor menu,
  or as HTML using Ctrl+S / Cmd+S

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

- `/Text editor` — Text editor with Markdown highlighting, sharing, and export
- `/Todo list` — Todo list page
- `/complete` — Completed tasks page
- `/about` — About page

## Data Storage

Todo and completed tasks are stored in SQLite.

Text editor notes are encoded in the URL fragment rather than stored
in SQLite. Keep the full share link or export the note to access it later.
