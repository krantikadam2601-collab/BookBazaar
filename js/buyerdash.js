console.log("🚀 BUYERDASH SCRIPT LOADED!");

document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    let currentUserUID = null;
    let allBooks = []; 

    const availableBooksGrid = document.getElementById("availableBooksGrid");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const wishlistGrid = document.getElementById("wishlistGrid");

    // ================= AUTH CHECK =================
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserUID = user.uid;
            document.getElementById("buyerEmail").textContent = user.email;
            loadAvailableBooks();
            loadWishlist(); // Make sure wishlist loads on login
        } else {
            window.location.href = "login.html";
        }
    });

    // ================= NAVIGATION =================
    document.getElementById("btnBrowse").addEventListener("click", () => {
        document.getElementById("shopSection").style.display = "block";
        document.getElementById("wishlistSection").style.display = "none";
    });

    document.getElementById("btnWishlist").addEventListener("click", () => {
        document.getElementById("shopSection").style.display = "none";
        document.getElementById("wishlistSection").style.display = "block";
    });

    // ================= LOAD BOOKS =================
    function loadAvailableBooks() {
        db.collection("books").get().then((querySnapshot) => {
            allBooks = [];
            availableBooksGrid.innerHTML = ""; 
            
            querySnapshot.forEach((doc) => {
                const book = doc.data();
                book.id = doc.id;
                allBooks.push(book);
            });
            renderBooks(allBooks);
        });
    }

    function renderBooks(booksToDisplay) {
        availableBooksGrid.innerHTML = ""; 

        if (booksToDisplay.length === 0) {
            availableBooksGrid.innerHTML = "<p>No books found matching your search.</p>";
            return;
        }

        booksToDisplay.forEach((book) => {
            const card = document.createElement('div');
            card.className = 'book-card';
            
            // All details including Language, Location, and Contact are restored here
            card.innerHTML = `
                <img src="${book.image || 'BBlogo.jpeg'}" alt="Cover" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ffe0cc;">
                <h3>${book.bookName || "Untitled"}</h3>
                <div class="book-details">
                    <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
                    <p><strong>Category:</strong> ${book.category || "General"}</p>
                    <p><strong>Language:</strong> ${book.language || "Not specified"}</p>
                    <p><strong>Location:</strong> ${book.location || "Not specified"}</p>
                    <p><strong>Contact:</strong> ${book.contact || "N/A"}</p>
                </div>
                <div class="book-price">₹${book.price || "0"}</div>
                <button class="btn-save btn-wishlist" data-id="${book.id}">Add to Wishlist ❤️</button>
            `;
            availableBooksGrid.appendChild(card);
        });

        // Add listeners to Wishlist buttons
        document.querySelectorAll('.btn-wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const bookData = allBooks.find(b => b.id === id);
                addToWishlist(id, bookData);
            });
        });
    }

    // ================= SEARCH & FILTER =================
    function filterBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value.toLowerCase();

        const filtered = allBooks.filter(book => {
            const name = (book.bookName || "").toLowerCase();
            const author = (book.author || "").toLowerCase();
            const category = (book.category || "").toLowerCase();

            const matchesSearch = name.includes(searchTerm) || author.includes(searchTerm);
            const matchesCategory = (selectedCategory === "all") || (category === selectedCategory);

            return matchesSearch && matchesCategory;
        });

        renderBooks(filtered);
    }

    // Attach listeners
    if (searchInput) searchInput.addEventListener("input", filterBooks);
    if (categoryFilter) categoryFilter.addEventListener("change", filterBooks);

    // ================= ADD TO WISHLIST =================
    function addToWishlist(bookId, bookData) {
        if (!currentUserUID) return;

        db.collection("users").doc(currentUserUID).collection("wishlist").doc(bookId).set({
            bookName: bookData.bookName,
            author: bookData.author,
            price: bookData.price,
            category: bookData.category,
            image: bookData.image || "", // IMPORTANT: Saves the image URL to the wishlist
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert(`"${bookData.bookName}" added to your Wishlist!`);
        });
    }

    // ================= LOAD WISHLIST =================
    function loadWishlist() {
        if (!currentUserUID) return;
        
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
                    <img src="${book.image || 'BBlogo.jpeg'}" alt="Cover" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ffe0cc;">
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
