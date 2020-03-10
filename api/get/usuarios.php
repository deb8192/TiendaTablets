<?php
// FICHERO: api/get/usuarios.php
// PETICIONES GET ADMITIDAS:
//   api/usuarios/{LOGIN}  -> devuelve true o false en función de si el login está disponible o no, respectivamente.
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
// =================================================================================
require_once('../database.php');
// instantiate database and product object
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// RECURSO
// =================================================================================
if(strlen($_GET['prm']) > 0)
    $RECURSO = explode("/", substr($_GET['prm'],1));
else
    $RECURSO = [];
$LOGIN = array_shift($RECURSO);
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R = [];  // Almacenará el resultado.
// =================================================================================
if(isset($LOGIN) && strlen($LOGIN) > 0)
{
  // Se devuelve si el login está disponible o no
  $mysql = 'select login from usuario where login=:LOGIN';
  $stmt  = $dbCon->prepare($mysql);
  $stmt->execute([':LOGIN'=>$LOGIN]); // execute query

  $RESPONSE_CODE  = 200; // código de respuesta por defecto: 200 - OK
  $R['RESULTADO'] = 'OK';
  if($stmt->rowCount() > 0)
    $R['DISPONIBLE'] = false;
  else
    $R['DISPONIBLE'] = true;
  $stmt->closeCursor();
}
else
{
	$RESPONSE_CODE    = 400; // Los parámetros no son correctos
	$R['RESULTADO']   = 'ERROR';
  $R['DESCRIPCION'] = 'Los parámetros no son correctos';
}
$R = ['CODIGO' => $RESPONSE_CODE] + $R;
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
echo json_encode($R);
?>