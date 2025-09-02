         // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Change the eye icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
        
        // Custom notification system
        const customNotification = document.getElementById('customNotification');
        const notificationTitle = document.getElementById('notificationTitle');
        const notificationMessage = document.getElementById('notificationMessage');
        const notificationClose = document.getElementById('notificationClose');
        
        function showNotification(type, title, message, duration = 5000) {
            // Set notification content
            notificationTitle.textContent = title;
            notificationMessage.textContent = message;
            
            // Set notification type (color)
            customNotification.className = 'custom-notification';
            customNotification.classList.add(`notification-${type}`);
            
            // Show notification
            customNotification.classList.add('show');
            
            // Auto hide after duration
            setTimeout(() => {
                hideNotification();
            }, duration);
        }
        
        function hideNotification() {
            customNotification.classList.remove('show');
        }
        
        notificationClose.addEventListener('click', hideNotification);

        // Form validation
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const emailError = document.getElementById('email-error');
        const passwordError = document.getElementById('password-error');
        const loginButton = document.getElementById('loginButton');
        
        // Email validation
        function isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        // Phone validation - exactly 11 digits
        function isValidPhone(phone) {
            const re = /^[0-9]{11}$/;
            return re.test(phone.replace(/[\s\-\(\)]/g, ''));
        }
        
        // Password validation (minimum 8 chars, alphanumeric)
        function isValidPassword(password) {
            const re = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
            return re.test(password);
        }
        
        // Show error function
        function showError(input, errorElement, message) {
            input.classList.remove('success');
            input.classList.add('error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        // Show success function
        function showSuccess(input, errorElement) {
            input.classList.remove('error');
            input.classList.add('success');
            errorElement.style.display = 'none';
        }
        
        // Validate email/phone on blur
        emailInput.addEventListener('blur', function() {
            const value = this.value.trim();
            
            if (value === '') {
                showError(this, emailError, 'Email or phone number is required');
            } else if (value.includes('@') && !isValidEmail(value)) {
                showError(this, emailError, 'Please enter a valid email address');
            } else if (!value.includes('@') && !isValidPhone(value)) {
                showError(this, emailError, 'Please enter a valid 11-digit phone number');
            } else {
                showSuccess(this, emailError);
            }
        });
        
        // Validate password on blur
        passwordInput.addEventListener('blur', function() {
            const value = this.value;
            
            if (value === '') {
                showError(this, passwordError, 'Password is required');
            } else if (!isValidPassword(value)) {
                showError(this, passwordError, 'Password must be at least 8 characters with letters and numbers');
            } else {
                showSuccess(this, passwordError);
            }
        });
        
        // Handle form submission
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Trigger validation
            emailInput.dispatchEvent(new Event('blur'));
            passwordInput.dispatchEvent(new Event('blur'));
            
            // Check if form is valid
            const emailValid = !emailInput.classList.contains('error') && emailInput.value.trim() !== '';
            const passwordValid = !passwordInput.classList.contains('error') && passwordInput.value !== '';
            
            if (emailValid && passwordValid) {
                // Simulate API call to check if email has multiple accounts
                const email = emailInput.value.trim();
                const password = passwordInput.value;
                
                // Check for specific demo credentials
                if (email === 'safwan110817@gmail.com'   && password === 'Saim@2005') {
                    // Show account selection modal for demo account
                    const accounts = [
                        { id: 1, company: 'Safwan Corporation', email: email },
                        { id: 2, company: 'Saim Vondami Enterprises', email: email },
                        { id: 3, company: 'Safwan & Co.', email: email }
                    ];
                    showAccountSelection(accounts);
                } 
                else {
                    // For other accounts, redirect directly to OTP
                    window.location.href = 'login-otp.html';
                }
            } else {
                // Show error notification if form is invalid
                if (!emailValid) {
                    showError(emailInput, emailError, 'Please enter a valid email or 11-digit phone number');
                }
                if (!passwordValid) {
                    showError(passwordInput, passwordError, 'Password must be at least 8 characters with letters and numbers');
                }
                showNotification('error', 'Authentication failed', 'Please enter a valid email, phone number, and a password that is at least 8 characters long.');
            }
        });
        
        // Function to show account selection modal
        function showAccountSelection(accounts) {
            const modal = document.getElementById('accountSelectionModal');
            const accountList = document.getElementById('accountList');
            
            // Clear previous list
            accountList.innerHTML = '';
            
            // Populate account list
            accounts.forEach(account => {
                const accountItem = document.createElement('div');
                accountItem.className = 'account-item';
                accountItem.innerHTML = `
                    <div class="account-name">${account.company}</div>
                    <div class="account-email">${account.email}</div>
                `;
                
                accountItem.addEventListener('click', () => {
                    // Store selected account (you might want to use a more secure method)
                    localStorage.setItem('selectedAccount', JSON.stringify(account));
                    hideAccountSelection();
                    window.location.href = 'login-otp.html';
                });
                
                accountList.appendChild(accountItem);
            });
            
            // Show modal
            modal.classList.add('show');
        }
        
        // Function to hide account selection modal
        function hideAccountSelection() {
            const modal = document.getElementById('accountSelectionModal');
            modal.classList.remove('show');
        }
        
        // Close modal when close button is clicked
        document.getElementById('modalClose').addEventListener('click', hideAccountSelection);
        
        // Social login buttons - show custom notification
        document.getElementById('googleLogin').addEventListener('click', function() {
            showNotification('warning', 'Under Development', 'Google login is currently under development. Please Create Account.', 4000);
        });
        
        document.getElementById('microsoftLogin').addEventListener('click', function() {
            showNotification('warning', 'Under Development', 'Microsoft login is currently under development. Please Create Account.', 4000);
        });
