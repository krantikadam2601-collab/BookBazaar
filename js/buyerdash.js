console.log("🚀 BUYERDASH SCRIPT LOADED!"); // This should appear immediately

document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    let currentUserUID = null;
    let allBooks = []; 

    const availableBooksGrid = document.getElementById("availableBooksGrid");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");

    // ================= AUTH CHECK =================
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserUID = user.uid;
            document.getElementById("buyerEmail").textContent = user.email;
            loadAvailableBooks();
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
            availableBooksGrid.innerHTML = "<p>No books found.</p>";
            return;
        }

        booksToDisplay.forEach((book) => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.innerHTML = `
                <h3>${book.bookName || "Untitled"}</h3>
                <img src="${book.image || 'BBlogo.jpeg'}" alt="Cover" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px;">
                <div class="book-details">
                    <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
                    <p><strong>Category:</strong> ${book.category || "General"}</p>
                    <p><strong>Location:</strong> ${book.location || "Pune"}</p>
                </div>
                <div class="book-price">₹${book.price}</div>
                <button class="btn-save btn-wishlist" data-id="${book.id}">Add to Wishlist ❤️</button>
            `;
            availableBooksGrid.appendChild(card);
        });
    }

    // ================= SEARCH & FILTER =================
    function filterBooks() {
        console.log("🔍 Filtering logic triggered!"); // If this doesn't show, the event listener failed
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
    searchInput.addEventListener("input", filterBooks);
    categoryFilter.addEventListener("change", filterBooks);
});
