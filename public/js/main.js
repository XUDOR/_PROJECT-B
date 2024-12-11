document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-menu a');
    const loadingIndicator = document.querySelector('.loading');
    const jsonBundlesDiv = document.getElementById('bundle-contents');
    const refreshBundlesButton = document.getElementById('refresh-bundles-btn');
    const refreshUsersButton = document.getElementById('refresh-btn');
    const refreshJobsButton = document.getElementById('refresh-jobs-btn');
    const userContentsDiv = document.getElementById('db-contents');
    const jobContentsDiv = document.getElementById('job-contents');
    const resetButton = document.querySelector('.DB_RESET');

    // Function to fetch and display user data
    async function fetchUsers() {
        try {
            userContentsDiv.textContent = 'Loading...'; // Show loading state
            const response = await fetch('http://localhost:3002/api/users');
            if (!response.ok) throw new Error('Failed to fetch users.');

            const users = await response.json();

            userContentsDiv.innerHTML = ''; // Clear existing content

            if (users.length === 0) {
                userContentsDiv.textContent = 'No users available.';
                return;
            }

            // Loop through users and create a styled div for each row
            users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.classList.add('user-row'); // Add a class for styling

                userDiv.innerHTML = `
                    <h3>${user.name}</h3>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> ${user.address || 'N/A'}</p>
                    <p><strong>Location:</strong> ${user.location || 'N/A'}</p>
                    <p><strong>Skills:</strong> ${user.skills ? user.skills.join(', ') : 'N/A'}</p>
                    <p><strong>Profile Summary:</strong> ${user.profile_summary || 'N/A'}</p>
                    <p><strong>Created At:</strong> ${new Date(user.created_at).toLocaleString()}</p>
                `;

                userContentsDiv.appendChild(userDiv);
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            userContentsDiv.textContent = 'Failed to load users.';
        }
    }

    // Function to fetch and display job data
    async function fetchJobs() {
        try {
            jobContentsDiv.textContent = 'Loading...'; // Show loading state
            const response = await fetch('http://localhost:3002/api/jobs');
            if (!response.ok) throw new Error('Failed to fetch jobs.');

            const jobs = await response.json();

            jobContentsDiv.innerHTML = ''; // Clear existing content

            if (jobs.length === 0) {
                jobContentsDiv.textContent = 'No jobs available.';
                return;
            }

            // Loop through jobs and create a styled div for each row
            jobs.forEach(job => {
                const jobDiv = document.createElement('div');
                jobDiv.classList.add('job-row'); // Reusing the same styling class

                jobDiv.innerHTML = `
                    <h3>${job.job_title}</h3>
                    <p><strong>Company:</strong> ${job.company_name}</p>
                    <p><strong>Location:</strong> ${job.location || 'N/A'}</p>
                    <p><strong>Skills:</strong> ${job.skills_required ? job.skills_required.join(', ') : 'N/A'}</p>
                    <p><strong>Description:</strong> ${job.job_description || 'N/A'}</p>
                    <p><strong>Posted At:</strong> ${new Date(job.created_at).toLocaleString()}</p>
                `;

                jobContentsDiv.appendChild(jobDiv);
            });
        } catch (error) {
            console.error('Error fetching jobs:', error);
            jobContentsDiv.textContent = 'Failed to load jobs.';
        }
    }

// Function to fetch and display JSON bundles
async function fetchJsonBundles() {
    try {
        jsonBundlesDiv.textContent = 'Loading...'; // Show loading state
        const response = await fetch('http://localhost:3002/api/json-bundles');
        if (!response.ok) throw new Error('Failed to fetch JSON bundles.');

        const bundles = await response.json();

        jsonBundlesDiv.innerHTML = ''; // Clear existing content

        if (bundles.length === 0) {
            jsonBundlesDiv.textContent = 'No JSON bundles available.';
            return;
        }

        // Loop through bundles and create a styled div for each entry
        bundles.forEach(bundle => {
            const bundleDiv = document.createElement('div');
            bundleDiv.classList.add('bundle-row');

            bundleDiv.innerHTML = `
                <pre>${JSON.stringify(bundle, null, 2)}</pre>
                <p><strong>Created At:</strong> ${new Date(bundle.created_at).toLocaleString()}</p>
            `;

            jsonBundlesDiv.appendChild(bundleDiv);
        });
    } catch (error) {
        console.error('Error fetching JSON bundles:', error);
        jsonBundlesDiv.textContent = 'Failed to load JSON bundles.';
    }
}

    // Function to reset the database
    resetButton.addEventListener('click', async () => {
        const password = prompt('Enter the password to reset the database:');
    
        if (!password) {
            alert('Password is required to reset the database.');
            return;
        }
    
        if (confirm('Are you sure you want to reset the database? This action cannot be undone.')) {
            try {
                const response = await fetch('/api/reset-database', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password }),
                });
    
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    console.log(result.message);
                    // Optionally refresh the page to reflect changes
                    location.reload();
                } else {
                    alert(`Error: ${result.error}`);
                    console.error(result.error);
                }
            } catch (error) {
                console.error('Error resetting database:', error);
                alert('Failed to reset the database.');
            }
        }
    });
    

    // Attach event listeners to refresh buttons
    refreshBundlesButton.addEventListener('click', fetchJsonBundles);
    refreshUsersButton.addEventListener('click', fetchUsers);
    refreshJobsButton.addEventListener('click', fetchJobs);

    // Navigation handling
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
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
    }

    // Responsive handling
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            console.log('Window resized - layout adjusted');
        }, 250);
    });

    // Initial fetch on page load
    fetchJsonBundles();
    fetchUsers();
    fetchJobs();
});
