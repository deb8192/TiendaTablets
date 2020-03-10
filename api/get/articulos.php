<?php
// FICHERO: api/get/articulos.php
// =================================================================================
// PETICIONES GET ADMITIDAS:
// =================================================================================
// Si se pasa la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}", devuelve dos campos más: siguiendo, propio, cuyo valor será 1 ó 0 en función de si el usuario si el usuario está siguiendo el artículo y/o es suyo, o no, respectivamente.

//   api/articulos  -----------------> devuelve toda la información de los articulos
//   api/articulos/{ID} -------------> devuelve toda la información del artículo con el ID que se le pasa
//   api/articulos/{ID}/fotos     ---> devuelve todas las fotos del artículo con el ID que se le pasa
//   api/articulos/{ID}/preguntas ---> devuelve todas las preguntas del artículo con el ID que se le pasa

// PARÁMETROS PARA LA BÚSQUEDA. DEVUELVE LOS REGISTROS QUE CUMPLAN TODOS LOS CRITERIOS DE BÚSQUEDA (OPERADOR AND).
//   api/articulos?t={texto} -> búsqueda por título. Devuelve la lista de registros que contengan en el título, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}
//	 api/articulos?v={login} -> búsqueda por vendedor
//   api/articulos?c={id_categoría} -> búsqueda por categoría. Devuelve la lista de registros que tengan asignada la categoría cuyo id se indica
//   api/articulos?mios -> Devuelve la lista de artículos a la venta del usuario logueado. Necesita la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
//   api/articulos?siguiendo -> Devuelve la lista de artículos que está siguiendo el usuario logueado. Necesita la cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
//   api/articulos?pd=120&ph=300 -> búsqueda por precio desde hasta. Se puede utilizar solo uno de los dos parámetros.

// PAGINACIÓN
//	 api/articulos?pag={pagina}&lpag={número de registros por página} -> devuelve los registros que están en la página que se le pide, tomando como tamaño de página el valor de lpag

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
// Se pillan los parámetros de la petición
$PARAMS = array_slice($_GET, 1, count($_GET) - 1,true);

// =================================================================================
// =================================================================================
// FUNCIONES AUXILIARES
// =================================================================================
// =================================================================================

// =================================================================================
// Añade las condiciones de filtro (búsqueda)
// =================================================================================
// $mysql   -> Guarda el sql
// $valores -> guardará los valores de los parámetros, ya que la consulta en $mysql es preparada
// $params  -> Trae los parámetros de la petición
// $db      -> es el objeto BD ... quitar
function aplicarFiltro($mysql, &$valores, $params, $db)
{
    // BÚSQUEDA RÁPIDA Y BÚSQUEDA POR TEXTO: BÚSQUEDA EN NOMBRE Y DESCRIPCIÓN AL MISMO TIEMPO
    if( isset($params['t']) ) // búsqueda
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' (false';

        $texto = explode(',', $params['t']);
        $paraNombre = '';
        $paraDescripcion = '';
        foreach ($texto as $idx=>$valor) {
            $paraNombre .= ' or a.nombre like :txt' . $idx;
            $valores[':txt' . $idx] = '%' . $valor . '%';
            $paraDescripcion .= ' or descripcion like :desc' . $idx;
            $valores[':desc' . $idx] = '%' . $valor . '%';
        }
        $mysql .= $paraNombre . $paraDescripcion . ')';
    }
    // BÚSQUEDA POR VENDEDOR (LOGIN)
    if( isset($params['v']) )
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' a.vendedor=:vendedor';
        $valores[':vendedor'] = $params['v'];
    }
    // BÚSQUEDA POR CATEGORÍA
    if( isset($params['c']) )
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' a.id_categoria=:id_cat';
        $valores[':id_cat'] = $params['c'];
    }
    // BÚSQUEDA POR ARTÍCULOS QUE VENDE EL USUARIO LOGUEADO. NECESITA HABER PASADO LA CABECERA "Authorization".
    if( isset($params['mios']) && isset($valores[':LOGIN']))
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' a.vendedor=:mios';
        $valores[':mios'] = $valores[':LOGIN'];
    }
    // BÚSQUEDA POR ARTÍCULOS QUE SIGUE EL USUARIO LOGUEADO. NECESITA HABER PASADO LA CABECERA "Authorization".
    if( isset($params['siguiendo']) && isset($valores[':LOGIN']))
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' a.id in (select id_articulo from siguiendo where login=:yo_siguiendo)';
        $valores[':yo_siguiendo'] = $valores[':LOGIN'];
    }
    // BÚSQUEDA POR PRECIO
    // * DESDE
    if( isset($params['pd']) && is_numeric($params['pd']) )
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' a.precio>=:precio_desde';
        $valores[':precio_desde'] = $params['pd'];
    }
    // * HASTA
    if( isset($params['ph']) && is_numeric($params['ph']) )
    {
        if(substr($mysql, -5) != 'where') $mysql .= ' and';
        $mysql .= ' a.precio<=:precio_hasta';
        $valores[':precio_hasta'] = $params['ph'];
    }

    return $mysql;
}
// =================================================================================
// CONFIGURACIÓN DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
//header("Access-Control-Allow-Methods: *");
// header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT, PATCH");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R                   = [];  // Almacenará el resultado.
$RESPONSE_CODE       = 200; // código de respuesta por defecto: 200 - OK
$mysql               = '';  // para el SQL
$VALORES             = []; // Son los valores para hacer la consulta
$TOTAL_COINCIDENCIAS = -1;  // Total de coincidencias en la BD
// =================================================================================
// SQL POR DEFECTO PARA SELECCIONAR TODOS LOS ARTÍCULOS
// =================================================================================
$mysql  = 'select a.*, c.nombre as categoria,';
$mysql .= '(select f.fichero from foto f where f.id_articulo=a.id order by f.id limit 0,1) as imagen,';
$mysql .= '(select u.foto from usuario u where a.vendedor=u.login) as foto_vendedor,';
$mysql .= '(select count(*) from foto f where f.id_articulo=a.id) as nfotos,';
$mysql .= '(select count(*) from siguiendo s where s.id_articulo=a.id) as nsiguiendo,';
$mysql .= '(select count(*) from pregunta p where p.id_articulo=a.id) as npreguntas';
// =================================================================================
// SE PILLAN LAS CABECERAS
// =================================================================================
$headers = apache_request_headers();
// =================================================================================
// CABECERA DE AUTORIZACIÓN
// =================================================================================
if(isset($headers['Authorization']))
    $AUTORIZACION = $headers['Authorization'];
