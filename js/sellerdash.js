document.addEventListener("DOMContentLoaded", () => {

    // File input handler
    const fileInput = document.getElementById('picture');
    const fileNameDisplay = document.getElementById('fileName');

    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                fileNameDisplay.textContent = this.files[0].name.substring(0, 25);
            } else {
                fileNameDisplay.textContent = 'No file selected';
            }
        });
    }

    // Form submission
    const form = document.getElementById('bookListingForm');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // ✅ SAVE TO FIRESTORE
            db.collection("books").add({
                seller: data.seller,
                location: data.location,
                contact: data.contact,
                bookName: data.bookName,
                author: data.author,
                category: data.category,
                language: data.language,
                price: data.price,
                pageNo: data.pageNo || "",
                otherInfo: data.otherInfo || "",
                image: "" // placeholder
            })
            .then(() => {
                alert("Book listing added successfully!");
                this.reset();

                if (fileNameDisplay) {
                    fileNameDisplay.textContent = 'No file selected';
                }
            })
            .catch((error) => {
                alert("Error: " + error.message);
            });

        });
    }

    // Clear button handler
    const clearBtn = document.querySelector('.btn-clear');

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (fileNameDisplay) {
                fileNameDisplay.textContent = 'No file selected';
            }
        });
    }

    // Logout button
    const logoutBtn = document.querySelector('.logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to logout?')) {

                if (typeof firebase !== "undefined") {
                    firebase.auth().signOut().then(() => {
                        window.location.href = 'login.html';
                    });
                } else {
                    window.location.href = 'login.html';
                }
            }
        });
    }

});