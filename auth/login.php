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

if(!empty($data->identifier) && !empty($data->password)) {
    if(filter_var($data->identifier, FILTER_VALIDATE_EMAIL)) {
        $stmt = $user->getUserByEmail($data->identifier);
    } else {
        $stmt = $user->getUserByPhone($data->identifier);
    }
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if(password_verify($data->password, $row['password'])) {
            $company_stmt = $company->getCompaniesByUserId($row['id']);
            
            $companies = array();
            while($company_row = $company_stmt->fetch(PDO::FETCH_ASSOC)) {
                $companies[] = array(
                    "id" => $company_row['id'],
                    "company_name" => $company_row['company_name']
                );
            }
            
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Login successful",
                "user_id" => $row['id'],
                "full_name" => $row['full_name'],
                "companies" => $companies
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "Invalid password"));
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