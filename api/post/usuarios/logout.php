<?php
// =================================================================================
// HACER LOGOUT
// =================================================================================
// FICHERO: api/post/usuarios/logout.php
// MÉTODO: POST
// PETICIONES POST ADMITIDAS:
// * api/usuarios/logout -> Hacer logout de un nuevo usuario. Necesita la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}"
//      Params: (ninguno)
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
// =================================================================================
require_once('../../database.php');
// =================================================================================
// Se instancia la base de datos y el objeto producto
// =================================================================================
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R = [];  // Almacenará el resultado.
// =================================================================================
// CABECERA DE AUTORIZACIÓN
// =================================================================================
$headers = apache_request_headers();
if(isset($headers['Authorization']))
    $AUTORIZACION = $headers['Authorization'];
elseif (isset($headers['authorization']))
    $AUTORIZACION = $headers['authorization'];

if(isset($AUTORIZACION))
{
  list($login,$token) = explode(':', $AUTORIZACION);
  $mysql = 'update usuario set token=NULL where login=:LOGIN and token=:TOKEN';
  $VPARAMS[':LOGIN']  = $login;
  $VPARAMS[':TOKEN']  = $token;
  $stmt = $dbCon->prepare($mysql);

  if( $stmt->execute($VPARAMS) )
  {
    $RESPONSE_CODE    = 200;
    $R['DESCRIPCION'] = 'Logout realizado correctamente';
    $R['LOGIN']       = $login;
  }
  else
  {
    $RESPONSE_CODE    = 403;
    $R['DESCRIPCION'] = 'No se ha podido hacer el logout';
  }
}
else
{
  $RESPONSE_CODE    = 401;
  $R['DESCRIPCION'] = 'Falta cabecera de autorización';
}
$R = ['CODIGO' => $RESPONSE_CODE, 'RESULTADO' => 'OK'] + $R;
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
print json_encode($R);
?>