let username = '';

while (!username || username.trim() === '') {
    username = prompt("Ingresa tu nombre de usuario:");
    if (!username || username.trim() === '') {
        alert("Debes escribir un nombre de usuario para poder ingresar.");
    }
}

username = username.trim(); // Elimina espacios al inicio y final

const socket = new WebSocket(`ws://${window.location.host}`);

const messagesDiv = document.getElementById('messages');
const input = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

function escapeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'username', username }));
});

sendButton.addEventListener('click', () => {
    if (input.value) {
        socket.send(JSON.stringify({ message: input.value }));
        input.value = '';
    }
});

socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong style="color: ${data.color}">${escapeHTML(data.username)}:</strong> ${escapeHTML(data.message)}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});