elseif (isset($headers['authorization']))
    $AUTORIZACION = $headers['authorization'];
if(isset($AUTORIZACION))
{
    list($login,$token) = explode(':', $AUTORIZACION);
    if( $db->comprobarSesion($login,$token) )
    {
        $mysql .= ', (select count(*) from siguiendo s where s.id_articulo=a.id and s.login=:LOGIN) as estoy_siguiendo';

        $VALORES[':LOGIN'] = $login;
    }
}
// =================================================================================
// SE SIGUE CON EL SQL ...
// =================================================================================
$mysql .= ' FROM articulo a, categoria c where a.id_categoria=c.id';
// =================================================================================
// PRIMER NIVEL DE DECISIÓN: SE PIDEN DATOS DE UN REGISTRO CONCRETO O DE TODOS?
// =================================================================================
$ID = array_shift($RECURSO); // Se comprueba si se proporciona el id del registro
if(is_numeric($ID)) // Se debe devolver toda la información del registro
{
    switch (array_shift($RECURSO))
    {
        case 'preguntas': // SE PIDEN LAS PREGUNTAS DE UN ARTÍCULO CONCRETO
                // $mysql  = 'select * from pregunta where id_articulo=:ID_ARTICULO order by fecha_hora desc';
                $mysql  = 'select p.*,u.foto as foto_usuario from pregunta p, usuario u where id_articulo=:ID_ARTICULO and p.login=u.login order by fecha_hora desc';
                $VALORES = [];
            break;
        case 'fotos': // SE PIDEN LAS FOTOS DEL ARTÍCULO
                $mysql  = 'select id,fichero from foto where id_articulo=:ID_ARTICULO';
                $VALORES = [];
            break;
        default: // SE PIDE TODA LA INFORMACIÓN DE UN REGISTRO CONCRETO
                $mysql .= ' and a.id=:ID_ARTICULO';
                // SE INCREMENTA EL NÚMERO DE VECES VISTO
                $mysql2 = 'update articulo set veces_visto=veces_visto+1 where id=:ID_ARTICULO';
                $stmt  = $dbCon->prepare($mysql2);
                $stmt->execute([':ID_ARTICULO'=>$ID]); // execute query
            break;
    }
    $VALORES[':ID_ARTICULO'] = $ID;
}
else if( count($PARAMS) > 0 )
{
    // =================================================================================
    // SE AÑADE EL FILTRO EN FUNCIÓN DE LOS PARÁMETROS
    // =================================================================================
    $mysql = aplicarFiltro($mysql, $VALORES, $PARAMS, $db);
}
// =================================================================================
// CONSTRUIR LA PARTE DEL SQL PARA PAGINACIÓN
// =================================================================================
if(isset($PARAMS['pag']) && is_numeric($PARAMS['pag'])      // Página a listar
    && isset($PARAMS['lpag']) && is_numeric($PARAMS['lpag']))   // Tamaño de la página
{
    $pagina           = $PARAMS['pag'];
    $regsPorPagina    = $PARAMS['lpag'];
    $ELEMENTO_INICIAL = $pagina * $regsPorPagina;
    $SQL_PAGINACION   = ' LIMIT ' . $ELEMENTO_INICIAL . ',' . $regsPorPagina;
    // =================================================================================
    // Para sacar el total de coincidencias que hay en la BD:
    // =================================================================================
    $stmt  = $dbCon->prepare($mysql);
    $stmt->execute($VALORES); // execute query
    $TOTAL_COINCIDENCIAS = $stmt->rowCount();
    $stmt->closeCursor();
    $mysql .= $SQL_PAGINACION;
}
// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
$stmt = $dbCon->prepare($mysql);

if($stmt->execute($VALORES)) // execute query OK
{
    $RESPONSE_CODE  = 200;
    $R['RESULTADO'] = 'OK';
    $R['CODIGO']    = $RESPONSE_CODE;
    $FILAS          = [];

    if($TOTAL_COINCIDENCIAS > -1)
    {
        $R['TOTAL_COINCIDENCIAS']  = $TOTAL_COINCIDENCIAS;
        $R['PAGINA']               = $pagina;
        $R['REGISTROS_POR_PAGINA'] = $regsPorPagina;
    }
    while( $row = $stmt->fetch(PDO::FETCH_ASSOC) )
        $FILAS[] = $row;

    $stmt->closeCursor();
    $R['FILAS'] = $FILAS;
}
else
{
    $RESPONSE_CODE    = 500;
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['RESULTADO']   = 'ERROR' ;
    $R['DESCRIPCION'] = 'Se ha producido un error en el servidor al ejecutar la consulta.';
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