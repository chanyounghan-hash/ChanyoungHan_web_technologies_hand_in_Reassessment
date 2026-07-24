const express = require('express');
const path = require('path');
const { sequelize, Todo } = require('./models/Todo');

const app = express();
const PORT = process.env.PORT || 3000;
const MAX_TITLE_LENGTH = 200;

app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    );
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

const getTitle = (value) => {
    if (typeof value !== 'string') return null;

    const title = value.trim();
    if (title === '' || title.length > MAX_TITLE_LENGTH) return null;

    return title;
};

const getTodoId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'base.html'));
});

app.get('/responsive', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'responsive.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.findAll({ order: [['id', 'ASC']] });
        res.json(todos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not load todos.' });
    }
});

app.post('/api/todos', async (req, res) => {
    const title = getTitle(req.body.title);

    if (title === null) {
        return res.status(400).json({ error: 'Title must contain between 1 and 200 characters.' });
    }

    try {
        const todo = await Todo.create({ title });
        res.status(201).json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create todo.' });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    const todoId = getTodoId(req.params.id);

    if (todoId === null) {
        return res.status(400).json({ error: 'Invalid todo ID.' });
    }

    try {
        const todo = await Todo.findByPk(todoId);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found.' });
        }

        if (req.body.title !== undefined) {
            const title = getTitle(req.body.title);

            if (title === null) {
                return res.status(400).json({ error: 'Title must contain between 1 and 200 characters.' });
            }

            todo.title = title;
        }

        if (req.body.isCompleted !== undefined) {
            if (typeof req.body.isCompleted !== 'boolean') {
                return res.status(400).json({ error: 'Completed value must be true or false.' });
            }

            todo.isCompleted = req.body.isCompleted;
        }

        await todo.save();
        res.json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update todo.' });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    const todoId = getTodoId(req.params.id);

    if (todoId === null) {
        return res.status(400).json({ error: 'Invalid todo ID.' });
    }

    try {
        const todo = await Todo.findByPk(todoId);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found.' });
        }

        await todo.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not delete todo.' });
    }
});

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Could not start the server:', error.message);
});
