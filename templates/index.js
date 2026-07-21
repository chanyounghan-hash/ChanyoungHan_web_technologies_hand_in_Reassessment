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
        title: todoItem.querySelector('.item-title').textContent,
    };
    const todos=getTodos().concat(todoData);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
};

const createTodoItem=(itemTitle)=>{
    const todoItem = todoTemplate.content
    .cloneNode(true)
    .querySelector('.todo-item');

    todoItem.querySelector('.item-title').textContent=itemTitle;

    return todoItem;
};

const addTodoItem=(itemTitle)=>{
    const todoItem=createTodoItem(itemTitle);

    todoList.appendChild(todoItem);
    return todoItem;
};

const loadTodoItem=()=>{
    getTodos().forEach((todo)=>addTodoItem(todo.title));
};

const clearTodoInput=()=>{
    todoInput.value='';
};

const handleFormSubmit=(event)=>{
    event.preventDefault();

    const inputValue=todoInput.value.trim();

    if (inputValue==='') return;

    saveTodoItem(addTodoItem(inputValue));
    clearTodoInput();
};

const initTodoApp=()=>{
    todoForm.addEventListener('submit', handleFormSubmit);
    loadTodoItem();
    clearTodoInput();
};

document.addEventListener('DOMContentLoaded',initTodoApp);
