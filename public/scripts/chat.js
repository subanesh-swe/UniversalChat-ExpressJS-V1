const socket = io.connect("http://localhost:4000");

const sender = document.querySelector("#Name");
const text = document.querySelector("#textmessage");
const submit = document.querySelector("#send");
const contents = document.querySelector("#message");

/*
html {
  scroll-behavior: smooth;
}
const container = document.getElementById("my-container");
container.scrollTop = container.scrollHeight;
*/
submit.addEventListener("click", () => {
    socket.emit("chat", {
        message: text.value,
        sender: sender.innerHTML,
    });
});

socket.on("chat", (data) => {
    contents.innerHTML +=
        "<ul><li id='username'>" + data.sender + "</li>"
        +   "<li id='textcont'>" + data.message + "</li></ul>";
    text.value = " ";

});
