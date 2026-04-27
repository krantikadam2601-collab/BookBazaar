document.addEventListener("DOMContentLoaded", () => {
    // Note: 'db' is already declared in firebaseConfig.js
    const auth = firebase.auth();
    let currentUserUID = null;

    // UI Elements
    const buyerEmailDisplay = document.getElementById("buyerEmail");
    const shopSection = document.getElementById("shopSection");
    const wishlistSection = document.getElementById("wishlistSection");
    const availableBooksGrid = document.getElementById("availableBooksGrid");
    const wishlistGrid = document.getElementById("wishlistGrid");

    // ================= AUTHENTICATION CHECK =================
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserUID = user.uid;
            buyerEmailDisplay.textContent = user.email;
            loadAvailableBooks();
            loadWishlist();
        } else {
            window.location.href = "login.html";
        }
    });

    // ================= NAVIGATION =================
    document.getElementById("btnBrowse").addEventListener("click", () => {
        shopSection.style.display = "block";
        wishlistSection.style.display = "none";
    });

    document.getElementById("btnWishlist").addEventListener("click", () => {
        shopSection.style.display = "none";
        wishlistSection.style.display = "block";
    });

    // ================= LOAD BOOKS =================
    function loadAvailableBooks() {
        availableBooksGrid.innerHTML = "<p>Loading books...</p>";

        db.collection("books").get().then((querySnapshot) => {
            availableBooksGrid.innerHTML = ""; 
            
            if (querySnapshot.empty) {
                availableBooksGrid.innerHTML = "<p>No books available right now.</p>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const book = doc.data();
                const bookId = doc.id;
                
                const card = document.createElement('div');
                card.className = 'book-card';
                card.innerHTML = `
                    <h3>${book.bookName}</h3>
                    <div class="book-details">
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Category:</strong> ${book.category}</p>
                        <p><strong>Language:</strong> ${book.language}</p>
                        <p><strong>Location:</strong> ${book.location}</p>
                    </div>
                    <div class="book-price">₹${book.price}</div>
                    <button class="btn-save btn-wishlist" data-id="${bookId}">Add to Wishlist ❤️</button>
                `;
                availableBooksGrid.appendChild(card);
            });

            // Attach event listeners to all newly created "Add to Wishlist" buttons
            document.querySelectorAll('.btn-wishlist').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    // Find the book data from the snapshot
                    const bookData = querySnapshot.docs.find(d => d.id === id).data();
                    addToWishlist(id, bookData);
                });
            });

        }).catch(error => {
            console.error("Error loading books:", error);
            availableBooksGrid.innerHTML = "<p>Error loading books. Check console.</p>";
        });
    }

    // ================= ADD TO WISHLIST =================
    function addToWishlist(bookId, bookData) {
        if (!currentUserUID) return;

        db.collection("users").doc(currentUserUID).collection("wishlist").doc(bookId).set({
            bookName: bookData.bookName,
            author: bookData.author,
            price: bookData.price,
            category: bookData.category,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert(`"${bookData.bookName}" added to your Wishlist!`);
        }).catch((error) => {
            console.error("Error adding to wishlist: ", error);
            alert("Failed to add to wishlist.");
        });
    }

    // ================= LOAD WISHLIST =================
    function loadWishlist() {
        if (!currentUserUID) return;
        
        // Listen for real-time updates so the UI changes instantly when items are added/removed
        db.collection("users").doc(currentUserUID).collection("wishlist")
        .onSnapshot((querySnapshot) => {
            wishlistGrid.innerHTML = "";
            
            if (querySnapshot.empty) {
                wishlistGrid.innerHTML = "<p>Your wishlist is empty.</p>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const book = doc.data();
                const bookId = doc.id;
                
                const card = document.createElement('div');
                card.className = 'book-card';
                card.innerHTML = `
                    <h3>${book.bookName}</h3>
                    <div class="book-details">
                        <p><strong>Author:</strong> ${book.author}</p>
                        <p><strong>Category:</strong> ${book.category}</p>
                    </div>
                    <div class="book-price">₹${book.price}</div>
                    <button class="btn-remove" data-id="${bookId}">Remove ❌</button>
                `;
                wishlistGrid.appendChild(card);
            });

            // Attach event listeners to all newly created "Remove" buttons
            document.querySelectorAll('.btn-remove').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    removeFromWishlist(id);
                });
            });
        });
    }

    // ================= REMOVE FROM WISHLIST =================
    function removeFromWishlist(bookId) {
        db.collection("users").doc(currentUserUID).collection("wishlist").doc(bookId).delete()
        .then(() => {
            console.log("Book removed from wishlist");
            // No need to refresh the grid, onSnapshot handles it!
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
    }

    // ================= LOGOUT =================
    document.getElementById('logoutBtn').addEventListener('click', function () {
        if (confirm('Are you sure you want to logout?')) {
            auth.signOut().then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error("Logout error:", error);
            });
        }
    });
});
