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
function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            alert("Login Successful!");
            window.location.href = "roleSelection.html";
        })
        .catch((error) => {
            alert(error.message);
        });
}