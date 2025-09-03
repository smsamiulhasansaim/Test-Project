<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $full_name;
    public $email;
    public $phone;
    public $password;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET full_name=:full_name, email=:email, 
                  phone=:phone, password=:password";
        
        $stmt = $this->conn->prepare($query);
        
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);
        
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":password", $this->password);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function getUserByEmail($email) {
        $query = "SELECT id, full_name, email, phone, password 
                  FROM " . $this->table_name . " 
                  WHERE email = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->execute();
        
        return $stmt;
    }

    public function getUserByPhone($phone) {
        $query = "SELECT id, full_name, email, phone, password 
                  FROM " . $this->table_name . " 
                  WHERE phone = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $phone);
        $stmt->execute();
        
        return $stmt;
    }

    public function getUserById($id) {
        $query = "SELECT id, full_name, email, phone 
                  FROM " . $this->table_name . " 
                  WHERE id = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        return $stmt;
    }

    public function updatePassword($id, $new_password) {
        $query = "UPDATE " . $this->table_name . " 
                  SET password = :password 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
        
        $stmt->bindParam(":password", $hashed_password);
        $stmt->bindParam(":id", $id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function checkUserExists($email, $phone) {
        $query = "SELECT id 
                  FROM " . $this->table_name . " 
                  WHERE email = ? OR phone = ? 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $email);
        $stmt->bindParam(2, $phone);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }
}
?>