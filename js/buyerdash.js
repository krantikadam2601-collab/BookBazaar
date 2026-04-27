document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    let currentUserUID = null;
    let allBooks = []; // This array acts as our local database for filtering

    // UI Elements
    const buyerEmailDisplay = document.getElementById("buyerEmail");
    const shopSection = document.getElementById("shopSection");
    const wishlistSection = document.getElementById("wishlistSection");
    const availableBooksGrid = document.getElementById("availableBooksGrid");
    const wishlistGrid = document.getElementById("wishlistGrid");
    
    // Search & Filter Elements
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");

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

    // ================= LOAD & RENDER LOGIC =================
    function loadAvailableBooks() {
        availableBooksGrid.innerHTML = "<p>Loading books...</p>";

        db.collection("books").get().then((querySnapshot) => {
            allBooks = []; // Clear the local list before repopulating
            
            if (querySnapshot.empty) {
                availableBooksGrid.innerHTML = "<p>No books available right now.</p>";
                return;
            }

            querySnapshot.forEach((doc) => {
                const book = doc.data();
                book.id = doc.id; // Store the ID for wishlist logic
                allBooks.push(book);
            });

            // Initial render showing all books
            renderBooks(allBooks);

        }).catch(error => {
            console.error("Error loading books:", error);
            availableBooksGrid.innerHTML = "<p>Error loading books.</p>";
        });
    }

    function renderBooks(booksToDisplay) {
        availableBooksGrid.innerHTML = ""; 
        
        if (booksToDisplay.length === 0) {
            availableBooksGrid.innerHTML = "<p>No books found matching your criteria.</p>";
            return;
        }

        booksToDisplay.forEach((book) => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <h3>${book.bookName}</h3>
                <img src="${book.image || 'BBlogo.jpeg'}" alt="Book Cover" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ffe0cc;">
                <div class="book-details">
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>Category:</strong> ${book.category}</p>
                    <p><strong>Language:</strong> ${book.language}</p>
                    <p><strong>Location:</strong> ${book.location}</p>
                    <p><strong>Contact:</strong> ${book.contact}</p>
                </div>
                <div class="book-price">₹${book.price}</div>
                <button class="btn-save btn-wishlist" data-id="${book.id}">Add to Wishlist ❤️</button>
            `;
            availableBooksGrid.appendChild(card);
        });

        // Re-attach listeners to the new buttons
        document.querySelectorAll('.btn-wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const bookData = allBooks.find(b => b.id === id);
                addToWishlist(id, bookData);
            });
        });
    }

    // ================= FILTERING SYSTEM =================
    function filterBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        const filtered = allBooks.filter(book => {
            // Check if title or author matches search term
            const matchesSearch = 
                book.bookName.toLowerCase().includes(searchTerm) || 
                book.author.toLowerCase().includes(searchTerm);
            
            // Check if category matches selection
            const matchesCategory = (selectedCategory === "all") || (book.category === selectedCategory);
            
            return matchesSearch && matchesCategory;
        });

        renderBooks(filtered);
    }

    // Attach real-time event listeners
    searchInput.addEventListener("input", filterBooks);
    categoryFilter.addEventListener("change", filterBooks);

    // ================= WISHLIST & LOGOUT =================
    // ... (Keep your existing addToWishlist, loadWishlist, and logout functions here)
});
