<?php
class Company {
    private $conn;
    private $table_name = "companies";

    public $id;
    public $user_id;
    public $company_name;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET user_id=:user_id, company_name=:company_name";
        
        $stmt = $this->conn->prepare($query);
        
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->company_name = htmlspecialchars(strip_tags($this->company_name));
        
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":company_name", $this->company_name);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function getCompaniesByUserId($user_id) {
        $query = "SELECT id, company_name 
                  FROM " . $this->table_name . " 
                  WHERE user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->execute();
        
        return $stmt;
    }

    public function checkCompanyExists($user_id, $company_name) {
        $query = "SELECT id 
                  FROM " . $this->table_name . " 
                  WHERE user_id = ? AND company_name = ? 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $user_id);
        $stmt->bindParam(2, $company_name);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            return true;
        }
        return false;
    }
}
?>