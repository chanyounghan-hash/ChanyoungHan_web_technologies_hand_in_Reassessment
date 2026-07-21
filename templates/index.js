const todoForm=document.getElementById('todo-form');
const todoInput=document.getElementById('todo-input');
const todoList=document.getElementById('todo-list');
const todoTemplate=document.getElementById('todo-template');

const STORAGE_KEY='todos';

const getTodos = ()=>{
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
};

const saveTodoItem=(todoItem)=>{
    const todoData={
        id:todoItem.getAttribute('id'),
        title: todoItem.querySelector('.item-title').textContent,
        isCompleted:todoItem.querySelector('.item-checkbox').checked
    };

    const todos=getTodos().concat(todoData);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const createTodoItem=(todo)=>{
    const todoItem = todoTemplate.content
    .cloneNode(true)
    .querySelector('.todo-item');

    // extracts title form todo
    todoItem.querySelector('.item-title').textContent=todo.title;

    todoItem.querySelector('.item-checkbox').checked=todo.isCompleted;
    todoItem.setAttribute('id',todo.id);

    return todoItem;
};

const addTodoItem=(todo)=>{
    const todoItem=createTodoItem(todo);

    todoList.appendChild(todoItem);
    return todoItem;
};

const loadTodoItem=()=>{
    getTodos().forEach((todo)=>addTodoItem(todo));
};

const clearTodoInput=()=>{
    todoInput.value='';
};

const handleFormSubmit=(event)=>{
    event.preventDefault();

    const inputValue=todoInput.value.trim();

    if (inputValue==='') return;

    // A ID to prevent errors caused by duplicate names
    const newTodo={
        id:Date.now(),
        title:inputValue,
        isCompleted:false,
    };

    saveTodoItem(addTodoItem(newTodo));
    clearTodoInput();
};

const initTodoApp=()=>{
    todoForm.addEventListener('submit', handleFormSubmit);
    loadTodoItem();
    clearTodoInput();
};

document.addEventListener('DOMContentLoaded',initTodoApp);
