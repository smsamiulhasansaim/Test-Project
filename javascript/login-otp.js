        // Get the identifier from the login page (in a real app, this would come from backend)
        const urlParams = new URLSearchParams(window.location.search);
        const identifier = urlParams.get('identifier') || localStorage.getItem('loginIdentifier') || 'user@example.com';
        
        // Store identifier for potential use in resending
        localStorage.setItem('loginIdentifier', identifier);
        
        // Determine if identifier is email or phone
        const isEmail = identifier.includes('@');
        const isPhone = /^[0-9]{11}$/.test(identifier.replace(/[\s\-\(\)]/g, ''));
        
        // Update verification method text and icon
        document.getElementById('verificationMethod').textContent = 
            isEmail ? 'Email to your address' : 'SMS to your phone';
        
        document.getElementById('verificationIcon').className = 
            isEmail ? 'fas fa-envelope' : 'fas fa-comment-alt';
        
        // Mask the identifier for display  
        let displayIdentifier;
        if (isEmail) {
            const [name, domain] = identifier.split('@');
            displayIdentifier = `${name.substring(0, 3)}***@${domain}`;
        } else if (isPhone) {
            displayIdentifier = `+8801******${identifier.slice(-3)}`;
        } else {
            displayIdentifier = identifier;
        }
        
        document.getElementById('verificationTarget').textContent = 
            `Code sent to ${displayIdentifier}`;
        
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
                // In a real app, this would verify with the backend
                // For demo purposes, we'll accept any 6-digit code
                const isValid = /^\d{6}$/.test(otpCode);
                
                if (isValid) {
                    // Show success state
                    const inputs = document.querySelectorAll('.otp-input');
                    inputs.forEach(input => {
                        input.classList.remove('error');
                        input.classList.add('success');
                    });
                    document.getElementById('otp-error').style.display = 'none';
                    
                    // Proceed with verification
                    verifyOtp(otpCode);
                } else {
                    // Show error state
                    const inputs = document.querySelectorAll('.otp-input');
                    inputs.forEach(input => {
                        input.classList.remove('success');
                        input.classList.add('error');
                    });
                    document.getElementById('otp-error').style.display = 'block';
                }
            }
        }
        
        // Verify OTP
        function verifyOtp(code) {
            // In a real app, this would make an API call to verify the OTP
            // For demo, we'll simulate a successful verification
            
            // Show the JAMI loader
            const loader = document.getElementById('jamiLoader');
            loader.classList.add('active');
            
            // After 2 seconds, redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }
        
        // Manual verification button
        document.getElementById('verifyButton').addEventListener('click', function() {
            const otp1 = document.getElementById('otp1').value;
            const otp2 = document.getElementById('otp2').value;
            const otp3 = document.getElementById('otp3').value;
            const otp4 = document.getElementById('otp4').value;
            const otp5 = document.getElementById('otp5').value;
            const otp6 = document.getElementById('otp6').value;
            
            const otpCode = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
            
            if (otpCode.length === 6) {
                validateOtp(document.getElementById('otp6'));
            } else {
                // Show error state
                const inputs = document.querySelectorAll('.otp-input');
                inputs.forEach(input => {
                    input.classList.remove('success');
                    input.classList.add('error');
                });
                document.getElementById('otp-error').style.display = 'block';
                showNotification('error', 'Incomplete Code', 'Please enter all 6 digits of the verification code');
            }
        });
        
        // Resend code functionality with countdown
        let countdown = 60;
        const countdownElement = document.getElementById('countdown');
        const resendLink = document.getElementById('resendLink');
        
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                resendLink.innerHTML = 'Resend code';
                resendLink.classList.remove('disabled');
                
                resendLink.addEventListener('click', function() {
                    // In a real app, this would request a new OTP from the backend
                    showNotification('success', 'Code Sent', 'A new verification code has been sent to your ' + (isEmail ? 'email' : 'phone'));
                    
                    // Reset countdown
                    countdown = 60;
                    countdownElement.textContent = countdown;
                    resendLink.innerHTML = 'Resend code in <span id="countdown">60</span>s';
                    resendLink.classList.add('disabled');
                    
                    // Restart countdown
                    const newCountdownInterval = setInterval(() => {
                        countdown--;
                        document.getElementById('countdown').textContent = countdown;
                        
                        if (countdown <= 0) {
                            clearInterval(newCountdownInterval);
                            resendLink.innerHTML = 'Resend code';
                            resendLink.classList.remove('disabled');
                        }
                    }, 1000);
                });
            }
        }, 1000);
        
        // Auto-focus first OTP input on page load
        document.getElementById('otp1').focus();
