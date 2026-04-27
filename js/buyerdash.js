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
            loadAvailableBooks();
        } else {
            window.location.href = "login.html";
        }
    });

    // ================= LOAD BOOKS =================
    function loadAvailableBooks() {
        console.log("Fetching books from Firestore...");
        db.collection("books").get().then((querySnapshot) => {
            allBooks = [];
            
            querySnapshot.forEach((doc) => {
                const book = doc.data();
                book.id = doc.id;
                allBooks.push(book);
            });

            console.log("Total books loaded:", allBooks.length);
            renderBooks(allBooks);
        }).catch(err => console.error("Database Error:", err));
    }

    function renderBooks(booksToDisplay) {
        availableBooksGrid.innerHTML = ""; 

        if (booksToDisplay.length === 0) {
            availableBooksGrid.innerHTML = "<p>No matching books found.</p>";
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
                    <p><strong>Price:</strong> ₹${book.price || "0"}</p>
                </div>
                <button class="btn-save btn-wishlist" data-id="${book.id}">Add to Wishlist ❤️</button>
            `;
            availableBooksGrid.appendChild(card);
        });
    }

    // ================= SEARCH LOGIC (With Safety) =================
    function filterBooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value;

        console.log(`Filtering for: "${searchTerm}" in category: ${selectedCategory}`);

        const filtered = allBooks.filter(book => {
            // Safety Check: Make sure bookName and author exist before calling toLowerCase()
            const name = (book.bookName || "").toLowerCase();
            const author = (book.author || "").toLowerCase();
            const category = book.category || "other";

            const matchesSearch = name.includes(searchTerm) || author.includes(searchTerm);
            const matchesCategory = (selectedCategory === "all") || (category === selectedCategory);

            return matchesSearch && matchesCategory;
        });

        renderBooks(filtered);
    }

    // Attach listeners
    if (searchInput) searchInput.addEventListener("input", filterBooks);
    if (categoryFilter) categoryFilter.addEventListener("change", filterBooks);
});
