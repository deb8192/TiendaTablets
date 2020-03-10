<?php
// FICHERO: api/get/categorias.php
// PETICIONES GET ADMITIDAS:
// * api/categorias -> devuelve la lista de categorías disponibles
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
// =================================================================================
require_once('../database.php');
// instantiate database and product object
$db    = new Database();
$dbCon = $db->getConnection();
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
// prepare query statement
$mysql = 'select * from categoria order by nombre';
$stmt  = $dbCon->prepare($mysql);
$stmt->execute(); // execute query

if($stmt->rowCount() > 0)
{
  while( $row = $stmt->fetch(PDO::FETCH_ASSOC) )
      $FILAS[] = $row;
  $stmt->closeCursor();

  $RESPONSE_CODE  = 200; // código de respuesta por defecto: 200 - OK
  $R['RESULTADO'] = 'OK';
  $R['CODIGO']    = $RESPONSE_CODE;
  $R['FILAS']     = $FILAS;
}
else
{
  $RESPONSE_CODE    = 500;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Error de servidor. No se ha podido realizar la operación.';
}
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