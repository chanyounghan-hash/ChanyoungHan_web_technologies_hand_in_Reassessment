const express = require('express');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');


const app = express()
const PORT = process.env.PORT || 3000;

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

const Todo = sequelize.define('Todo', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: false });

const Done = sequelize.define('Done', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    completedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, { timestamps: false });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'base.html'));
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/complete', async (req, res) => {
    const dones = await Done.findAll({ order: [['completedAt', 'DESC']] });
    res.render('complete', { dones });
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/api/todos', async (req, res) => {
    try {
        const todos = await Todo.findAll();
        res.json(todos);
    } catch (error) {
        res.status(500).json({
            error: 'Error connecting to db'
        });
    }
});

app.post('/api/todos', async (req, res) => {
    try {
        if (typeof req.body?.title !== 'string') {
            return res.status(400).json({ error: 'Title must be text.' });
        }

        const title = req.body.title?.trim();

        if (!title) {
            return res.status(400).json({ error: 'Enter a title' });
        }

        if (title.length > 200) {
            return res.status(400).json({
                error: 'Title cannot exceed 200 characters.'
            });
        }

        const todo = await Todo.create({ title: title });

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add the task' });
    }
});

app.post('/api/todos/:id/complete', async (req, res) => {
    try {
        const todo = await Todo.findByPk(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Not Found' });
        }

        const done = await Done.create({ title: todo.title });
        await todo.destroy();
        res.status(201).json(done);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to mark the tast as complete'
        });
    }
});

app.put('/api/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByPk(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Not Found' });
        }

        if (typeof req.body?.title !== 'string') {
            return res.status(400).json({ error: 'Title must be text.' });
        }

        const title = req.body.title.trim();

        if (!title) {
            return res.status(400).json({ error: 'Enter a title' });
        }

        if (title.length > 200) {
            return res.status(400).json({
                error: 'Title cannot exceed 200 characters.'
            });
        }

        todo.title = title;
        await todo.save();
        res.json(todo);
    } catch (error) {
        res.status(500).json({ error: 'Failed to edit' });
    }
});

app.delete('/api/todos/:id', async (req, res) => {
    try {
        const todo = await Todo.findByPk(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Not Found' });
        }
        await todo.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

app.get('/api/dones', async (req, res) => {
    try {
        const dones = await Done.findAll({
            order: [['completedAt', 'DESC']]
        });
        res.json(dones);
    } catch (error) {
        res.status(500).json({
            error: "Failed to bring completed tasks"
        })
    }
});

app.delete('/api/dones/:id', async (req, res) => {
    try {
        const done = await Done.findByPk(req.params.id);

        if (!done) {
            return res.status(404).json({
                error: 'Completed task not found.'
            });
        }

        await done.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
});