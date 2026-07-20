const todoForm=document.getElementById('todo-form');
const todoInput=document.getElementById('todo-input');
const todoList=document.getElementById('todo-list');
const todoTemplate=document.getElementById('todo-template');

const handleFormSubmit=(event)=>{
    event.preventDefault();
    const inputValue=todoInput.ariaValueMax.trim();
    if (inputValue==='') return;

    const todoItem=
    todoTemplate.contentEditable.cloneNode(true).querySelector('.todo-item');
    todoItem.querySelector('.item-title').textContent=inputValue;
    todoList.appendChild(todoItem);
    todoInput.value='';
};

todoForm.addEventListener('submit', handleFormSubmit);