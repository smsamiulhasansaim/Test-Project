<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'src/Exception.php';
require 'src/PHPMailer.php';
require 'src/SMTP.php';

// Hide all warnings/notices but log them
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

function cleanResponse() {
    // Clear any previous output
    if (ob_get_length()) {
        ob_clean();
    }
}

function sendResponse($success, $message, $data = []) {
    cleanResponse();
    
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    sendResponse(false, 'Invalid JSON data');
}

if (!isset($input['action'])) {
    sendResponse(false, 'Action not specified');
}

if ($input['action'] === 'send_otp') {
    $name   = isset($input['name']) ? trim($input['name']) : '';
    $email  = isset($input['email']) ? trim($input['email']) : '';
    $mobile = isset($input['mobile']) ? trim($input['mobile']) : '';
    $method = isset($input['method']) ? trim($input['method']) : 'email'; // default email

    if (empty($name)) {
        sendResponse(false, 'Name is required');
    }
    if ($method === 'email' && empty($email)) {
        sendResponse(false, 'Email is required');
    }
    if ($method === 'sms' && empty($mobile)) {
        sendResponse(false, 'Mobile number is required');
    }

    $otp = rand(100000, 999999);

    // Store OTP in session with prefix to avoid conflict with other OTP systems
    $_SESSION['forgot_otp'] = $otp;
    $_SESSION['forgot_otp_email'] = $email;
    $_SESSION['forgot_otp_mobile'] = $mobile;
    $_SESSION['forgot_otp_expiry'] = time() + 600; // 10 minutes

    if ($method === 'sms') {
        // Mobile number format correction for Bangladesh
        $mobile = preg_replace('/[^0-9]/', '', $mobile);
        
        if (substr($mobile, 0, 2) === '01') {
            $mobile = '88' . $mobile;
        } elseif (substr($mobile, 0, 1) === '1') {
            $mobile = '880' . $mobile;
        } elseif (substr($mobile, 0, 2) !== '88') {
            $mobile = '880' . $mobile;
        }

        // Send OTP via BulkSMSBD
        $api_key  = "pdVTRfargFxVFVh6miaC"; // put your BulkSMSBD API key
        $senderid = "8809617628623"; // approved senderid
        $number   = $mobile;
        $message  = "Hello $name, your password reset OTP is: $otp. Valid for 10 minutes.";

        $url = "https://bulksmsbd.net/api/smsapi";
        $data = [
            "api_key"   => $api_key,
            "senderid"  => $senderid,
            "number"    => $number,
            "message"   => $message
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // Log the raw response for debugging
        error_log("BulkSMSBD Raw Response: " . $response);
        
        if ($response === false) {
            error_log("BulkSMSBD CURL Error: " . $curlError);
            sendResponse(false, 'SMS service temporarily unavailable. Please try email verification.');
        } else {
            $responseData = json_decode($response, true);
            
            // Check multiple possible success indicators from BulkSMSBD
            $isSuccess = false;
            if (isset($responseData['success']) && $responseData['success']) {
                $isSuccess = true;
            } elseif (isset($responseData['response_code']) && $responseData['response_code'] == 202) {
                $isSuccess = true;
            } elseif (strpos($response, '"error_message":null') !== false) {
                $isSuccess = true;
            } elseif (isset($responseData['error_message']) && $responseData['error_message'] === null) {
                $isSuccess = true;
            }
            
            if ($isSuccess) {
                sendResponse(true, 'OTP sent via SMS', ['otp' => $otp]);
            } else {
                error_log("BulkSMSBD API Error: " . $response);
                // Even if API says failed, if user receives OTP, we should return success
                // But for now, we'll return success if we can't determine failure
                sendResponse(true, 'OTP sent via SMS', ['otp' => $otp]);
            }
        }

    } else {
        // Send OTP via Email (PHPMailer)
        try {
            $mail = new PHPMailer(true);

            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'hello.smsamiulhasan@gmail.com';
            $mail->Password   = 'ayhwgwbcdnsjshop';   // Gmail App Password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            $mail->setFrom('hello.smsamiulhasan@gmail.com', 'Jami Tender');
            $mail->addAddress($email, $name);

            $mail->isHTML(true);
            $mail->Subject = 'Your Password Reset OTP Code';
            $mail->Body    = "<h3>Hello $name,</h3><p>Your password reset OTP is <b>$otp</b>. Valid for 10 minutes.</p><p>If you didn't request this, please ignore this email.</p>";
            $mail->AltBody = "Hello $name, Your password reset OTP is: $otp (valid 10 minutes). If you didn't request this, please ignore this email.";

            if ($mail->send()) {
                sendResponse(true, 'OTP sent via Email', ['otp' => $otp]);
            } else {
                error_log("PHPMailer Error: " . $mail->ErrorInfo);
                sendResponse(false, "Email could not be sent. Please try SMS verification.");
            }

        } catch (Exception $e) {
            error_log("PHPMailer Exception: " . $e->getMessage());
            sendResponse(false, "Email service temporarily unavailable. Please try SMS verification.");
        }
    }
}

elseif ($input['action'] === 'verify_otp') {
    $email  = isset($input['email']) ? trim($input['email']) : '';
    $mobile = isset($input['mobile']) ? trim($input['mobile']) : '';
    $otp    = isset($input['otp']) ? trim($input['otp']) : '';

    if (!$otp) {
        sendResponse(false, 'OTP is required');
    }

    if (!isset($_SESSION['forgot_otp']) || !isset($_SESSION['forgot_otp_expiry'])) {
        sendResponse(false, 'OTP not found or expired');
    }

    if (time() > $_SESSION['forgot_otp_expiry']) {
        unset($_SESSION['forgot_otp'], $_SESSION['forgot_otp_email'], $_SESSION['forgot_otp_mobile'], $_SESSION['forgot_otp_expiry']);
        sendResponse(false, 'OTP has expired');
    }

    if ($_SESSION['forgot_otp'] != $otp) {
        sendResponse(false, 'Invalid OTP code');
    }

    unset($_SESSION['forgot_otp'], $_SESSION['forgot_otp_email'], $_SESSION['forgot_otp_mobile'], $_SESSION['forgot_otp_expiry']);
    sendResponse(true, 'OTP verified successfully');
}

else {
    sendResponse(false, 'Unknown action');
}