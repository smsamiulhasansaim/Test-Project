// DOM Elements
const loginSection = document.getElementById('loginSection');
const otpSection = document.getElementById('otpSection');
const loginButton = document.getElementById('loginButton');
const verifyButton = document.getElementById('verifyButton');
const backToLogin = document.getElementById('backToLogin');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const otpError = document.getElementById('otp-error');
const customNotification = document.getElementById('customNotification');
const notificationTitle = document.getElementById('notificationTitle');
const notificationMessage = document.getElementById('notificationMessage');
const notificationClose = document.getElementById('notificationClose');
const accountSelectionModal = document.getElementById('accountSelectionModal');
const accountList = document.getElementById('accountList');
const modalClose = document.getElementById('modalClose');
const resendLink = document.getElementById('resendLink');
const countdownElement = document.getElementById('countdown');
const jamiLoader = document.getElementById('jamiLoader');
const verificationIcon = document.getElementById('verificationIcon');
const verificationMethod = document.getElementById('verificationMethod');
const verificationTarget = document.getElementById('verificationTarget');
const searchingAnimation = document.getElementById('searchingAnimation');
const successMessage = document.getElementById('successMessage');
const noAccountMessage = document.getElementById('noAccountMessage');
const createAccountButton = document.getElementById('createAccountButton');
const verificationSeal = document.getElementById('verificationSeal');
const otpContainer = document.getElementById('otpContainer');

// Global variables
let currentIdentifier = '';
let otpMethod = 'email';
let countdown = 60;
let countdownInterval;

// Toggle password visibility
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    
    // Change the eye icon
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

// Custom notification system
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
        // Hide any previous no account message
        noAccountMessage.style.display = 'none';
        
        // Show searching animation
        searchingAnimation.style.display = 'block';
        loginButton.style.display = 'none';
        
        // Simulate API call to check if email has multiple accounts
        setTimeout(() => {
            searchingAnimation.style.display = 'none';
            loginButton.style.display = 'block';
            
            const identifier = emailInput.value.trim();
            const password = passwordInput.value;
            
            // Check for specific demo credentials
            if (identifier === 'safwan110817@gmail.com' && password === 'Saim@2005') {
                // Show account selection modal for demo account
                const accounts = [
                    { id: 1, company: 'Safwan Corporation', email: identifier },
                    { id: 2, company: 'Saim Vondami Enterprises', email: identifier },
                    { id: 3, company: 'Safwan & Co.', email: identifier }
                ];
                showAccountSelection(accounts);
            } else if (identifier === 'noaccount@example.com') {
                // Show no account found message for demo
                noAccountMessage.style.display = 'block';
                showNotification('error', 'Account Not Found', 'No account found with these credentials. Please try again or create a new account.');
            } else {
                // For other accounts, show OTP section directly
                sendOtpRequest(identifier, identifier.includes('@') ? 'email' : 'sms');
            }
        }, 2000);
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

// Create account button handler
createAccountButton.addEventListener('click', function() {
    window.location.href = 'create-account.html';
});

// Function to show account selection modal
function showAccountSelection(accounts) {
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
            // Store selected account
            localStorage.setItem('selectedAccount', JSON.stringify(account));
            hideAccountSelection();
            sendOtpRequest(account.email, 'email');
        });
        
        accountList.appendChild(accountItem);
    });
    
    // Show modal
    accountSelectionModal.classList.add('show');
}

// Function to hide account selection modal
function hideAccountSelection() {
    accountSelectionModal.classList.remove('show');
}

// Close modal when close button is clicked
modalClose.addEventListener('click', hideAccountSelection);

// Send OTP request to backend
function sendOtpRequest(identifier, method) {
    showNotification('info', 'Sending OTP', 'Please wait while we send the verification code...');
    
    // Determine if identifier is email or phone
    const isEmail = identifier.includes('@');
    const name = isEmail ? identifier.split('@')[0] : 'User';
    
    // Prepare request data
    const requestData = {
        action: 'send_otp',
        identifier: identifier,
        method: method
    };
    
    // Send request to backend
    fetch('send_login_otp.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentIdentifier = identifier;
            otpMethod = method;
            showOtpSection(identifier, method, data.data.identifier);
            showNotification('success', 'OTP Sent', 'Verification code has been sent successfully');
        } else {
            showNotification('error', 'OTP Failed', data.message || 'Failed to send verification code. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('error', 'Network Error', 'Unable to connect to server. Please try again.');
    });
}

// Show OTP section
function showOtpSection(identifier, method, displayIdentifier) {
    // Update verification method text and icon
    verificationMethod.textContent = method === 'email' ? 'Email to your address' : 'SMS to your phone';
    verificationIcon.className = method === 'email' ? 'fas fa-envelope' : 'fas fa-comment-alt';
    
    // Use the masked identifier from server response or create one
    if (!displayIdentifier) {
        if (method === 'email') {
            const [name, domain] = identifier.split('@');
            displayIdentifier = `${name.substring(0, 3)}***@${domain}`;
        } else {
            displayIdentifier = `+8801******${identifier.slice(-3)}`;
        }
    }
    
    verificationTarget.textContent = `Code sent to ${displayIdentifier}`;
    
    // Switch to OTP section
    loginSection.style.display = 'none';
    otpSection.style.display = 'block';
    
    // Start countdown for resend
    startCountdown();
    
    // Focus on first OTP input
    setTimeout(() => {
        document.getElementById('otp1').focus();
    }, 100);
}

