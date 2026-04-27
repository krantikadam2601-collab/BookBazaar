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
            const fileInput = document.getElementById('picture');
            const file = fileInput.files[0];

            if (!file) {
                alert("Please select a book cover image.");
                return;
            }

            // 1. Create a reference to Firebase Storage
            const storageRef = firebase.storage().ref('book_covers/' + Date.now() + '_' + file.name);

            const submitBtn = form.querySelector('.btn-save');
            submitBtn.textContent = "Uploading...";
            submitBtn.disabled = true;

            // 2. Upload the file
            storageRef.put(file).then((snapshot) => {
                return snapshot.ref.getDownloadURL();
            }).then((downloadURL) => {
                // 3. Save to Firestore (Typo fixed here!)
                return db.collection("books").add({
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
                    image: downloadURL // Link from Storage
                });
            }).then(() => {
                alert("Book listing and image added successfully!");
                form.reset();
                if (fileNameDisplay && fileLabel) {
                    fileNameDisplay.textContent = "No file selected";
                    fileLabel.textContent = "Choose File";
                }
            }).catch((error) => {
                console.error("Error:", error);
                alert("Error: " + error.message);
            }).finally(() => {
                submitBtn.textContent = "Save Listing";
                submitBtn.disabled = false;
            });
        }); // Correctly closes the event listener
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
                firebase.auth().signOut().then(() => {
                    window.location.href = 'login.html';
                });
            }
        });
    }
});
