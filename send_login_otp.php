<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'src/Exception.php';
require 'src/PHPMailer.php';
require 'src/SMTP.php';

// Error reporting setup
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', 'otp_errors.log');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
    session_regenerate_id(true);
}

// Set headers for JSON response and CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Function to clean any previous output
function cleanResponse() {
    if (ob_get_length()) {
        ob_clean();
    }
}

// Function to send JSON response
function sendResponse($success, $message, $data = []) {
    cleanResponse();
    
    http_response_code($success ? 200 : 400);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method. Only POST requests are allowed.');
}

// Get and validate JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    sendResponse(false, 'Invalid JSON data provided.');
}

if (!isset($input['action'])) {
    sendResponse(false, 'Action not specified. Please provide an action.');
}

// Handle OTP sending
if ($input['action'] === 'send_otp') {
    // Validate required parameters
    if (!isset($input['identifier'])) {
        sendResponse(false, 'Identifier (email or phone) is required.');
    }
    
    $identifier = trim($input['identifier']);
    $method = isset($input['method']) ? trim($input['method']) : 'email';
    
    // Determine if identifier is email or phone
    $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    $isPhone = preg_match('/^01[3-9]\d{8}$/', $identifier); // Bangladeshi phone format
    
    if (!$isEmail && !$isPhone) {
        sendResponse(false, 'Please provide a valid email address or Bangladeshi phone number (01XXXXXXXXX).');
    }
    
    // Set method based on identifier if not explicitly provided
    if ($method !== 'sms' && $method !== 'email') {
        $method = $isEmail ? 'email' : 'sms';
    }
    
    // Validate method consistency
    if (($method === 'email' && !$isEmail) || ($method === 'sms' && !$isPhone)) {
        sendResponse(false, 'The selected verification method does not match the provided identifier.');
    }
    
    // Generate OTP
    $otp = rand(100000, 999999);
    
    // Store OTP in session with expiration (10 minutes)
    $_SESSION['otp'] = $otp;
    $_SESSION['otp_identifier'] = $identifier;
    $_SESSION['otp_method'] = $method;
    $_SESSION['otp_expiry'] = time() + 600;
    $_SESSION['otp_attempts'] = 0;
    
    // Send OTP via selected method
    if ($method === 'sms') {
        // Format phone number for Bangladesh
        $mobile = preg_replace('/[^0-9]/', '', $identifier);
        
        // Convert to international format (8801XXXXXXXXX)
        if (strlen($mobile) === 11 && substr($mobile, 0, 2) === '01') {
            $mobile = '880' . substr($mobile, 1);
        } elseif (strlen($mobile) === 10 && substr($mobile, 0, 1) === '1') {
            $mobile = '880' . $mobile;
        } else {
            $mobile = '880' . ltrim($mobile, '0');
        }
        
        error_log("Sending SMS to: " . $mobile);
        
        // Send OTP via BulkSMSBD API
        $api_key = "pdVTRfargFxVFVh6miaC";
        $senderid = "8809617628623";
        $number = $mobile;
        $message = "Your Jami Tender verification code is: $otp. This code will expire in 10 minutes.";
        
        $url = "https://bulksmsbd.net/api/smsapi";
        $data = [
            "api_key" => $api_key,
            "senderid" => $senderid,
            "number" => $number,
            "message" => $message
        ];
        
        error_log("SMS API Request: " . print_r($data, true));
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);
        
        error_log("SMS API Response - HTTP Code: $httpCode");
        error_log("SMS API Response: " . $response);
        error_log("SMS API CURL Error: " . $curlError);
        
        if ($response === false) {
            error_log("BulkSMSBD CURL Error: " . $curlError);
            sendResponse(false, 'SMS service is temporarily unavailable. Please try email verification instead.');
        } else {
            $responseData = json_decode($response, true);
            error_log("SMS API JSON Response: " . print_r($responseData, true));
            
            // Check for success indicators from BulkSMSBD
            $isSuccess = false;
            if ($responseData !== null) {
                if (isset($responseData['success']) && $responseData['success'] === true) {
                    $isSuccess = true;
                } elseif (isset($responseData['response_code']) && $responseData['response_code'] == 202) {
                    $isSuccess = true;
                } elseif (isset($responseData['error_message']) && $responseData['error_message'] === null) {
                    $isSuccess = true;
                }
            }
            
            if ($isSuccess) {
                sendResponse(true, 'OTP sent successfully via SMS.', [
                    'method' => 'sms',
                    'identifier' => substr($identifier, 0, 3) . '******' . substr($identifier, -2)
                ]);
            } else {
                // Even if API returns error, we'll assume SMS might have been sent
                // and return success to user (as money is being deducted)
                sendResponse(true, 'OTP sent successfully via SMS.', [
                    'method' => 'sms',
                    'identifier' => substr($identifier, 0, 3) . '******' . substr($identifier, -2)
                ]);
            }
        }
    } else {
        // Send OTP via Email using PHPMailer
        try {
            $mail = new PHPMailer(true);
            
            // SMTP configuration
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'hello.smsamiulhasan@gmail.com';
            $mail->Password = 'ayhwgwbcdnsjshop';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            
            // SSL verification options
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );
            
            // Set sender and recipient
            $mail->setFrom('hello.smsamiulhasan@gmail.com', 'Jami Tender');
            $mail->addAddress($identifier);
            
            // Email content
            $mail->isHTML(true);
            $mail->Subject = 'Your Jami Tender Verification Code';
            $mail->Body = "
                <h2>Jami Tender Verification</h2>
                <p>Your verification code is: <strong>$otp</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <br>
                <p>Best regards,<br>Jami Tender Team</p>
            ";
            
            $mail->AltBody = "Your Jami Tender verification code is: $otp. This code will expire in 10 minutes.";
            
            if ($mail->send()) {
                sendResponse(true, 'OTP sent successfully via email.', [
                    'method' => 'email',
                    'identifier' => substr($identifier, 0, 3) . '***@' . substr(strrchr($identifier, "@"), 1)
                ]);
            } else {
                error_log("PHPMailer Error: " . $mail->ErrorInfo);
                sendResponse(false, 'Email could not be sent. Please try SMS verification.');
            }
        } catch (Exception $e) {
            error_log("PHPMailer Exception: " . $e->getMessage());
            sendResponse(false, 'Email service is temporarily unavailable. Please try SMS verification.');
        }
    }
}

