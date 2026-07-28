const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const todoTemplate = document.getElementById('todo-template');
const errorMessage = document.getElementById('error-message');

const showError = (message) => {
    errorMessage.textContent = message;
};

const clearError = () => {
    errorMessage.textContent = '';
};

const createTodoItem = (todo) => {
    const todoItem = todoTemplate.content
        .cloneNode(true)
        .querySelector('.todo-item');

    todoItem.querySelector('.item-title').textContent = todo.title;
    todoItem.querySelector('.item-checkbox').checked = todo.isCompleted;
    todoItem.setAttribute('id', todo.id);

    return todoItem;
};

const addTodoItem = (todo) => {
    const todoItem = createTodoItem(todo);
    todoList.appendChild(todoItem);
};

const loadTodos = async () => {
    try {
        const response = await fetch('/api/todos');

        if (!response.ok) {
            showError('Could not load todos.');
            return;
        }

        const todos = await response.json();
        todos.forEach((todo) => { addTodoItem(todo) });
    } catch (error) {
        showError('Could not reach the server.');
    }
};

const handleFormSubmit = async (event) => {
    event.preventDefault();
    clearError();

    const inputValue = todoInput.value.trim();

    if (inputValue === '') {
        showError('Please enter a todo title.');
        return;
    }

    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: inputValue })
        });

        if (!response.ok) {
            showError('Could not add todo.');
            return;
        }

        const newTodo = await response.json();
        addTodoItem(newTodo);
        todoInput.value = '';
    } catch (error) {
        showError('Could not reach the server.');
    }
};

const handleCheckboxChange = async (checkbox) => {
    clearError();

    const todoItem = checkbox.closest('.todo-item');
    const todoId = todoItem.getAttribute('id');

    try {
        const response = await fetch(`/api/todos/${todoId}/complete`, {
            method: 'POST'
        });

        if (!response.ok) {
            showError('Could not complete todo.');
            checkbox.checked = false;
            return;
        }

        todoItem.remove();
    } catch (error) {
        showError('Could not reach the server.');
        checkbox.checked = false;
    }
};

const handleEditClick = async (button) => {
    clearError();

    const todoItem = button.closest('.todo-item');
    const todoId = todoItem.getAttribute('id');
    const titleSpan = todoItem.querySelector('.item-title');

    const newTitle = prompt('Edit todo title:', titleSpan.textContent);

    if (newTitle === null) return;

    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === '') {
        showError('Title cannot be empty.');
        return;
    }

    try {
        const response = await fetch(`/api/todos/${todoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: trimmedTitle })
        });

        if (!response.ok) {
            showError('Could not update todo.');
            return;
        }

        titleSpan.textContent = trimmedTitle;
    } catch (error) {
        showError('Could not reach the server.');
    }
};

const handleDeleteClick = async (button) => {
    clearError();

    const todoItem = button.closest('.todo-item');
    const todoId = todoItem.getAttribute('id');

    try {
        const response = await fetch(`/api/todos/${todoId}`, { method: 'DELETE' });

        if (!response.ok) {
            showError('Could not delete todo.');
            return;
        }

        todoItem.remove();
    } catch (error) {
        showError('Could not reach the server.');
    }
};

todoList.addEventListener('change', (event) => {
    if (event.target.classList.contains('item-checkbox')) {
        handleCheckboxChange(event.target);
    }
});

todoList.addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-btn')) {
        handleEditClick(event.target);
    }

    if (event.target.classList.contains('delete-btn')) {
        handleDeleteClick(event.target);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    todoForm.addEventListener('submit', handleFormSubmit);
    loadTodos();
});
