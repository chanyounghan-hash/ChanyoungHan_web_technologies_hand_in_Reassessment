const doneList = document.getElementById('done-list');
const completeError = document.getElementById('complete-error');
const liveDoneList = doneList?.dataset.live === 'true';

const loadCompletedTasks = async () => {
    completeError.textContent = '';
    try {
        const response = await fetch('/api/dones');
        if (!response.ok) throw new Error('Failed to load completed tasks');
        const dones = await response.json();
        const items = dones.map((done) => {
            const item = document.createElement('li');
            item.className = 'done-item';
            item.dataset.id = done.id;
            const title = document.createElement('span');
            title.className = 'done-title';
            title.textContent = done.title;
            const time = document.createElement('span');
            time.className = 'done-time';
            time.textContent = new Date(done.completedAt).toLocaleString();
            const button = document.createElement('button');
            button.className = 'delete-done-btn';
            button.textContent = 'Delete';
            item.append(title, time, button);
            return item;
        });
        doneList.replaceChildren(...items);
        document.getElementById('done-empty').hidden = dones.length !== 0;
    } catch (error) {
        completeError.textContent = 'Could not load completed tasks. Please try again.';
    }
};

if (liveDoneList) {
    loadCompletedTasks();
    document.addEventListener('todo-completed', loadCompletedTasks);
}

const deleteDone = async (button) => {
    completeError.textContent = '';
    const doneItem = button.closest('.done-item');
    const doneId = doneItem.getAttribute('data-id');

    try {
        const response = await fetch(`/api/dones/${doneId}`, { method: 'DELETE' });

        if (!response.ok) {
            completeError.textContent = 'Could not delete completed task.';
            return;
        }

        if (liveDoneList) {
            doneItem.remove();
            document.getElementById('done-empty').hidden = doneList.children.length !== 0;
        } else {
            location.reload();
        }
    } catch (error) {
        completeError.textContent = 'Could not reach the server.';
    }
};

if (doneList) {
    doneList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-done-btn')) {
            deleteDone(event.target);
        }
    });
}
