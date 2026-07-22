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

    // extracts the title from the todo object
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
    getTodos().forEach((todo)=>{addTodoItem(todo)});
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

todoList.addEventListener('change',(event)=>{
    if (event.target.classList.contains('item-checkbox')) {
        const checkbox=event.target;
        const todoItem=checkbox.closest('.todo-item');

        const itemId=todoItem.getAttribute('id');
        const isChecked=checkbox.checked;

        const todos=getTodos();

        const targetIndex=todos.findIndex(todo=>todo.id===itemId);

        if (targetIndex !== -1){
            todos[targetIndex].isCompleted=isChecked;
            localStorage.setItem(STORAGE_KEY,JSON.stringify(todos));
        }
    }
})

const initTodoApp=()=>{
    todoForm.addEventListener('submit', handleFormSubmit);
    loadTodoItem();
    clearTodoInput();
};

document.addEventListener('DOMContentLoaded',initTodoApp);
