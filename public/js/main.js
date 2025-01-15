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
    const accountsDiv = document.getElementById('account-contents');
    const refreshAccountsButton = document.getElementById('refresh-accounts-btn');
    const resetButton = document.querySelector('.DB_RESET');
    const pingStatusDiv = document.getElementById('ping-status');

    // Function to Ping the Server and Update Status
    async function pingServer() {
        try {
            const response = await fetch('http://localhost:3002/api/ping');
            if (!response.ok) throw new Error('Ping failed');

            const result = await response.json();
            if (result.status === 'OK') {
                pingStatusDiv.textContent = `Ping: ${result.message}`;
                pingStatusDiv.classList.add('success'); // Green background
                pingStatusDiv.classList.remove('error'); // Remove red background
            } else {
                throw new Error('Unexpected response');
            }
        } catch (error) {
            pingStatusDiv.textContent = 'Ping: Failed to connect';
            pingStatusDiv.classList.add('error'); // Red background
            pingStatusDiv.classList.remove('success'); // Remove green background
            console.error('Error pinging server:', error);
        }
    }

    // Call Ping Server on Page Load and Set Interval
    pingServer();
    setInterval(pingServer, 30000); // Ping every 30 seconds

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

            users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.classList.add('user-row');

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

            jobs.forEach(job => {
                const jobDiv = document.createElement('div');
                jobDiv.classList.add('job-row');

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
                <pre class="bundle-content">${JSON.stringify(bundle, null, 2)}</pre>
                <p class="bundle-timestamp">
        <span class="timestamp-label">Created At:</span>
        <span class="timestamp-value">${new Date(bundle.created_at).toLocaleString()}</span>
    </p>
            `;

                jsonBundlesDiv.appendChild(bundleDiv);
            });
        } catch (error) {
            console.error('Error fetching JSON bundles:', error);
            jsonBundlesDiv.textContent = 'Failed to load JSON bundles.';
        }
    }

// Function to fetch and display Accounts

    async function fetchAccounts() {
        try {
            showLoading();
            const response = await fetch('http://localhost:3002/api/accounts');
            if (!response.ok) throw new Error('Failed to fetch accounts');
    
            const accounts = await response.json();
            accountsDiv.innerHTML = ''; // Clear existing content
    
            if (accounts.length === 0) {
                accountsDiv.textContent = 'No accounts available.';
                return;
            }
    
            accounts.forEach(account => {
                const accountDiv = document.createElement('div');
                accountDiv.classList.add('bundle-row');
                accountDiv.innerHTML = `
                    <div class="bundle-content">
                        <h3>${account.username}</h3>
                        <p><strong>Email:</strong> ${account.email}</p>
                        <p><strong>Account Type:</strong> ${account.account_type}</p>
                        <p><strong>Status:</strong> ${account.is_active ? 'Active' : 'Inactive'}</p>
                        <div class="bundle-timestamp">
                            <span class="timestamp-label">Created:</span>
                            <span class="timestamp-value">${new Date(account.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                `;
                accountsDiv.appendChild(accountDiv);
            });
    
            hideLoading();
        } catch (error) {
            console.error('Error fetching accounts:', error.message);
            accountsDiv.textContent = 'Failed to load accounts.';
            hideLoading();
        }
    }    


//==========================================================================================================


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
    if (refreshAccountsButton) {
        refreshAccountsButton.addEventListener('click', fetchAccounts);
    }

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
    fetchAccounts(); // Load accounts on page load
});
