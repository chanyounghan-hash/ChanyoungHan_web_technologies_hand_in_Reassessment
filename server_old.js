const express = require('express');
const path = require('path');
const { sequelize, Todo, Done } = require('./models_NoUse');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'base.html'));
});

app.get('/complete', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'complete.html'));
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
    const title = (req.body.title || '').trim();

    if (!title) {
        return res.status(400).json({ error: 'Title cannot be empty.' });
    }

    if (title.length > 200) {
        return res.status(400).json({ error: 'Title cannot exceed more than 200 characters.' });
    }

    try {
        const todo = await Todo.create({ title });
        res.status(201).json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not create Todo.' });
    }
});

app.post('/api/todos/:id/complete', async (req, res) => {
    try {
        const todo = await Todo.findByPk(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found.' });
        }

        const done = await Done.create({
            title: todo.title,
            completedAt: new Date()
        });

        await todo.destroy();
        res.status(201).json(done);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not complete Todo.' });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    const title = (req.body.title || '').trim();

    if (!title) {
        return res.status(400).json({ error: 'Title cannot be empty.' });
    }

    if (title.length > 200) {
        return res.status(400).json({ error: 'Title cannot exceed more than 200 characters.' });
    }

    try {
        const todo = await Todo.findByPk(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found.' });
        }

        todo.title = title;
        await todo.save();
        res.json(todo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update Todo.' });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByPk(req.params.id);

        if (!todo) {
            return res.status(404).json({ error: 'Todo not found.' });
        }

        await todo.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not delete Todo.' });
    }
});

app.get('/api/dones', async (req, res) => {
    try {
        const dones = await Done.findAll({ order: [['completedAt', 'DESC']] });
        res.json(dones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not load completed tasks.' });
    }
});

app.delete('/api/dones/:id', async (req, res) => {
    try {
        const done = await Done.findByPk(req.params.id);

        if (!done) {
            return res.status(404).json({ error: 'Completed task not found.' });
        }

        await done.destroy();
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not delete completed task.' });
    }
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
