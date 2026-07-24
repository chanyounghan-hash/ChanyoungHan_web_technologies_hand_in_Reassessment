# Todo App

A simple Todo list app built with plain HTML/CSS/JavaScript on the frontend
and Node.js, Express, and SQLite (through Sequelize) on the backend.

## Project structure

```
project
    public
        css
            style.css
        js
            index.js
        base.html
        responsive.html
        about.html
    models
        Todo.js
    server.js
    package.json
```

## Install dependencies

```bash
npm install
```

## Run the app locally

```bash
npm start
```

Then open `http://localhost:3000` in a browser. Sequelize creates the
`database.sqlite` file and the `Todos` table automatically the first time
the server starts, so the Todo data survives server restarts.

Pages:

- `/` - Todo list
- `/responsive` - responsive layout page
- `/about` - about page

## Security

- Todo titles are checked on the server and limited to 200 characters.
- Titles are displayed with `textContent`, so they are not treated as HTML.
- Sequelize is used instead of building SQL queries with user input.
- The server limits JSON request size and sends headers that reduce XSS,
  clickjacking, content-type sniffing, and referrer information.
- `.env` and the SQLite database are excluded from Git.

The application does not have user accounts or cookies, so it does not use
session authentication or CSRF tokens. If accounts are added later, login,
authorization, password hashing, and CSRF protection must also be added.

## Deployment

The server reads the port supplied by the hosting platform and otherwise uses
port 3000 locally:

```bash
PORT=8080 npm start
```

For a public deployment, use a host that provides HTTPS. HTTPS is configured
by the hosting platform or reverse proxy rather than inside this Express app.
The current SQLite setup is intended for one server instance; a hosted database
should be used if the application needs multiple instances.
