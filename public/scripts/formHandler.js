function formSubmitHandler(event, formId) {
    event.preventDefault();
    const formData = new FormData(document.getElementById(formId));
    //console.log(JSON.stringify(Object.fromEntries(formData.entries())));
    const data = Object.fromEntries(formData.entries());
    console.log("posting data = " + JSON.stringify(data));
    //fetch('/index/rooms', {
    fetch(window.location.pathname, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log("response data = " + JSON.stringify(data));
            if (data.result === true) {
                window.location.href = data.redirect;
            } else {
                alert(data.alert);
            }
        })
        .catch(error => {
            alert("Something went wrong, Try again after sometime!!!");
            console.error(error);
        });
}

function checkInputLength(input) {
    condole.log(`input...`);
    if (input.value.length > input.maxLength) {
        condole.log(`input... reached limit`);
        input.setCustomValidity(`You cannot type more than ${input.maxLength} characters.`);
    } else {
        condole.log(`input... within limit`);
        input.setCustomValidity("");
    }
}

function togglePassword(eyeBtnId, passwordFieldId) {
    const eyeBtn = document.getElementById(eyeBtnId);
    const passwordField = document.getElementById(passwordFieldId);

    if (passwordField.type === "password") {
        eyeBtn.setAttribute("class", "eye-slash");
        passwordField.type = "text";
    } else {
        eyeBtn.setAttribute("class", "eye");
        passwordField.type = "password";
    }
}

//function formSubmitHandler(event) {
//    event.preventDefault();
//    console.log(JSON.stringify(event));
//}

//const formHandler = document.getElementById('postForm');

//formHandler.addEventListener('submit', (event) => {
//    event.preventDefault();
//    const formData = new FormData(event.target);
//    const data = Object.fromEntries(formData.entries());
//    console.log("posting data = " + JSON.stringify(data));
//    //fetch('/index/rooms', {
//    fetch(window.location.pathname, {
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json'
//        },
//        body: JSON.stringify(data)
//    })
//        .then(response => response.json())
//        .then(data => {
//            console.log("response data = " + JSON.stringify(data));
//            if (data.result === true) {
//                window.location.href = data.redirect;
//            } else {
//                alert(data.alert);
//            }
//        })
//        .catch(error => {
//            alert("Something went wrong, Try again after sometime!!!");
//            console.error(error);
//        });
//});