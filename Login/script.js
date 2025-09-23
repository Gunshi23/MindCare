// Your Firebase configuration - Updated to use Realtime Database
        const firebaseConfig = {
            apiKey: "AIzaSyCf0R6MzfRgfZiSc07ZUPgA1e5saL_LbG8",
            authDomain: "mindcare-sih-c28d9.firebaseapp.com",
            databaseURL: "https://mindcare-sih-c28d9-default-rtdb.firebaseio.com",
            projectId: "mindcare-sih-c28d9",
            storageBucket: "mindcare-sih-c28d9.firebasestorage.app",
            messagingSenderId: "144494054630",
            appId: "1:144494054630:web:f67581a9466b9b27e97f27"
        };

        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        const auth = firebase.auth();
        const database = firebase.database();

        let currentUser = null;

        // Utility Functions
        function showStatus(message, type = 'success') {
            const container = document.getElementById('status-container');
            container.innerHTML = `<div class="status-message ${type}">${message}</div>`;
            setTimeout(() => container.innerHTML = '', 4000);
        }

        function switchForm(formId) {
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');

            if (formId === 'signup') {
                loginForm.classList.remove('active');
                setTimeout(() => signupForm.classList.add('active'), 100);
            } else {
                signupForm.classList.remove('active');
                setTimeout(() => loginForm.classList.add('active'), 100);
            }
        }

        // Event listeners for switching forms
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('signup');
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('login');
        });

        // Enhanced Mode toggle functionality with icons
        const modeToggle = document.getElementById('mode-toggle');
        const modeIcon = document.getElementById('mode-icon');

        modeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            // Update icon based on mode
            if (document.body.classList.contains('dark-mode')) {
                modeIcon.textContent = '🌙';
                modeToggle.title = 'Switch to Light Mode';
            } else {
                modeIcon.textContent = '☀️';
                modeToggle.title = 'Switch to Dark Mode';
            }
        });

        // Get permissions by role
        function getPermissionsByRole(role) {
            const permissions = {
                patient: {
                    canRead: ['own_profile', 'own_mental_health_data'],
                    canWrite: ['own_profile', 'own_mental_health_data'],
                    dashboard: 'patient_dashboard'
                },
                therapist: {
                    canRead: ['assigned_patients', 'patient_summaries'],
                    canWrite: ['patient_notes', 'treatment_plans'],
                    dashboard: 'therapist_dashboard'
                },
                admin: {
                    canRead: ['all_users', 'system_analytics'],
                    canWrite: ['user_permissions', 'system_settings'],
                    dashboard: 'admin_dashboard'
                }
            };
            return permissions[role] || permissions.patient;
        }

        // Sign Up handler with Realtime Database
        document.getElementById('create-account-button').addEventListener('click', async (e) => {
            e.preventDefault();

            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const role = document.getElementById('signup-role').value;
            const college = document.getElementById('signup-college').value.trim();
            const year = document.getElementById('signup-year').value;
            const dept = document.getElementById('signup-dept').value.trim();

            // Validation
            if (!name || !email || !password || !college || !year || !dept) {
                showStatus('Please fill in all required fields', 'error');
                return;
            }

            if (password.length < 6) {
                showStatus('Password must be at least 6 characters', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showStatus('Passwords do not match', 'error');
                return;
            }

            try {
                document.getElementById('create-account-button').disabled = true;
                showStatus('Creating your account...', 'warning');

                // Create user account
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Save user data to Realtime Database
                const userData = {
                    uid: user.uid,
                    name: name,
                    email: email,
                    role: role,
                    college: college,
                    year: year,
                    department: dept,
                    emailVerified: true, // Skip verification for development
                    createdAt: firebase.database.ServerValue.TIMESTAMP,
                    lastLogin: firebase.database.ServerValue.TIMESTAMP,
                    permissions: getPermissionsByRole(role),
                    profile: {
                        isActive: true,
                        profileComplete: true
                    }
                };

                await database.ref(`users/${user.uid}`).set(userData);

                // Initialize mental health data structure
                await database.ref(`mentalHealth/${user.uid}`).set({
                    initialized: true,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });

                // Store user session and redirect to dashboard
                setTimeout(() => {
                    showStatus('Redirecting to dashboard...', 'warning');
                    window.location.href = '/Dashboard/dashboard.html';
                }, 1000);

            } catch (error) {
                console.error('Signup error:', error);
                showStatus(`Error: ${error.message}`, 'error');
            } finally {
                document.getElementById('create-account-button').disabled = false;
            }
        });

        // Sign In handler
        document.getElementById('sign-in-button').addEventListener('click', async (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showStatus('Please enter both email and password', 'error');
                return;
            }

            try {
                document.getElementById('sign-in-button').disabled = true;
                showStatus('Signing you in...', 'warning');

                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                // Check if user exists in database
                const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
                const userData = userSnapshot.val();

                if (!userData) {
                    showStatus('User profile not found. Please contact support.', 'error');
                    await auth.signOut();
                    return;
                }

                // Update last login
                await database.ref(`users/${user.uid}/lastLogin`).set(firebase.database.ServerValue.TIMESTAMP);

                showStatus('Welcome back!', 'success');

                // Store user data in sessionStorage for dashboard access
                sessionStorage.setItem('currentUser', JSON.stringify({
                    uid: user.uid,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    college: userData.college,
                    year: userData.year,
                    department: userData.department
                }));

                // Redirect to dashboard after successful login
                setTimeout(() => {
                    showStatus('Redirecting to dashboard...', 'warning');
                    window.location.href = '/Dashboard/dashboard.html';
                }, 1500);

            } catch (error) {
                console.error('Login error:', error);
                showStatus(`Error: ${error.message}`, 'error');
            } finally {
                document.getElementById('sign-in-button').disabled = false;
            }
        });

        // Auth state listener
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                console.log('User logged in:', user.uid);
                
                try {
                    // Get user data from database
                    const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
                    const userData = userSnapshot.val();
                    
                    if (userData) {
                        console.log('User data loaded:', userData.name);
                    }
                } catch (error) {
                    console.error('Error loading user data:', error);
                }
            } else {
                currentUser = null;
                console.log('User logged out');
            }
        });

        console.log('MindCare Firebase Authentication initialized');