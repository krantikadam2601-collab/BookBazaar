console.log("🚀 BUYERDASH SCRIPT LOADED!");

document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    let currentUserUID = null;
    let allBooks = []; 

    // UI Elements
    const availableBooksGrid = document.getElementById("availableBooksGrid");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const wishlistGrid = document.getElementById("wishlistGrid");
    
    // Modal Elements
    const productModal = document.getElementById("productViewModal");
    const modalContent = document.getElementById("modalContentBody");
    const closeProductModal = document.getElementById("closeProductModal");

    // ================= AUTH CHECK =================
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserUID = user.uid;
            document.getElementById("buyerEmail").textContent = user.email;
            loadAvailableBooks();
            loadWishlist(); 
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
            card.style.cursor = 'pointer'; // Visual cue for commercial sites
            
            card.innerHTML = `
                <img src="${book.image || 'BBlogo.jpeg'}" alt="Cover" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px; margin-bottom: 15px; border: 1px solid #ffe0cc;">
                <h3>${book.bookName || "Untitled"}</h3>
                <div class="book-details">
                    <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
                    <p><strong>Category:</strong> ${book.category || "General"}</p>
                    <p><strong>Location:</strong> ${book.location || "Not specified"}</p>
                </div>
                <div class="book-price">₹${book.price || "0"}</div>
                <button class="btn-save btn-wishlist" data-id="${book.id}">Add to Wishlist ❤️</button>
            `;
            
            // Trigger Modal on Card Click
            card.addEventListener('click', (e) => {
                // Don't open modal if they specifically clicked the wishlist button
                if (e.target.classList.contains('btn-wishlist')) return;
                openProductPage(book);
            });

            availableBooksGrid.appendChild(card);
        });

        // Add listeners to Wishlist buttons specifically
        document.querySelectorAll('.btn-wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevents card click event from firing
                const id = e.target.getAttribute('data-id');
                const bookData = allBooks.find(b => b.id === id);
                addToWishlist(id, bookData);
            });
        });
    }

    // ================= FULL PAGE MODAL LOGIC =================
   function openProductPage(book) {
    const modal = document.getElementById("productViewModal");
    const content = document.getElementById("modalContentBody");

    // We use fallback values ("Unknown Seller", etc.) in case the data is missing
    content.innerHTML = `
        <div class="product-layout">
            <div class="product-image-container">
                <img src="${book.image || 'BBlogo.jpeg'}" alt="Book Cover">
            </div>
            <div class="product-details-container">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #ff8c00; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">${book.category}</span>
                    <span style="background: #e8f5e9; color: #2e7d32; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">Verified Student Seller</span>
                </div>
                
                <h1 style="font-size: 48px; margin: 10px 0 5px 0;">${book.bookName}</h1>
                <p style="font-size: 22px; color: #555; margin-bottom: 20px;">by <strong>${book.author}</strong></p>
                
                <div class="modal-price">₹${book.price}</div>
                
                <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
                    <h3 style="color: #333; margin-bottom: 10px;">Book Description</h3>
                    <p style="line-height: 1.6; color: #666; font-size: 16px;">
                        <strong>Language:</strong> ${book.language || 'English'}<br>
                        <strong>Pages:</strong> ${book.pageNo || 'N/A'}<br>
                        <strong>Condition:</strong> Pre-owned<br><br>
                        ${book.otherInfo || "This book is part of a student-to-student exchange. It has been kept in good condition and is ready for its next owner."}
                    </p>
                </div>

                <div class="seller-badge">
                    <h3 style="margin: 0 0 15px 0; color: #4b2e1e; border-bottom: 1px solid #ffce99; padding-bottom: 8px;">Seller Details</h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <p style="margin: 0; font-size: 12px; color: #8b5e3c; text-transform: uppercase;">Sold by</p>
                            <p style="margin: 2px 0; font-size: 18px; font-weight: bold; color: #333;">${book.sellerName || "Anonymous Seller"}</p>
                        </div>
                        <div>
                            <p style="margin: 0; font-size: 12px; color: #8b5e3c; text-transform: uppercase;">Pickup Point</p>
                            <p style="margin: 2px 0; font-size: 18px; font-weight: bold; color: #333;">${book.location || 'Pune'}</p>
                        </div>
                    </div>

                    <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 10px;">
                        <p style="margin: 0; font-size: 16px; color: #444;">
                            <strong>Phone:</strong> ${book.contact}
                        </p>
                        <a href="https://wa.me/${(book.contact || '').replace(/\s+/g, '')}?text=Hi%20${book.sellerName},%20I'm%20interested%20in%20your%20book%20${book.bookName}" 
                           target="_blank" class="whatsapp-btn" style="text-align: center;">
                            Chat with ${book.sellerName || 'Seller'} on WhatsApp 💬
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

    // Modal Closing Logic
    if (closeProductModal) {
        closeProductModal.onclick = () => {
            productModal.style.display = "none";
            document.body.style.overflow = "auto";
        };
    }

    window.onclick = (event) => {
        if (event.target == productModal) {
            productModal.style.display = "none";
            document.body.style.overflow = "auto";
        }
    };

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
            image: bookData.image || "", 
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
