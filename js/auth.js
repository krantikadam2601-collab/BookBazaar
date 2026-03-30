function signUp() {
    alert("Button clicked");

    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert("Signup Successful!");
            window.location.href = "login.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}