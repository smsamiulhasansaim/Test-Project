        // DOM Elements
        const steps = document.querySelectorAll('.step');
        const formSteps = document.querySelectorAll('.form-step');
        const progressBar = document.getElementById('progressBar');
        const nextToStep2 = document.getElementById('nextToStep2');
        const nextToStep3 = document.getElementById('nextToStep3');
        const prevToStep1 = document.getElementById('prevToStep1');
        const prevToStep2 = document.getElementById('prevToStep2');
        const createAccountButton = document.getElementById('createAccountButton');
        
        // Form Fields
        const fullNameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        const companyInput = document.getElementById('company');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const termsCheckbox = document.getElementById('terms');
        
        // Error Messages
        const fullNameError = document.getElementById('fullName-error');
        const emailError = document.getElementById('email-error');
        const phoneError = document.getElementById('phone-error');
        const companyError = document.getElementById('company-error');
        const passwordError = document.getElementById('password-error');
        const confirmPasswordError = document.getElementById('confirmPassword-error');
        const termsError = document.getElementById('terms-error');
        
        // Notification elements
        const customNotification = document.getElementById('customNotification');
        const notificationTitle = document.getElementById('notificationTitle');
        const notificationMessage = document.getElementById('notificationMessage');
        const notificationClose = document.getElementById('notificationClose');
        
        // Loader element
        const loaderContainer = document.getElementById('loaderContainer');
        
        // Current step
        let currentStep = 1;
        
        // Track if validation has been triggered for each field
        const validationTriggered = {
            fullName: false,
            email: false,
            phone: false,
            company: false,
            password: false,
            confirmPassword: false
        };
        
        // Update progress bar
        function updateProgressBar() {
            const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            
            // Update steps
            steps.forEach((step, index) => {
                if (index + 1 < currentStep) {
                    step.classList.remove('active');
                    step.classList.add('completed');
                } else if (index + 1 === currentStep) {
                    step.classList.add('active');
                    step.classList.remove('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
        }
        
        // Navigate to step
        function goToStep(stepNumber) {
            formSteps.forEach(formStep => formStep.classList.remove('active'));
            document.getElementById(`formStep${stepNumber}`).classList.add('active');
            currentStep = stepNumber;
            updateProgressBar();
        }
        
        // Show notification
        function showNotification(type, title, message, duration = 3000) {
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
        
        // Hide notification
        function hideNotification() {
            customNotification.classList.remove('show');
        }
        
        // Show loader
        function showLoader() {
            loaderContainer.classList.add('show');
        }
        
        // Hide loader
        function hideLoader() {
            loaderContainer.classList.remove('show');
        }
        
        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
        
        document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
        
        // Close notification when close button is clicked
        notificationClose.addEventListener('click', hideNotification);
        
        // Validation functions
        function isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        function isValidPhone(phone) {
            const re = /^[0-9]{11}$/;
            return re.test(phone.replace(/[\s\-\(\)]/g, ''));
        }
        
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
        
        // Validate step 1
        function validateStep1() {
            let isValid = true;
            
            // Validate full name
            if (fullNameInput.value.trim() === '') {
                showError(fullNameInput, fullNameError, 'Full name is required');
                isValid = false;
            } else {
                showSuccess(fullNameInput, fullNameError);
            }
            
            // Validate email
            if (emailInput.value.trim() === '') {
                showError(emailInput, emailError, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(emailInput.value.trim())) {
                showError(emailInput, emailError, 'Please enter a valid email address');
                isValid = false;
            } else {
                showSuccess(emailInput, emailError);
            }
            
            // Validate phone
            if (phoneInput.value.trim() === '') {
                showError(phoneInput, phoneError, 'Phone number is required');
                isValid = false;
            } else if (!isValidPhone(phoneInput.value.trim())) {
                showError(phoneInput, phoneError, 'Please enter a valid 11-digit phone number');
                isValid = false;
            } else {
                showSuccess(phoneInput, phoneError);
            }
            
            // Validate company
            if (companyInput.value.trim() === '') {
                showError(companyInput, companyError, 'Company name is required');
                isValid = false;
            } else {
                showSuccess(companyInput, companyError);
            }
            
            return isValid;
        }
        
        // Validate step 2
        function validateStep2() {
            let isValid = true;
            
            // Validate password
            if (passwordInput.value === '') {
                showError(passwordInput, passwordError, 'Password is required');
                isValid = false;
            } else if (!isValidPassword(passwordInput.value)) {
                showError(passwordInput, passwordError, 'Password must be at least 8 characters with letters and numbers');
                isValid = false;
            } else {
                showSuccess(passwordInput, passwordError);
            }
            
            // Validate confirm password
            if (confirmPasswordInput.value === '') {
                showError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
                isValid = false;
            } else if (confirmPasswordInput.value !== passwordInput.value) {
                showError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
                isValid = false;
            } else {
                showSuccess(confirmPasswordInput, confirmPasswordError);
            }
            
            return isValid;
        }
        
        // Validate step 3
        function validateStep3() {
            if (!termsCheckbox.checked) {
                termsError.style.display = 'block';
                return false;
            } else {
                termsError.style.display = 'none';
                return true;
            }
        }
        
        // Check if all fields in step 1 are valid
        function isStep1Valid() {
            return fullNameInput.value.trim() !== '' && 
                   isValidEmail(emailInput.value.trim()) && 
                   isValidPhone(phoneInput.value.trim()) && 
                   companyInput.value.trim() !== '';
        }
        
        // Check if all fields in step 2 are valid
        function isStep2Valid() {
            return isValidPassword(passwordInput.value) && 
                   confirmPasswordInput.value === passwordInput.value;
        }
        
        // Update next button state based on validation
        function updateNextButtonState() {
            if (currentStep === 1) {
                nextToStep2.disabled = !isStep1Valid();
            } else if (currentStep === 2) {
                nextToStep3.disabled = !isStep2Valid();
            } else if (currentStep === 3) {
                createAccountButton.disabled = !termsCheckbox.checked;
            }
        }
        
        // Navigation event listeners
        nextToStep2.addEventListener('click', () => {
            if (validateStep1()) {
                goToStep(2);
            }
        });
        
        nextToStep3.addEventListener('click', () => {
            if (validateStep2()) {
                goToStep(3);
            }
        });
        
        prevToStep1.addEventListener('click', () => goToStep(1));
        prevToStep2.addEventListener('click', () => goToStep(2));
        
        // Create account button
        createAccountButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (validateStep3()) {
                // Show loader
                showLoader();
                
                // Simulate account creation process
                setTimeout(() => {
                    // Hide loader
                    hideLoader();
                    
                    // Show success message
                    showNotification('success', 'Success!', 'Account created successfully', 2000);
                    
                    // Redirect to login page after a delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }, 2000);
            }
        });
        
        // Real-time validation for better UX
        function setupInputValidation(input, errorElement, validationFn, errorMessage, successMessage, fieldName) {
            input.addEventListener('blur', () => {
                validationTriggered[fieldName] = true;
                
                if (input.value.trim() === '') {
                    showError(input, errorElement, errorMessage);
                    showNotification('error', 'Error', errorMessage, 2000);
                } else if (!validationFn(input.value.trim())) {
                    showError(input, errorElement, errorMessage);
                    showNotification('error', 'Error', errorMessage, 2000);
                } else {
                    showSuccess(input, errorElement);
                    showNotification('success', 'Perfect!', successMessage, 2000);
                }
                
                updateNextButtonState();
            });
            
            input.addEventListener('input', () => {
                if (validationTriggered[fieldName]) {
                    if (input.value.trim() === '') {
                        showError(input, errorElement, errorMessage);
                    } else if (!validationFn(input.value.trim())) {
                        showError(input, errorElement, errorMessage);
                    } else {
                        showSuccess(input, errorElement);
                    }
                    
                    updateNextButtonState();
                }
            });
        }
        
        // Setup validation for each field
        setupInputValidation(
            fullNameInput, 
            fullNameError, 
            (value) => value !== '', 
            'Full name is required',
            'Name is valid',
            'fullName'
        );
        
        setupInputValidation(
            emailInput, 
            emailError, 
            isValidEmail, 
            'Please enter a valid email address',
            'Email is valid',
            'email'
        );
        
        setupInputValidation(
            phoneInput, 
            phoneError, 
            isValidPhone, 
            'Please enter a valid 11-digit phone number',
            'Phone number is valid',
            'phone'
        );
        
        setupInputValidation(
            companyInput, 
            companyError, 
            (value) => value !== '', 
            'Company name is required',
            'Company name is valid',
            'company'
        );
        
        setupInputValidation(
            passwordInput, 
            passwordError, 
            isValidPassword, 
            'Password must be at least 8 characters with letters and numbers',
            'Password is strong',
            'password'
        );
        
        // Special validation for confirm password
        confirmPasswordInput.addEventListener('blur', () => {
            validationTriggered.confirmPassword = true;
            
            if (confirmPasswordInput.value === '') {
                showError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
                showNotification('error', 'Error', 'Please confirm your password', 2000);
            } else if (confirmPasswordInput.value !== passwordInput.value) {
                showError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
                showNotification('error', 'Error', 'Passwords do not match', 2000);
            } else {
                showSuccess(confirmPasswordInput, confirmPasswordError);
                showNotification('success', 'Perfect!', 'Passwords match', 2000);
            }
            
            updateNextButtonState();
        });
        
        confirmPasswordInput.addEventListener('input', () => {
            if (validationTriggered.confirmPassword) {
                if (confirmPasswordInput.value === '') {
                    showError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
                } else if (confirmPasswordInput.value !== passwordInput.value) {
                    showError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
                } else {
                    showSuccess(confirmPasswordInput, confirmPasswordError);
                }
                
                updateNextButtonState();
            }
        });
        
        // Terms checkbox validation
        termsCheckbox.addEventListener('change', () => {
            updateNextButtonState();
        });
        
        // Initialize progress bar
        updateProgressBar();
