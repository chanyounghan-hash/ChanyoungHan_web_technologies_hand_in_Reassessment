initUI();

function initUI() {
    const menu = document.querySelector('#menu');
    const button = document.querySelector('#button');
    const shareLink = document.querySelector('#share-link');

    button.addEventListener('click', (event) => {
        if (event.clientX || event.targetTouches) ripple(event);

        const isVisible = menu.classList.toggle('visible');
        button.setAttribute('aria-expanded', String(isVisible));
        shareLink.href = location.href;
    });

    function hideMenu() {
        menu.classList.remove('visible');
        button.setAttribute('aria-expanded', 'false');
    }

    function notify(message) {
        const notification = document.querySelector('#notification');
        notification.classList.add('visible');
        notification.textContent = message;
        setTimeout(() => notification.classList.remove('visible'), 2000);
    }

    document.body.addEventListener('click', (event) => {
        if (event.target.closest('#menu, #button, .ripple')) return;
        hideMenu();
    });
}

function ripple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;

    circle.classList.add('ripple');
    button.querySelector('.ripple')?.remove();
    button.appendChild(circle);
}