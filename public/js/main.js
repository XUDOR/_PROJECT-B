document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-menu a');
    const loadingIndicator = document.querySelector('.loading');
    const refreshButton = document.getElementById('refresh-btn');
    const dbContentsDiv = document.getElementById('db-contents');

    // Function to fetch and display user data
    async function fetchUsers() {
        try {
            dbContentsDiv.textContent = 'Loading...'; // Show loading state
            const response = await fetch('http://localhost:3002/api/users');

            const users = await response.json();

            // Build HTML content
            let content = '<ul>';
            users.forEach(user => {
                content += `<li>${user.id}: ${user.name} (${user.email})</li>`;
            });
            content += '</ul>';

            // Update the DBContents div
            dbContentsDiv.innerHTML = content;
        } catch (error) {
            console.error('Error fetching users:', error);
            dbContentsDiv.textContent = 'Failed to load data.';
        }
    }

    // Attach event listener to the Refresh button
    refreshButton.addEventListener('click', fetchUsers);

    // Navigation handling
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            handleNavigation(section);
        });
    });

    // Handle navigation with loading state
    function handleNavigation(section) {
        showLoading();

        // Simulate API call or page load
        setTimeout(() => {
            hideLoading();
            updateContent(section);
        }, 1000);
    }

    // Loading state functions
    function showLoading() {
        loadingIndicator.style.display = 'block';
    }

    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }

    // Update content based on section
    function updateContent(section) {
        console.log(`Navigating to ${section}`);
        // Here you would typically update the page content
        // based on the selected section
    }

    // Responsive handling
    let resizeTimer;
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Handle any responsive adjustments here
            console.log('Window resized - layout adjusted');
        }, 250);
    });
});
