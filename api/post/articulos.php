<?php
// FICHERO: api/post/articulos.php
// PETICIONES POST ADMITIDAS:
// Nota: Todas las operaciones deberán añadir a la petición POST una cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
// * api/articulos -> Dar de alta un nuevo artículo
//       Params: nombre:Nombre del artículo;descripcion:descripción;categoria:nombre de la categoría;precio:precio del artículo

// * api/articulos/{ID}/foto   -> Da de alta una foto para el artículo. Necesita la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
//       Params: foto:foto del artículo (input type=file)
// * api/articulos/{ID}/seguir/{ACCION} -> Pone el artículo en seguimiento. Necesita la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}". Si {ACCION}==true, marca para seguir, si no, para dejar de seguir
// * api/articulos/{ID}/pregunta  -> Permite guardar una pregunta para el vendedor del artículo. Necesita la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
//       Params: texto: texto de la pregunta
//
// * api/articulos/{ID} -> Modificar el precio y/o descripción del artículo. Necesita la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
//       Params: precio: precio del artículo; descripcion: descripción del artículo
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
  $R             = [];  // Almacenará el resultado.
  $RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
  // =================================================================================
  // =================================================================================
  // Se supone que si llega aquí es porque todo ha ido bien y tenemos los datos correctos
  // de la nueva entrada, NO LAS FOTOS. Las fotos se suben por separado una vez se haya
  // confirmado la creación correcta de la entrada.
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
    $ID = array_shift($RECURSO);
    try{
        $dbCon->beginTransaction();
        if(!is_numeric($ID)) // NUEVO REGISTRO
        { // Si no es numérico $ID es porque se está creando un nuevo registro
          $nombre      = $PARAMS['nombre'];
          $descripcion = nl2br($PARAMS['descripcion'],false);
          $categoria   = $PARAMS['categoria'];
          $precio      = $PARAMS['precio'];
          // Se busca la categoría en la BD y si no está, se crea.
          $mysql = 'select * from categoria where nombre=:cat';

          $stmt = $dbCon->prepare($mysql);
          if( $stmt->execute([':cat' => $categoria]) )
          {
            if($stmt->rowCount() > 0) // ENCONTRADO!!!
            {
              $registro = $stmt->fetch(PDO::FETCH_ASSOC);
              $ID_CATEGORIA = $registro['id'];
            }
            else // LA CATEGORÍA NO EXISTE. HAY QUE CREARLA
            {
              $mysql = 'insert into categoria(nombre) values(:cat);';
              $stmt2 = $dbCon->prepare($mysql);
              if( $stmt2->execute([':cat' => $categoria]) )
              {
                $mysql = 'select max(id) as id_cat from categoria';
                $stmt3 = $dbCon->prepare($mysql);
                if( $stmt3->execute() )
                {
                  $registro = $stmt3->fetch(PDO::FETCH_ASSOC);
                  $ID_CATEGORIA = $registro['id_cat'];
                }
                $stmt3->closeCursor();
              }
            }
          }
          $stmt->closeCursor();
          // =================================================================================
          $mysql  = 'insert into articulo(nombre,descripcion,precio,id_categoria,vendedor) ';
          $mysql .= 'values(:NOMBRE,:DESCRIPCION,:PRECIO,:ID_CATEGORIA,:VENDEDOR)';

          $VALORES                  = [];
          $VALORES[':NOMBRE']       = $nombre;
          $VALORES[':DESCRIPCION']  = $descripcion;
          $VALORES[':PRECIO']       = $precio;
          $VALORES[':ID_CATEGORIA'] = $ID_CATEGORIA;
          $VALORES[':VENDEDOR']     = $login;

          $stmt = $dbCon->prepare($mysql);
          if( $stmt->execute($VALORES) )
          { // Se han insertado los datos del registro
            // Se saca el id del nuevo registro
            $mysql2 = "select MAX(id) as id_articulo from articulo";
            $stmt2 = $dbCon->prepare($mysql2);
            if($stmt2->execute())
            {
              $registro = $stmt2->fetch(PDO::FETCH_ASSOC);
              $ID = $registro['id_articulo'];
            }
            else $ID = -1;

            $stmt2->closeCursor();

            $RESPONSE_CODE    = 200;
            $R['RESULTADO']   = 'OK';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'Registro creado correctamente';
            $R['ID']          = $ID;
          }
          else
          {
            $RESPONSE_CODE    = 500;
            $R['RESULTADO']   = 'ERROR';
            $R['CODIGO']      = $RESPONSE_CODE;
            $R['DESCRIPCION'] = 'Error de servidor.';
          }
        }
        else
        { // El $ID es numérico por lo que se va a guardar una pregunta, respuesta o foto del artículo
          switch(array_shift($RECURSO))
          {
            case 'seguir':
                    // Hay que ver si es para seguir o dejar de seguir
                    $accion = array_shift($RECURSO);
                    if($accion == 'true')
                      $mysql = 'insert into siguiendo(login,id_articulo) values(:LOGIN,:ID_ARTICULO)';
                    else
                      $mysql = 'delete from siguiendo where login=:LOGIN and id_articulo=:ID_ARTICULO';

                    $VALORES                = [];
                    $VALORES[':LOGIN']      = $login;
                    $VALORES['ID_ARTICULO'] = $ID;

                    $stmt = $dbCon->prepare($mysql);
                    if( $stmt->execute($VALORES) )
                    {
                        // Se ha registrado correctamente el seguimiento.
                        $RESPONSE_CODE    = 200;
                        $R['RESULTADO']   = 'OK';
                        $R['CODIGO']      = $RESPONSE_CODE;
                        $R['DESCRIPCION'] = 'Se ha realizado correctamente la operación de seguimiento.';
                    }
                break;
            case 'pregunta': // Se va a añadir una pregunta
                $ID_PREGUNTA = array_shift($RECURSO);
                if(is_numeric($ID_PREGUNTA)) // SE VA A AÑADIR UNA RESPUESTA
                {
                  if(array_shift($RECURSO) == 'respuesta') // SE VA A AÑADIR UNA RESPUESTA
                  {
                    $texto = nl2br($PARAMS['texto']); // Texto de la respuesta
                    $mysql = 'update pregunta set respuesta=:TEXTO where id=:ID_PREGUNTA';
                    $VALORES                 = [];
                    $VALORES[':ID_PREGUNTA'] = $ID_PREGUNTA;
                    $VALORES[':TEXTO']       = $texto;

                    $stmt2 = $dbCon->prepare($mysql);
                    if( $stmt2->execute($VALORES) )
                    {
                      // ===============================================================
                      // Se ha añadido la respuesta correctamente.
                      $RESPONSE_CODE    = 200;
                      $R['RESULTADO']   = 'OK';
                      $R['CODIGO']      = $RESPONSE_CODE;
                      $R['DESCRIPCION'] = 'Respuesta guardada correctamente.';
                      $R['ID_PREGUNTA'] = $ID_PREGUNTA;
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
                else // SE VA A AÑADIR UNA PREGUNTA
                {
                  $texto  = nl2br($PARAMS['texto']); // nl2br convierte los retornos de carro a <br>
                  $mysql  ='insert into pregunta(login,id_articulo,pregunta) values(:LOGIN,:ID,:TEXTO)';

                  $VALORES           = [];
                  $VALORES[':LOGIN'] = $login;
                  $VALORES[':ID']    = $ID;
                  $VALORES[':TEXTO'] = $texto;

                  $stmt2 = $dbCon->prepare($mysql);
                  if( $stmt2->execute($VALORES) )
                  {
                    $mysql = 'select MAX(id) as id from pregunta';
                    $stmt3 = $dbCon->prepare($mysql);
                    if( $stmt3->execute() )
                    {
                      $row = $stmt3->fetch(PDO::FETCH_ASSOC);
                      $stmt3->closeCursor();
                      $ID_PREGUNTA = $row['id'];
                      // ===============================================================
                      // Se ha añadido la pregunta correctamente.
                      $RESPONSE_CODE    = 201;
                      $R['RESULTADO']   = 'OK';
                      $R['CODIGO']      = $RESPONSE_CODE;
                      $R['DESCRIPCION'] = 'Pregunta guardada correctamente.';
                      $R['ID']          = $ID_PREGUNTA;
                      // ===============================================================
                    }
                    else
                    {
                      $RESPONSE_CODE    = 500;
                      $R['RESULTADO']   = 'ERROR';
                      $R['CODIGO']      = $RESPONSE_CODE;
                      $R['DESCRIPCION'] = 'Se ha producido un error al intentar guardar la pregunta.';
                    }
                  }
                }
              break;
            case 'foto': // Se sube una foto
                if(isset($_FILES['fichero']))
                {
                  if($_FILES['fichero']['size'] > $max_uploaded_file_size)
                  {
                    $RESPONSE_CODE = 400;
                    $R['RESULTADO']   = 'ERROR';
                    $R['CODIGO']      = $RESPONSE_CODE;
                    $R['DESCRIPCION'] = 'Tamaño del archivo demasiado grande. El máximo es ' . $max_uploaded_file_size / 1024 . ' KB';
                  }
                  else
                  {
                    $mysql = 'insert into foto(id_articulo) values(:ID_ARTICULO);';
                    $stmt2 = $dbCon->prepare($mysql);
                    if( $stmt2->execute([':ID_ARTICULO' => $ID]) )
                    {
                      $mysql = 'select max(ID) as id_fichero from foto';
                      $stmt3 = $dbCon->prepare($mysql);
                      if( $stmt3->execute() )
                      {
                        $row = $stmt3->fetch(PDO::FETCH_ASSOC);
                        $stmt3->closeCursor();
                        $ID_FICHERO = $row['id_fichero'];

                        $ext = pathinfo($_FILES['fichero']['name'], PATHINFO_EXTENSION); // extensión del fichero
                        $uploaddir = '../../' . $pathFotos . 'articulos/';
                        $uploadfile = $uploaddir . $ID_FICHERO . '.' . $ext; // path fichero destino

                        // Se crea el directorio si no existe
                        if (!file_exists($uploaddir)) {
                          mkdir($uploaddir, 0777, true);
                        }
                        if(move_uploaded_file($_FILES['fichero']['tmp_name'], $uploadfile)) // se sube el fichero
                        {
                          $mysql = 'update foto set fichero=:FICHERO where id=:ID_FICHERO';
                          $VALORES               = [];
                          $VALORES[':FICHERO']   = $ID_FICHERO . '.' . $ext;
                          $VALORES['ID_FICHERO'] = $ID_FICHERO;

                          $RESPONSE_CODE = 201;
                          $R['RESULTADO']   = 'OK';
                          $R['CODIGO']      = $RESPONSE_CODE;
                          $R['DESCRIPCION'] = 'Foto subida correctamente';
                        }
                        else
                        { // No se ha podido copiar la foto. Hay que eliminar el registro
                          $mysql = 'delete from fichero where id=:ID_FICHERO';
                          $VALORES['ID_FICHERO'] = $ID_FICHERO;

                          $RESPONSE_CODE = 500;
                          $R['RESULTADO']   = 'ERROR';
                          $R['CODIGO']      = $RESPONSE_CODE;
                          $R['DESCRIPCION'] = 'Error al guardar la foto';
                        }
                        // SE EJECUTA LA CONSULTA
                        $stmt3 = $dbCon->prepare($mysql);
                        if( !$stmt3->execute($VALORES) )
                        {
                          $RESPONSE_CODE    = 500;
                          $R['RESULTADO']   = 'ERROR';
                          $R['CODIGO']      = $RESPONSE_CODE;
                          $R['DESCRIPCION'] = 'Error indefinido al guardar la foto';
                        }
                      }
                    }
                  }
                }
              break;
            default: // Se supone que va a modificar precio y/o descripción
                $mysql = 'update articulo set ';
                $VALORES = [];
                if(isset($PARAMS['descripcion']))
                {
                  $mysql .= 'descripcion=:DESCRIPCION';
                  $VALORES[':DESCRIPCION'] = nl2br($PARAMS['descripcion'],false);
                }
                if(isset($PARAMS['precio']))
                {
                  if(substr($mysql, -4) != 'set ')
                    $mysql .= ', ';

                  $mysql .= 'precio=:PRECIO';
                  $VALORES[':PRECIO'] = $PARAMS['precio'];
                }

                $mysql .= ' where id=:ID';
                $VALORES[':ID'] = $ID;
                // SE EJECUTA LA CONSULTA
                $stmt = $dbCon->prepare($mysql);
                if( $stmt->execute($VALORES) )
                {
                  $RESPONSE_CODE    = 200;
                  $R['RESULTADO']   = 'OK';
                  $R['CODIGO']      = $RESPONSE_CODE;
                  $R['DESCRIPCION'] = 'Artículo modificado correctamente';
                }
                else
                {
                  $RESPONSE_CODE    = 500;
                  $R['RESULTADO']   = 'ERROR';
                  $R['CODIGO']      = $RESPONSE_CODE;
                  $R['DESCRIPCION'] = 'Error al intentar modificar el artículo';
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