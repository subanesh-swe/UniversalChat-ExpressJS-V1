const socket = io.connect("http://localhost:4000");

const sender = document.querySelector("#Name");
const text = document.querySelector("#textmessage");
const submit = document.querySelector("#send");
const chat_log = document.querySelector("#chat-log");

submit.addEventListener("click", () => {
    socket.emit("chat", {
        message: text.value,
        sender: sender.innerHTML,
    });
    var currentdate = new Date();
    var datetime = currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var msg =
        "<div class='chat self'>" +
        "<div class='user-2-photo'></div>" +
        "<div class='user-2-message'>" +
        "<div class='chat__message__log'>" +
        "<span class='user-info'>" + sender.innerHTML + "</span>" +
        "<span class='user-info-2'>" + datetime + "</span> </div>" +
        "<p class='chat-message-2'>" + text.value + "</p>";
    chat_log.innerHTML += msg;
    console.log(msg);
    text.value = " ";
});

socket.on("chat", (data) => {
    var currentdate = new Date();
    var datetime = currentdate.getDay() + "/" + currentdate.getMonth()
        + "/" + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    var msg = 
        "<div class='chat friend'>" +
        "<div class='user-1-photo'></div>" +
        "<div class='user-1-message'>" +
        "<div class='chat__message__log'>" +
        "<span class='user-info'>" + data.sender + "</span>" +
        "<span class='user-info-2'>" + datetime + "</span> </div>" +
        "<p class='chat-message-2'>" + data.message + "</p>";
    if (data.sender !== sender.innerHTML)
        chat_log.innerHTML += msg;
    console.log(msg);
    text.value = " ";
});



//const chat_log = document.querySelector("#chat-log");
//const message = "<h1>subanesh</h1><h2>This is an example</h2>";
//const div = document.createElement("div");
//div.textContent = message;
//chat_log.appendChild(div);

//const div = document.createElement("div");
//div.textContent = data.message;
//msg += div.outerHTML; //this will have <div>...</div>
//msg += div.innerHTML; //this will not have <div>...</div>

//const div = document.createElement("div");
//div.classList.add("message"); // to create <div class="message">...</div>
