const doneList = document.getElementById('done-list');
const completeError = document.getElementById('complete-error');

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

        location.reload();
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
