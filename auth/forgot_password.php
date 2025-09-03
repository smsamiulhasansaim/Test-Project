<?php
header('Content-Type: application/json');
include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->identifier) && !empty($data->new_password)) {
    if(filter_var($data->identifier, FILTER_VALIDATE_EMAIL)) {
        $stmt = $user->getUserByEmail($data->identifier);
    } else {
        $stmt = $user->getUserByPhone($data->identifier);
    }
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($user->updatePassword($row['id'], $data->new_password)) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "Password updated successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to update password"));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("success" => false, "message" => "User not found"));
    }
} else {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "Incomplete data"));
}
?>