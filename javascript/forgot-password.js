        // DOM Elements
        const steps = document.querySelectorAll('.form-step');
        const stepButtons = document.querySelectorAll('.step');
        const step1Button = document.getElementById('step1Button');
        const step2Button = document.getElementById('step2Button');
        const step3Button = document.getElementById('step3Button');
        const step4Button = document.getElementById('step4Button');
        const backToStep1 = document.getElementById('backToStep1');
        const backToStep2 = document.getElementById('backToStep2');
        const backToStep3 = document.getElementById('backToStep3');
        const resendCode = document.getElementById('resendCode');
        const emailMethod = document.getElementById('emailMethod');
        const phoneMethod = document.getElementById('phoneMethod');
        const contactLabel = document.getElementById('contactLabel');
        const contactInput = document.getElementById('contact');
        const contactMethod = document.getElementById('contactMethod');
        const otpInputs = document.querySelectorAll('.otp-input');
        const companySelect = document.getElementById('company');
        
        // Current step tracker
        let currentStep = 1;
        
        // Show a specific step
        function showStep(stepNumber) {
            steps.forEach(step => step.classList.remove('active'));
            document.getElementById(`step${stepNumber}`).classList.add('active');
            
            stepButtons.forEach((button, index) => {
                if (index + 1 <= stepNumber) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
            
            currentStep = stepNumber;
        }
        
        // Step navigation
        step1Button.addEventListener('click', function() {
            if (companySelect.value === '') {
                showError(companySelect, document.getElementById('company-error'), 'Please select your company account');
                return;
            }
            
            showSuccess(companySelect, document.getElementById('company-error'));
            showStep(2);
        });
        
        step2Button.addEventListener('click', function() {
            const contactValue = contactInput.value.trim();
            let isValid = false;
            
            if (emailMethod.classList.contains('selected')) {
                isValid = isValidEmail(contactValue);
                if (!isValid) {
                    showError(contactInput, document.getElementById('contact-error'), 'Please enter a valid email address');
                    return;
                }
            } else {
                isValid = isValidPhone(contactValue);
                if (!isValid) {
                    showError(contactInput, document.getElementById('contact-error'), 'Please enter a valid 11-digit phone number');
                    return;
                }
            }
            
            showSuccess(contactInput, document.getElementById('contact-error'));
            
            // Show notification
            showNotification('info', 'Verification Code Sent', `We've sent a 6-digit code to your ${emailMethod.classList.contains('selected') ? 'email' : 'phone'}`, 5000);
            
            // Update contact method text
            contactMethod.textContent = emailMethod.classList.contains('selected') ? 'email' : 'phone';
            
            showStep(3);
        });
        
        step3Button.addEventListener('click', function() {
            let otpCode = '';
            otpInputs.forEach(input => {
                otpCode += input.value;
            });
            
            if (otpCode.length !== 6) {
                showError(otpInputs[0], document.getElementById('otp-error'), 'Please enter a valid 6-digit code');
                return;
            }
            
            // In a real app, you would verify the OTP with your backend
            // For demo purposes, we'll assume it's correct if it's 123456
            if (otpCode !== '123456') {
                showError(otpInputs[0], document.getElementById('otp-error'), 'Invalid verification code. Please try again.');
                return;
            }
            
            showSuccess(otpInputs[0], document.getElementById('otp-error'));
            showStep(4);
        });
        
        step4Button.addEventListener('click', function() {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!isValidPassword(newPassword)) {
                showError(document.getElementById('newPassword'), document.getElementById('newPassword-error'), 'Password must be at least 8 characters with letters and numbers');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showError(document.getElementById('confirmPassword'), document.getElementById('confirmPassword-error'), 'Passwords do not match');
                return;
            }
            
            // Show success notification
            showNotification('success', 'Password Reset Successful', 'Your password has been reset successfully. You can now login with your new password.', 5000);
            
            // Redirect to login page after a delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        });
        
        // Back navigation
        backToStep1.addEventListener('click', function(e) {
            e.preventDefault();
            showStep(1);
        });
        
        backToStep2.addEventListener('click', function(e) {
            e.preventDefault();
            showStep(2);
        });
        
        backToStep3.addEventListener('click', function(e) {
            e.preventDefault();
            showStep(3);
        });
        
        // Resend code
        resendCode.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('info', 'Code Resent', 'A new verification code has been sent to your ' + (emailMethod.classList.contains('selected') ? 'email' : 'phone'), 5000);
        });
        
        // Delivery method selection
        emailMethod.addEventListener('click', function() {
            emailMethod.classList.add('selected');
            phoneMethod.classList.remove('selected');
            contactLabel.textContent = 'Email Address';
            contactInput.placeholder = 'Enter your email address';
            contactInput.type = 'text';
            contactInput.value = '';
        });
        
        phoneMethod.addEventListener('click', function() {
            phoneMethod.classList.add('selected');
            emailMethod.classList.remove('selected');
            contactLabel.textContent = 'Phone Number';
            contactInput.placeholder = 'Enter your phone number';
            contactInput.type = 'tel';
            contactInput.value = '';
        });
        
        // Set default selection
        emailMethod.classList.add('selected');
        
        // OTP input handling
        otpInputs.forEach(input => {
            input.addEventListener('input', function() {
                const value = this.value;
                const index = parseInt(this.getAttribute('data-index'));
                
                if (value.length === 1 && index < 6) {
                    otpInputs[index].focus();
                }
                
                // Clear error when typing
                if (value.length > 0) {
                    showSuccess(this, document.getElementById('otp-error'));
                }
            });
            
            input.addEventListener('keydown', function(e) {
                const index = parseInt(this.getAttribute('data-index'));
                
                if (e.key === 'Backspace' && this.value === '' && index > 1) {
                    otpInputs[index - 2].focus();
                }
            });
        });
        
        // Password visibility toggle
        document.getElementById('toggleNewPassword').addEventListener('click', function() {
            const passwordInput = document.getElementById('newPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
        
        document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
            const passwordInput = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
        
        // Validation functions
        function isValidEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        function isValidPhone(phone) {
            const re = /^\d{11}$/;
            return re.test(phone);
        }
        
        function isValidPassword(password) {
            // At least 8 characters with letters and numbers
            const re = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
            return re.test(password);
        }
        
        // Show error state
        function showError(input, errorElement, message) {
            input.classList.remove('success');
            input.classList.add('error');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        // Show success state
        function showSuccess(input, errorElement) {
            input.classList.remove('error');
            input.classList.add('success');
            errorElement.style.display = 'none';
        }
        
        // Custom notification
        const notification = document.getElementById('customNotification');
        const notificationTitle = document.getElementById('notificationTitle');
        const notificationMessage = document.getElementById('notificationMessage');
        const notificationClose = document.getElementById('notificationClose');
        
        function showNotification(type, title, message, duration = 5000) {
            // Remove previous classes
            notification.classList.remove('notification-info', 'notification-warning', 'notification-error', 'notification-success');
            
            // Add appropriate class based on type
            notification.classList.add(`notification-${type}`);
            
            // Set title and message
            notificationTitle.textContent = title;
            notificationMessage.textContent = message;
            
            // Show notification
            notification.classList.add('show');
            
            // Auto hide after duration
            setTimeout(() => {
                hideNotification();
            }, duration);
        }
        
        function hideNotification() {
            notification.classList.remove('show');
        }
        
        notificationClose.addEventListener('click', hideNotification);
        
        // Initialize with a demo notification after page load
        setTimeout(() => {
            showNotification('info', 'Forgot Password?', 'Enter your company account details to reset your password', 5000);
        }, 1000);
