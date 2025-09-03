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
    
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
});

// Custom notification system
function showNotification(type, title, message, duration = 5000) {
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    customNotification.className = 'custom-notification';
    customNotification.classList.add(`notification-${type}`);
    
    customNotification.classList.add('show');
    
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
    
    emailInput.dispatchEvent(new Event('blur'));
    passwordInput.dispatchEvent(new Event('blur'));
    
    const emailValid = !emailInput.classList.contains('error') && emailInput.value.trim() !== '';
    const passwordValid = !passwordInput.classList.contains('error') && passwordInput.value !== '';
    
    if (emailValid && passwordValid) {
        noAccountMessage.style.display = 'none';
        
        searchingAnimation.style.display = 'block';
        loginButton.style.display = 'none';
        
        const identifier = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Send login request to backend
        fetch('auth/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: identifier,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            searchingAnimation.style.display = 'none';
            loginButton.style.display = 'block';
            
            if (data.success) {
                if (data.companies && data.companies.length > 1) {
                    // Multiple accounts found - show selection
                    showAccountSelection(data.companies, data.user_id, data.full_name);
                } else if (data.companies && data.companies.length === 1) {
                    // Single account - proceed directly
                    redirectToDashboard(data.user_id, data.companies[0].id, data.full_name);
                } else {
                    // No companies found
                    showNotification('error', 'No Companies', 'No companies found for this account');
                }
            } else {
                noAccountMessage.style.display = 'block';
                showNotification('error', 'Login Failed', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            searchingAnimation.style.display = 'none';
            loginButton.style.display = 'block';
            showNotification('error', 'Network Error', 'Unable to connect to server');
        });
    } else {
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
function showAccountSelection(companies, user_id, full_name) {
    const accountList = document.getElementById('accountList');
    
    accountList.innerHTML = '';
    
    companies.forEach(company => {
        const accountItem = document.createElement('div');
        accountItem.className = 'account-item';
        accountItem.innerHTML = `
            <div class="account-name">${company.company_name}</div>
        `;
        
        accountItem.addEventListener('click', () => {
            redirectToDashboard(user_id, company.id, full_name);
        });
        
        accountList.appendChild(accountItem);
    });
    
    accountSelectionModal.classList.add('show');
}

// Function to hide account selection modal
function hideAccountSelection() {
    accountSelectionModal.classList.remove('show');
}

// Close modal when close button is clicked
modalClose.addEventListener('click', hideAccountSelection);

// Redirect to dashboard
function redirectToDashboard(user_id, company_id, full_name) {
    // Store user data in localStorage
    localStorage.setItem('user_id', user_id);
    localStorage.setItem('company_id', company_id);
    localStorage.setItem('full_name', full_name);
    
    // Show loader and redirect
    jamiLoader.classList.add('active');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// OTP input navigation
function moveToNext(current, nextFieldId) {
    if (current.value.length >= current.maxLength) {
        document.getElementById(nextFieldId).focus();
    }
    
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
    verifyButton.classList.add('loading');
    
    const requestData = {
        action: 'verify_otp',
        otp: code,
        identifier: currentIdentifier
    };
    
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
            verificationSeal.classList.add('active');
            
            setTimeout(() => {
                verificationSeal.classList.remove('active');
                
                successMessage.style.display = 'block';
                
                setTimeout(() => {
                    jamiLoader.classList.add('active');
                    
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                }, 2000);
            }, 1500);
        } else {
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
        sendOtpRequest(currentIdentifier, otpMethod);
        startCountdown();
    }
});

// Back to login
backToLogin.addEventListener('click', function() {
    otpSection.style.display = 'none';
    loginSection.style.display = 'block';
    
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