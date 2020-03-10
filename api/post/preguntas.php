<?php
// FICHERO: api/post/preguntas.php
// PETICIONES POST ADMITIDAS:

// * api/preguntas/{ID}/respuesta -> Guarda una respuesta para una pregunta. Necesita la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
//       Params: texto:texto de la respuesta
// =================================================================================
// INCLUSION DE LA CONEXION A LA BD
// =================================================================================
require_once('../database.php');
// instantiate database and product object
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
$RECURSO = explode("/", substr($_GET['prm'],1));
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se pillan las cabeceras de la petición y se comprueba que está la de autorización
// =================================================================================
$headers = apache_request_headers();
// CABECERA DE AUTORIZACIÓN
if(isset($headers['Authorization']))
    $AUTORIZACION = $headers['Authorization'];
elseif (isset($headers['authorization']))
    $AUTORIZACION = $headers['authorization'];

if(!isset($AUTORIZACION))
{ // Acceso no autorizado
  $RESPONSE_CODE    = 403;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Falta autorización';
}
else
{
  // =================================================================================
  // Se prepara la respuesta
  // =================================================================================
  $R = [];  // Almacenará el resultado.
  // =================================================================================
  // =================================================================================
  // Se supone que si llega aquí es porque todo ha ido bien
  $PARAMS = $_POST;
  list($login,$token) = explode(':', $AUTORIZACION);

  if( !$db->comprobarSesion($login,$token) )
  {
    $RESPONSE_CODE    = 401;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Error de autenticación.';
  }
  else
  {
    $ID = array_shift($RECURSO); // Se pilla el id de la pregunta
    try{
        $dbCon->beginTransaction();
        if(is_numeric($ID)) // NUEVO REGISTRO
        { // Si no es numérico $ID es porque se está creando un nuevo registro

          if(array_shift($RECURSO) == 'respuesta') // SE VA A AÑADIR UNA RESPUESTA
          {
            $texto = nl2br($PARAMS['texto']); // Texto de la respuesta
            $mysql = 'update pregunta set respuesta=:TEXTO where id=:ID_PREGUNTA';
            $VALORES                 = [];
            $VALORES[':ID_PREGUNTA'] = $ID;
            $VALORES[':TEXTO']       = $texto;
            $stmt2 = $dbCon->prepare($mysql);
            if( $stmt2->execute($VALORES) )
            {
              // ===============================================================
              // Se ha añadido la respuesta correctamente.
              $RESPONSE_CODE    = 201;
              $R['RESULTADO']   = 'OK';
              $R['CODIGO']      = $RESPONSE_CODE;
              $R['DESCRIPCION'] = 'Respuesta guardada correctamente.';
              $R['ID_PREGUNTA'] = $ID;
              // ===============================================================
            }
            else
            {
              $RESPONSE_CODE    = 500;
              $R['RESULTADO']   = 'ERROR';
              $R['CODIGO']      = $RESPONSE_CODE;
              $R['DESCRIPCION'] = 'Se ha producido un error al intentar guardar la respuesta.';
            }
          }
        }
        $dbCon->commit();
    }catch(Exception $e){
      $dbCon->rollBack();
    }
  } // if( !comprobarSesion($login,$clave) )
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