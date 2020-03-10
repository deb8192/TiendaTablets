<?php
// ============================================================
// PARAMETROS GENERALES DE CONFIGURACION
// ============================================================
$pathFotos = 'fotos/'; // Path relativo hasta la carpeta de fotos, desde la raíz de la web (en este caso, htdocs/pcw/)
$max_uploaded_file_size = 300 * 1024; // en Bytes (500KB)

class Database{

    // Configuración del servidor de base de datos
    private $host     = "127.0.0.1";
    // private $host     = "localhost";
    private $db_name  = "articulos";
    private $username = "pcw";
    private $password = "pcw";
    public $conn;

    // get the database connection
    public function getConnection(){

        $this->conn = null;

        try{
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
        }catch(PDOException $exception){
            echo "Connection error: " . $exception->getMessage();
        }
        // And pass optional (but important) PDO attributes
        $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
        $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        return $this->conn;
    }
    // =================================================================================
    // Sanatiza lo textos
    // =================================================================================
    public function sanatize($valor)
    {
        return urldecode('' . $valor);;
    }

    // =================================================================================
    // Comprueba si la combinación login de usuario y token de seguridad es válida:
    // =================================================================================
    public function comprobarSesion($login, $token)
    {
        $valorRet = false;
        $mysql    = 'select * from usuario where login=:LOGIN';
        $stmt     = $this->conn->prepare($mysql);
        $stmt->execute([':LOGIN' => $login]); // execute query

        if($stmt->rowCount())
        {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if($row['token'] == $token)
                $valorRet = true;
        }
        else
        {
            $RESPONSE_CODE    = 500;
            $R['RESULTADO']   = 'ERROR';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'No existe el usuario en la BD';
            // exit();
        }
        return $valorRet;
    }
}
?>