document.addEventListener("DOMContentLoaded", () => {

    // ================= FILE INPUT =================
    const fileInput = document.getElementById('picture');
    const fileNameDisplay = document.getElementById('fileName');
    const fileLabel = document.querySelector('.file-input-label');

    if (fileInput && fileNameDisplay && fileLabel) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const fileName = this.files[0].name;

                // Update label (main visible fix)
                fileLabel.textContent = "Selected: " + fileName;

                // Update text below
                fileNameDisplay.textContent = fileName;
            } else {
                fileLabel.textContent = "Choose File";
                fileNameDisplay.textContent = "No file selected";
            }
        });
    }

    // ================= FORM SUBMIT =================
    const form = document.getElementById('bookListingForm');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData);

            // 🔥 Save to Firestore
            db.collection("books").add({
                seller: data.seller,
                location: data.location,
                contact: data.contact,
                bookName: data.bookName,
                author: data.author,
                category: data.category,
                language: data.language,
                price: Number(data.price),
                pageNo: Number(data.pageNo),
                otherInfo: data.otherInfo || "",
                image: "" // (image upload not implemented yet)
            })
            .then((docRef) => {
                console.log("Saved ID:", docRef.id);
                alert("Book listing added successfully!");

                // Reset form
                form.reset();

                // Reset UI
                fileNameDisplay.textContent = "No file selected";
                fileLabel.textContent = "Choose File";
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Error saving data: " + error.message);
            });
        });
    }

    // ================= CLEAR BUTTON =================
    const clearBtn = document.querySelector('.btn-clear');

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (fileNameDisplay && fileLabel) {
                fileNameDisplay.textContent = "No file selected";
                fileLabel.textContent = "Choose File";
            }
        });
    }

    // ================= LOGOUT =================
    const logoutBtn = document.querySelector('.logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            if (confirm('Are you sure you want to logout?')) {

                firebase.auth().signOut()
                .then(() => {
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error("Logout error:", error);
                });
            }
        });
    }

});