// OTP input navigation
function moveToNext(current, nextFieldId) {
    if (current.value.length >= current.maxLength) {
        document.getElementById(nextFieldId).focus();
    }
    
    // Auto validate when all fields are filled
    if (nextFieldId === 'otp6' && current.value.length >= current.maxLength) {
        setTimeout(() => {
            validateOtp(document.getElementById('otp6'));
        }, 100);
    }
}

// Validate OTP when last digit is entered
function validateOtp(lastInput) {
    if (lastInput.value.length === 0) return;
    
    const otp1 = document.getElementById('otp1').value;
    const otp2 = document.getElementById('otp2').value;
    const otp3 = document.getElementById('otp3').value;
    const otp4 = document.getElementById('otp4').value;
    const otp5 = document.getElementById('otp5').value;
    const otp6 = document.getElementById('otp6').value;
    
    const otpCode = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    
    if (otpCode.length === 6) {
        verifyOtp(otpCode);
    }
}

// Verify OTP with backend
function verifyOtp(code) {
    // Show loading state on verify button
    verifyButton.classList.add('loading');
    
    // Prepare request data
    const requestData = {
        action: 'verify_otp',
        otp: code,
        identifier: currentIdentifier
    };
    
    // Send request to backend
    fetch('send_login_otp.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        verifyButton.classList.remove('loading');
        
        if (data.success) {
            // Show verification seal animation
            verificationSeal.classList.add('active');
            
            // After seal animation completes, show success message
            setTimeout(() => {
                verificationSeal.classList.remove('active');
                
                // Show success message
                successMessage.style.display = 'block';
                
                // After 2 seconds, redirect to dashboard
                setTimeout(() => {
                    jamiLoader.classList.add('active');
                    
                    // After another 2 seconds, redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                }, 2000);
            }, 1500);
        } else {
            // Show error state
            const inputs = document.querySelectorAll('.otp-input');
            inputs.forEach(input => {
                input.classList.remove('success');
                input.classList.add('error');
            });
            otpError.style.display = 'block';
            showNotification('error', 'Verification Failed', data.message || 'Invalid verification code');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        verifyButton.classList.remove('loading');
        showNotification('error', 'Network Error', 'Unable to connect to server. Please try again.');
    });
}

// Manual verification button
verifyButton.addEventListener('click', function() {
    const otp1 = document.getElementById('otp1').value;
    const otp2 = document.getElementById('otp2').value;
    const otp3 = document.getElementById('otp3').value;
    const otp4 = document.getElementById('otp4').value;
    const otp5 = document.getElementById('otp5').value;
    const otp6 = document.getElementById('otp6').value;
    
    const otpCode = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    
    if (otpCode.length === 6) {
        verifyOtp(otpCode);
    } else {
        // Show error state
        const inputs = document.querySelectorAll('.otp-input');
        inputs.forEach(input => {
            input.classList.remove('success');
            input.classList.add('error');
        });
        otpError.style.display = 'block';
        showNotification('error', 'Incomplete Code', 'Please enter all 6 digits of the verification code');
    }
});

// Resend code functionality with countdown
function startCountdown() {
    countdown = 60;
    countdownElement.textContent = countdown;
    resendLink.classList.add('disabled');
    resendLink.style.pointerEvents = 'none';
    
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            resendLink.innerHTML = 'Resend code';
            resendLink.classList.remove('disabled');
            resendLink.style.pointerEvents = 'auto';
        }
    }, 1000);
}

resendLink.addEventListener('click', function() {
    if (!resendLink.classList.contains('disabled')) {
        // Request a new OTP from the backend
        sendOtpRequest(currentIdentifier, otpMethod);
        
        // Reset countdown
        startCountdown();
    }
});

// Back to login
backToLogin.addEventListener('click', function() {
    otpSection.style.display = 'none';
    loginSection.style.display = 'block';
    
    // Clear OTP inputs
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error', 'success');
    });
    otpError.style.display = 'none';
    successMessage.style.display = 'none';
});

// Social login buttons - show custom notification
document.getElementById('googleLogin').addEventListener('click', function() {
    showNotification('warning', 'Under Development', 'Google login is currently under development. Please Create Account.', 4000);
});

document.getElementById('microsoftLogin').addEventListener('click', function() {
    showNotification('warning', 'Under Development', 'Microsoft login is currently under development. Please Create Account.', 4000);
});

// Auto-focus first OTP input when OTP section is shown
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            if (otpSection.style.display === 'block') {
                setTimeout(() => {
                    document.getElementById('otp1').focus();
                }, 100);
            }
        }
    });
});

observer.observe(otpSection, { attributes: true });