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
const loadingOverlay = document.getElementById('loadingOverlay');
const buttonText = document.getElementById('buttonText');
const buttonSpinner = document.getElementById('buttonSpinner');
const loadingText = document.getElementById('loadingText');
const loadingSubtext = document.getElementById('loadingSubtext');

// Current step tracker and user data
let currentStep = 1;
let userData = {
    company: '',
    contact: '',
    method: 'email',
    name: 'User'
};

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
    
    userData.company = companySelect.value;
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
        userData.method = 'email';
        userData.email = contactValue;
    } else {
        isValid = isValidPhone(contactValue);
        if (!isValid) {
            showError(contactInput, document.getElementById('contact-error'), 'Please enter a valid 11-digit phone number');
            return;
        }
        userData.method = 'sms';
        userData.mobile = contactValue;
    }
    
    showSuccess(contactInput, document.getElementById('contact-error'));
    userData.contact = contactValue;
    
    // Send OTP
    sendOTP();
});

step3Button.addEventListener('click', function() {
    verifyOTP();
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
    
    showLoadingOverlay('Updating Password', 'Please wait while we update your password');
    
    // Send password reset request to backend
    fetch('auth/forgot_password.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            identifier: userData.contact,
            new_password: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoadingOverlay();
        
        if (data.success) {
            showNotification('success', 'Password Reset Successful', 'Your password has been reset successfully. You can now login with your new password.', 5000);
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            showNotification('error', 'Password Reset Failed', data.message);
        }
    })
    .catch(error => {
        hideLoadingOverlay();
        showNotification('error', 'Network Error', 'Unable to connect to server');
    });
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
    sendOTP(true);
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

// OTP input handling with auto-verification
otpInputs.forEach(input => {
    input.addEventListener('input', function() {
        const value = this.value;
        const index = parseInt(this.getAttribute('data-index'));
        
        if (value.length > 1) {
            this.value = value.charAt(0);
        }
        
        if (value.length === 1 && index < 6) {
            otpInputs[index].focus();
        }
        
        let otpCode = '';
        otpInputs.forEach(input => {
            otpCode += input.value;
        });
        
        if (otpCode.length === 6) {
            buttonText.textContent = 'Verifying...';
            buttonSpinner.style.display = 'inline-block';
            step3Button.disabled = true;
            
            setTimeout(verifyOTP, 1000);
        }
        
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
    
    input.addEventListener('focus', function() {
        this.style.fontSize = '28px';
        this.style.height = '70px';
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

// Function to send OTP
function sendOTP(isResend = false) {
    showLoadingOverlay('Sending Verification Code', `Sending code to your ${userData.method === 'email' ? 'email' : 'phone'}`);
    
    const data = {
        action: 'send_otp',
        name: userData.name,
        method: userData.method
    };
    
    if (userData.method === 'email') {
        data.email = userData.contact;
    } else {
        data.mobile = userData.contact;
    }
    
    fetch('send_forgot_otp.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        hideLoadingOverlay();
        
        if (data.success) {
            showNotification('info', 'Verification Code Sent', `We've sent a 6-digit code to your ${userData.method === 'email' ? 'email' : 'phone'}`, 5000);
            
            contactMethod.textContent = userData.method === 'email' ? 'email' : 'phone';
            
            showStep(3);
            
            if (isResend) {
                otpInputs.forEach(input => {
                    input.value = '';
                });
                otpInputs[0].focus();
            }
        } else {
            showNotification('error', 'Failed to Send Code', data.message || 'Please try again later', 5000);
        }
    })
    .catch(error => {
        hideLoadingOverlay();
        showNotification('error', 'Connection Error', 'Unable to connect to the server. Please check your internet connection.', 5000);
        console.error('Error:', error);
    });
}

// OTP verification function
function verifyOTP() {
    let otpCode = '';
    otpInputs.forEach(input => {
        otpCode += input.value;
    });
    
    if (otpCode.length !== 6) {
        showError(otpInputs[0], document.getElementById('otp-error'), 'Please enter a valid 6-digit code');
        
        buttonText.textContent = 'Verify Code';
        buttonSpinner.style.display = 'none';
        step3Button.disabled = false;
        
        return;
    }
    
    showLoadingOverlay('Verifying Code', 'Please wait while we verify your code');
    
    const data = {
        action: 'verify_otp',
        otp: otpCode
    };
    
    if (userData.method === 'email') {
        data.email = userData.contact;
    } else {
        data.mobile = userData.contact;
    }
    
    fetch('send_forgot_otp.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        hideLoadingOverlay();
        
        if (data.success) {
            showSuccess(otpInputs[0], document.getElementById('otp-error'));
            
            showNotification('success', 'Verification Successful', 'Your code has been verified successfully.', 3000);
            
            setTimeout(() => {
                showStep(4);
                
                buttonText.textContent = 'Verify Code';
                buttonSpinner.style.display = 'none';
                step3Button.disabled = false;
            }, 2000);
        } else {
            showError(otpInputs[0], document.getElementById('otp-error'), data.message || 'Invalid verification code');
            
            buttonText.textContent = 'Verify Code';
            buttonSpinner.style.display = 'none';
            step3Button.disabled = false;
        }
    })
    .catch(error => {
        hideLoadingOverlay();
        showNotification('error', 'Connection Error', 'Unable to connect to the server. Please check your internet connection.', 5000);
        console.error('Error:', error);
        
        buttonText.textContent = 'Verify Code';
        buttonSpinner.style.display = 'none';
        step3Button.disabled = false;
    });
}

// Move to next OTP input
function moveToNext(input) {
    const value = input.value;
    const index = parseInt(input.getAttribute('data-index'));
    
    if (value.length === 1 && index < 6) {
        const nextInput = document.querySelector(`.otp-input[data-index="${index + 1}"]`);
        nextInput.focus();
    }
}

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

// Loading overlay functions
function showLoadingOverlay(title = 'Processing', subtitle = 'Please wait') {
    loadingText.textContent = title;
    loadingSubtext.textContent = subtitle;
    loadingOverlay.classList.add('active');
}

function hideLoadingOverlay() {
    loadingOverlay.classList.remove('active');
}

// Custom notification
const notification = document.getElementById('customNotification');
const notificationTitle = document.getElementById('notificationTitle');
const notificationMessage = document.getElementById('notificationMessage');
const notificationClose = document.getElementById('notificationClose');

function showNotification(type, title, message, duration = 5000) {
    notification.classList.remove('notification-info', 'notification-warning', 'notification-error', 'notification-success');
    
    notification.classList.add(`notification-${type}`);
    
    notificationTitle.textContent = title;
    notificationMessage.textContent = message;
    
    notification.classList.add('show');
    
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