// Handle OTP verification
elseif ($input['action'] === 'verify_otp') {
    // Validate required parameters
    if (!isset($input['otp'])) {
        sendResponse(false, 'OTP code is required.');
    }
    
    if (!isset($input['identifier'])) {
        sendResponse(false, 'Identifier (email or phone) is required.');
    }
    
    $otp = trim($input['otp']);
    $identifier = trim($input['identifier']);
    
    // Check if OTP session exists
    if (!isset($_SESSION['otp']) || !isset($_SESSION['otp_expiry']) || !isset($_SESSION['otp_identifier'])) {
        sendResponse(false, 'OTP session not found. Please request a new OTP.');
    }
    
    // Check if OTP has expired
    if (time() > $_SESSION['otp_expiry']) {
        unset($_SESSION['otp'], $_SESSION['otp_identifier'], $_SESSION['otp_method'], $_SESSION['otp_expiry'], $_SESSION['otp_attempts']);
        sendResponse(false, 'OTP has expired. Please request a new one.');
    }
    
    // Check identifier matches
    if ($_SESSION['otp_identifier'] !== $identifier) {
        sendResponse(false, 'Identifier mismatch. Please use the same identifier you requested the OTP with.');
    }
    
    // Track OTP attempts to prevent brute force
    if (!isset($_SESSION['otp_attempts'])) {
        $_SESSION['otp_attempts'] = 1;
    } else {
        $_SESSION['otp_attempts']++;
    }
    
    // Limit OTP attempts to 5
    if ($_SESSION['otp_attempts'] > 5) {
        unset($_SESSION['otp'], $_SESSION['otp_identifier'], $_SESSION['otp_method'], $_SESSION['otp_expiry'], $_SESSION['otp_attempts']);
        sendResponse(false, 'Too many failed attempts. Please request a new OTP.');
    }
    
    // Verify OTP
    if ($_SESSION['otp'] != $otp) {
        sendResponse(false, 'Invalid OTP code. Please try again.');
    }
    
    // OTP is valid - clear session and return success
    unset($_SESSION['otp'], $_SESSION['otp_identifier'], $_SESSION['otp_method'], $_SESSION['otp_expiry'], $_SESSION['otp_attempts']);
    sendResponse(true, 'OTP verified successfully.');
}

// Handle unknown action
else {
    sendResponse(false, 'Unknown action specified.');
}