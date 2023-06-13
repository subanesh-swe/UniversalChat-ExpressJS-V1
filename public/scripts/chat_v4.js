const socket = io.connect("http://localhost:4000");

const sender = document.querySelector("#Name");
const text_input = document.querySelector('#input-message');
const send_message = document.querySelector("#send-message");
const chat_log = document.querySelector("#chat-log");


text_input.addEventListener('input', () => {
    text_input.style.height = 'auto';
    text_input.style.height = `${text_input.scrollHeight}px`;
});

send_message.addEventListener("click", () => {
    socket.emit("chat", {
        message: text_input.value,
        sender: sender.innerHTML,
    });
    var currentdate = new Date();
    var datetime = currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var msg =
        "<div class='chat self'>" +
        "<div class='message'>" +
        "<div class='username'>" + sender.innerHTML + "</div>" +
        "<div class='textcont'>" + text_input.value + "</div>" +
        "<div class='time'>" + datetime + "</div>" +
        "</div>" +
        "</div>";
    chat_log.innerHTML += msg;
    console.log(msg);
    text_input.value = "";
    text_input.style.height = 'auto';
    text_input.style.height = `${text_input.scrollHeight}px`;
});

socket.on("chat", (data) => {
    var currentdate = new Date();
    var datetime = currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var msg =
        "<div class='chat friend'>" +
        "<div class='message'>" +
        "<div class='username'>" + data.sender + "</div>" +
        "<div class='textcont'>" + data.message + "</div>" +
        "<div class='time'>" + datetime + "</div>" +
        "</div>" +
        "</div>";

    if (data.sender !== sender.innerHTML)
        chat_log.innerHTML += msg;
    console.log(msg);
});