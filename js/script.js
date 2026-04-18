// File input handler
const fileInput = document.getElementById('picture');
const fileNameDisplay = document.getElementById('fileName');

fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        fileNameDisplay.textContent = this.files[0].name;
    } else {
        fileNameDisplay.textContent = 'No file selected';
    }
});

// Form submission
document.getElementById('bookListingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // You can send this data to your backend
    console.log('Book Listing Data:', data);
    alert('Book listing added successfully! (This is a demo)');
    
    // Reset form
    this.reset();
    fileNameDisplay.textContent = 'No file selected';
});

// Clear button handler
document.querySelector('.btn-clear').addEventListener('click', function() {
    fileNameDisplay.textContent = 'No file selected';
});

// Logout button
document.querySelector('.logout-btn').addEventListener('click', function() {
    if(confirm('Are you sure you want to logout?')) {
        // Redirect to login page
        window.location.href = 'login.html';
    }
});
