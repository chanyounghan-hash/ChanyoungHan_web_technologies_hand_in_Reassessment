initUI();

const article = document.querySelector('article');
const editor = new Editor(article, parseMarkdown);

article.addEventListener('input', debounce(500, save));
article.addEventListener('blur', save);

addEventListener('DOMContentLoaded', load);
addEventListener('hashchange', load);

addEventListener('load', () =>
    new MutationObserver(save).observe(article, {
        attributeFilter: ['style']
    })
);

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
    shareLink.addEventListener('click', async (event) => {
        event.preventDefault();

        if (!navigator.clipboard) {
            alert('Your browser does not support clipboard API');
            return;
        }

        try {
            await navigator.clipboard.writeText(location.href);
            notify('Link copied');
            hideMenu();
        } catch (error) {
            notify('Could not copy link');
        }
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

function debounce(milliseconds, callback) {
    let timer;

    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => callback(...args), milliseconds);
    };
}

function parseMarkdown(element) {
    const input = element.innerText;
    const fragment = document.createDocumentFragment();

    const matchers = [
        { name: 'md-codeblock', re: /```[^\n]*\n[\s\S]*?\n```/y },
        { name: 'md-codeblock', re: /~~~[^\n]*\n[\s\S]*?\n~~~/y },
        { name: 'md-h1', re: /^#[ \t]+[^\n]*$/my },
        { name: 'md-h2', re: /^##[ \t]+[^\n]*$/my },
        { name: 'md-h3', re: /^###[ \t]+[^\n]*$/my },
        { name: 'md-h4', re: /^####[ \t]+[^\n]*$/my },
        { name: 'md-h5', re: /^#####[ \t]+[^\n]*$/my },
        { name: 'md-h6', re: /^######[ \t]+[^\n]*$/my },
        { name: 'md-code', re: /`[^`\n]*`/y },
        { name: 'md-bold', re: /\*\*[^*\n]+?\*\*/y },
        { name: 'md-bold', re: /__[^_\n]+?__/y },
        { name: 'md-strike', re: /~~[^~\n]+?~~/y },
        { name: 'md-italic', re: /\*[^*\n]+?\*/y },
        { name: 'md-italic', re: /_[^_\n]+?_/y },
        { name: 'md-url', re: /https?:\/\/[^\s<>()\[\]{}"'`]+/y },
    ];

    const specials = ['`', '~', '*', '#', '_', 'h'];

    let index = 0;

    while (index < input.length) {
        let matched = false;

        for (const matcher of matchers) {
            matcher.re.lastIndex = index;
            const result = matcher.re.exec(input);

            if (result && result.index === index) {
                const raw = result[0];

                if (matcher.name === 'md-url') {
                    const anchor = document.createElement('a');
                    anchor.className = 'md-url';
                    anchor.href = raw;
                    anchor.textContent = raw;
                    anchor.target = '_blank';
                    anchor.rel = 'noopener noreferrer';
                    fragment.appendChild(anchor);
                } else {
                    const span = document.createElement('span');
                    span.className = matcher.name;
                    span.textContent = raw;
                    fragment.appendChild(span);
                }

                index += raw.length;
                matched = true;
                break;
            }
        }

        if (matched) continue;

        let next = input.length;

        for (const character of specials) {
            const foundAt = input.indexOf(character, index);

            if (foundAt !== -1 && foundAt < next) {
                next = foundAt;
            }
        }

        if (next === index) {
            fragment.appendChild(document.createTextNode(input[index]));
            index++;
        } else {
            fragment.appendChild(
                document.createTextNode(input.slice(index, next))
            );
            index = next;
        }
    }

    article.textContent = '';
    article.appendChild(fragment);
    article.normalize();
}

function Editor(element, highlight) {
    const listeners = [];
    const history = [];
    let at = -1;
    let previous;

    const debounceHighlight = debounce(30, () => {
        const position = save();
        highlight(element);
        restore(position);
    });

    const shouldRecord = (event) =>
        !isUndo(event) &&
        !isRedo(event) &&
        !['Meta', 'Control', 'Alt'].includes(event.key) &&
        !event.key.startsWith('Arrow');

    let recording = false;

    const debounceRecordHistory = debounce(300, (event) => {
        if (shouldRecord(event)) {
            recordHistory();
            recording = false;
        }
    });

    const on = (type, callback) => {
        listeners.push([type, callback]);
        element.addEventListener(type, callback);
    };

    on('keydown', (event) => {
        if (event.defaultPrevented) return;

        previous = toString();

        if (isUndo(event)) doUndo(event);
        if (isRedo(event)) doRedo(event);

        if (shouldRecord(event) && !recording) {
            recordHistory();
            recording = true;
        }
    });

    on('keyup', (event) => {
        if (event.defaultPrevented || event.isComposing) return;

        if (previous !== toString()) debounceHighlight();

        debounceRecordHistory(event);
    });

    on('paste', () => setTimeout(recordHistory, 10));
    on('cut', () => setTimeout(recordHistory, 10));

    on('beforeinput', (event) => {
        if (event.inputType === 'historyUndo') doUndo(event);
        if (event.inputType === 'historyRedo') doRedo(event);
    });

    function save() {
        const selection = getSelection();
        const position = { start: 0, end: 0, direction: undefined };

        let { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

        if (!anchorNode || !focusNode) {
            throw new Error('Editor selection is unavailable');
        }

        if (anchorNode === element && focusNode === element) {
            position.start =
                anchorOffset > 0 && element.innerText
                    ? element.innerText.length
                    : 0;

            position.end =
                focusOffset > 0 && element.innerText
                    ? element.innerText.length
                    : 0;

            position.direction = focusOffset >= anchorOffset ? '->' : '<-';
            return position;
        }

        if (anchorNode.nodeType === Node.ELEMENT_NODE) {
            const node = document.createTextNode('');
            anchorNode.insertBefore(node, anchorNode.childNodes[anchorOffset]);
            anchorNode = node;
            anchorOffset = 0;
        }

        if (focusNode.nodeType === Node.ELEMENT_NODE) {
            const node = document.createTextNode('');
            focusNode.insertBefore(node, focusNode.childNodes[focusOffset]);
            focusNode = node;
            focusOffset = 0;
        }

        visit(element, (node) => {
            if (node === anchorNode && node === focusNode) {
                position.start += anchorOffset;
                position.end += focusOffset;
                position.direction = anchorOffset <= focusOffset ? '->' : '<-';
                return 'stop';
            }

            if (node === anchorNode) {
                position.start += anchorOffset;

                if (!position.direction) position.direction = '->';
                else return 'stop';
            } else if (node === focusNode) {
                position.end += focusOffset;

                if (!position.direction) position.direction = '<-';
                else return 'stop';
            }

            if (node.nodeType === Node.TEXT_NODE) {
                if (position.direction !== '->') {
                    position.start += node.nodeValue.length;
                }

                if (position.direction !== '<-') {
                    position.end += node.nodeValue.length;
                }
            }
        });

        element.normalize();
        return position;
    }

    function restore(position) {
        const selection = getSelection();
        let startNode;
        let startOffset = 0;
        let endNode;
        let endOffset = 0;

        if (!position.direction) position.direction = '->';

        position.start = Math.max(0, position.start);
        position.end = Math.max(0, position.end);

        if (position.direction === '<-') {
            [position.start, position.end] = [position.end, position.start];
        }

        let current = 0;

        visit(element, (node) => {
            if (node.nodeType !== Node.TEXT_NODE) return;

            const length = (node.nodeValue || '').length;

            if (current + length > position.start) {
                if (!startNode) {
                    startNode = node;
                    startOffset = position.start - current;
                }

                if (current + length > position.end) {
                    endNode = node;
                    endOffset = position.end - current;
                    return 'stop';
                }
            }

            current += length;
        });

        if (!startNode) {
            startNode = element;
            startOffset = element.childNodes.length;
        }

        if (!endNode) {
            endNode = element;
            endOffset = element.childNodes.length;
        }

        if (position.direction === '<-') {
            [startNode, startOffset, endNode, endOffset] = [
                endNode,
                endOffset,
                startNode,
                startOffset,
            ];
        }

        for (const edge of ['start', 'end']) {
            const node = edge === 'start' ? startNode : endNode;
            const uneditableNode = uneditable(node);

            if (!uneditableNode) continue;

            const textNode = document.createTextNode('');
            uneditableNode.parentNode?.insertBefore(textNode, uneditableNode);

            if (edge === 'start') {
                startNode = textNode;
                startOffset = 0;
            } else {
                endNode = textNode;
                endOffset = 0;
            }
        }

        selection.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
        element.normalize();
    }

    function uneditable(node) {
        while (node && node !== element) {
            if (
                node.nodeType === Node.ELEMENT_NODE &&
                node.getAttribute('contenteditable') === 'false'
            ) {
                return node;
            }

            node = node.parentNode;
        }

        return null;
    }

    function doUndo(event) {
        event.preventDefault();
        at--;

        const record = history[at];

        if (record) {
            element.innerHTML = record.html;
            restore({ ...record.position });
        }

        if (at < 0) at = 0;
    }

    function doRedo(event) {
        event.preventDefault();
        at++;

        const record = history[at];

        if (record) {
            element.innerHTML = record.html;
            restore({ ...record.position });
        }

        if (at >= history.length) at--;
    }

    function recordHistory() {
        const html = element.innerHTML;
        const position = save();
        const lastRecord = history[at];

        if (
            lastRecord &&
            lastRecord.html === html &&
            lastRecord.position.start === position.start &&
            lastRecord.position.end === position.end
        ) {
            return;
        }

        at++;
        history[at] = { html, position };
        history.splice(at + 1);

        if (at > 10000) {
            at = 10000;
            history.splice(0, 1);
        }
    }

    function visit(root, visitor) {
        const queue = [];

        if (root.firstChild) queue.push(root.firstChild);

        let node = queue.pop();

        while (node) {
            if (visitor(node) === 'stop') break;
            if (node.nextSibling) queue.push(node.nextSibling);
            if (node.firstChild) queue.push(node.firstChild);

            node = queue.pop();
        }
    }

    function isCtrl(event) {
        return event.metaKey || event.ctrlKey;
    }

    function isUndo(event) {
        return isCtrl(event) && !event.shiftKey && event.code === 'KeyZ';
    }

    function isRedo(event) {
        return isCtrl(event) && event.shiftKey && event.code === 'KeyZ';
    }

    function toString() {
        return element.innerText || '';
    }

    function getSelection() {
        return element.getRootNode().getSelection();
    }

    return {
        set(content) {
            element.textContent = content;
            highlight(element);
        },
    };
}

async function load() {
    try {
        if (location.hash && location.hash !== '#new') {
            await set(location.hash);
        } else if (location.hash === '#new') {
            article.textContent = '';
            article.removeAttribute('style');
            history.replaceState({}, '', location.pathname);
        }
    } catch (error) {
        article.textContent = '';
        article.removeAttribute('style');
        history.replaceState({}, '', location.pathname);
    }

    updateTitle();
}

async function save() {
    const hash = await get();

    if (location.hash !== hash) {
        history.replaceState({}, '', hash);
    }

    updateTitle();
}

async function set(hash) {
    if (!hash) return;

    const [content, style] = (await decompress(hash.slice(1))).split('\x00');

    editor.set(content);

    if (style) article.setAttribute('style', style);
}

async function get() {
    const style = article.getAttribute('style');
    const content = article.innerText + (style !== null ? '\x00' + style : '');

    return '#' + (await compress(content));
}

function updateTitle() {
    const match = article.innerText.match(/^\n*#(.+)\n/);
    document.title = match?.[1] ?? 'Textarea';
}

async function compress(value) {
    const bytes = new TextEncoder().encode(value);
    const stream = new CompressionStream('deflate-raw');
    const writer = stream.writable.getWriter();

    writer.write(bytes);
    writer.close();

    const buffer = await new Response(stream.readable).arrayBuffer();

    return toBase64Url(new Uint8Array(buffer));
}

async function decompress(base64) {
    const bytes = fromBase64Url(base64);
    const stream = new DecompressionStream('deflate-raw');
    const writer = stream.writable.getWriter();

    writer.write(bytes);
    writer.close();

    const buffer = await new Response(stream.readable).arrayBuffer();

    return new TextDecoder().decode(buffer);
}

function toBase64Url(bytes) {
    let binary = '';

    for (let offset = 0; offset < bytes.length; offset += 0x8000) {
        binary += String.fromCharCode(
            ...bytes.subarray(offset, offset + 0x8000)
        );
    }

    return btoa(binary)
        .replaceAll('+', '-')
        .replaceAll('/', '_')
        .replace(/=+$/, '');
}

function fromBase64Url(value) {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));

    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}