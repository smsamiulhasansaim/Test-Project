<?php
header('Content-Type: application/json');
include_once '../config/database.php';
include_once '../models/User.php';
include_once '../models/Company.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);
$company = new Company($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->full_name) && !empty($data->email) && 
   !empty($data->phone) && !empty($data->password) && 
   !empty($data->company_name)) {
    
    if($user->checkUserExists($data->email, $data->phone)) {
        http_response_code(409);
        echo json_encode(array("success" => false, "message" => "User with this email or phone already exists"));
        exit();
    }
    
    $user->full_name = $data->full_name;
    $user->email = $data->email;
    $user->phone = $data->phone;
    $user->password = $data->password;
    
    if($user->create()) {
        $user_id = $db->lastInsertId();
        
        $company->user_id = $user_id;
        $company->company_name = $data->company_name;
        
        if($company->create()) {
            http_response_code(201);
            echo json_encode(array("success" => true, "message" => "User registered successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to create company"));
        }
    } else {
        http_response_code(503);
        echo json_encode(array("success" => false, "message" => "Unable to create user"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Incomplete data"));
}
?>