const socket = io.connect("localhost:4000");

const sender = document.querySelector("#Name");
const text_input = document.querySelector('#input-message');
const send_message = document.querySelector("#send-message");

const chat_log = document.querySelector("#chat-log");
const input_container = document.querySelector("#input-container");

chat_log.addEventListener('click', function (event) {
    if (!event.target.closest('.message')) {
        text_input.focus();
    } else {
        console.log('Clicked on msg');
    }
});

input_container.addEventListener('click', function (event) {
    text_input.focus();
});

text_input.addEventListener('input', () => {
    if (text_input.value == "") {
        text_input.style.height = `${1.2}rem`;
    } else {
        //text_input.style.height = 'auto';
        text_input.style.height = `${text_input.scrollHeight}px`;
    }
});

send_message.addEventListener("click", () => {
    //console.log(`encoRoomName : ${encoRoomName}`);
    //const roomName = encoRoomName.replace(/&#(\d+);/g, function (match, dec) {
    //    return String.fromCharCode(dec);
    //});
    //console.log(`roomName : ${roomName}`);
    const message = text_input.value.replace(/^[ \t]*[\r\n]+/gm, '');
    if (message == "") return;
    /*const message = text_input.value.replace(/[\n\r\s]+/g, ' ');
    This will replace all new lines(\n), carriage returns(\r) and spaces(\s) with a single space character(' ').*/
    socket.emit("chat", {
        message: message,
        sender: sender.innerHTML,
    });

    // convert html contents to text (if any)
    const rawMessageDiv = document.createElement("div");
    rawMessageDiv.textContent = message;
    var rawMessage = rawMessageDiv.innerHTML;

    var currentdate = new Date();
    var datetime = currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var msg =
        "<div class='chat self'>" +
        "<div class='message'>" +
        /*"<div class='username'>" + sender.innerHTML + "</div>" +*/
        "<div class='textcont'>" + rawMessage + "</div>" +
        "<div class='time'>" + datetime + "</div>" +
        "</div>" +
        "</div>";
    chat_log.innerHTML += msg;
    console.log("sending msg:" + msg);
    text_input.value = "";
    text_input.style.height = 'auto';
    text_input.style.height = `${1.2}rem`;
});

socket.on("chat", (data) => {
    console.log("Received msg");
    const message = data.message.replace(/^[ \t]*[\r\n]+/gm, '');
    if (message == "") return;
    // convert html contents to text (if any)
    const rawMessageDiv = document.createElement("div");
    rawMessageDiv.textContent = message;
    var rawMessage = rawMessageDiv.innerHTML;

    var currentdate = new Date();
    var datetime = currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var msg =
        "<div class='chat friend'>" +
        "<div class='message'>" +
        "<div class='username'>" + data.sender + "</div>" +
        "<div class='textcont'>" + rawMessage + "</div>" +
        "<div class='time'>" + datetime + "</div>" +
        "</div>" +
        "</div>";

    if (data.sender !== sender.innerHTML)
        chat_log.innerHTML += msg;
    console.log("Received msg:" + msg);
});

function logout() {
    // Clear local storage
    localStorage.clear();
    // Redirect to login page
    window.location.href = "/login";
}