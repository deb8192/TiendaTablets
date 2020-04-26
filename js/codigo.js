// =================================================================================
// Funciones generales que se utilizan en distintas partes de la web
// =================================================================================

function mensajeModal(h2,p,f_boton,boton) {
    let html = '';
    html += '<article>';
    html +=   '<h2>'+h2+'</h2>';
    html +=   '<p>'+p+'</p>';
    html +=   '<footer class="modal"><button onclick="'+f_boton+'">'+boton+'</button></footer>';
    html += '</article>';
    crearModal(html);
}

function modalConfirmacion(h2,codigo,btnAceptar,btnCancelar) {
    let html = '';
    html += '<article>';
    html +=   '<h2>'+h2+'</h2>';
    html +=   codigo;
    html +=   '<footer class="modal">'+btnAceptar+'<button onclick="'+btnCancelar+'">Cancelar</button></footer>';
    html += '</article>';
    crearModal(html);
}

function crearModal(html) {
    let div = document.createElement('div');
    div.setAttribute('id','capa-fondo');
    div.innerHTML = html;
    document.body.appendChild(div);
    
    // Ocultamos las barras de desplazamiento
    document.body.setAttribute('style','overflow-x:hidden; overflow-y:hidden;');
}

function borraCodigoModal() {
    document.querySelector('#capa-fondo').remove();
    document.body.removeAttribute('style');
}

function cerrarMensajeModal(tipo, redirigir) {
    borraCodigoModal();

    if (tipo == '0') { // Login, nuevo articulo
        
        if (redirigir) // redirigimos en caso de login correcto y nuevo articulo creado
            window.location.replace("index.html");
        else // (solo para login) devuelve el foco al input 'login'
            document.querySelector("#login_name_lg").focus();

    } else if (tipo == '1') { // Preguntas
        if (redirigir)
            document.querySelector("#art-pre").value = '';
        else
            document.querySelector("#art-pre").focus();
    }
    else if (tipo == '2') { // Registro
        if (redirigir)
        {
            window.location.replace("login.html");
        }
        else // (solo para login) devuelve el foco al input 'login'
        {
            document.querySelector("#login_name").focus();
        }
    }
}
//-------------------------------------------------------------------
//              Funciones para la botonera de paginación
function prevPage()
{
    let base = 10,
    buscar = "buscar.html",
    str = window.location.pathname,
    actual = parseInt(document.querySelector("#actual").innerText, base);

    //Para cambiar de página no debemos estar en la primera
    if(actual > 1)
    {
        actual--;
        limpiarArticulosGrid();
        if(str.includes(buscar))
        {
            buscarArticulo(this,actual-1);
        }
        else obtenerArticulos(actual-1);
        
        obtenerTotalArticulos(actual);
    }
    return false;
}
function nextPage()
{
    let base = 10,
    buscar = "buscar.html",
    str = window.location.pathname,
    actual = parseInt(document.querySelector("#actual").innerText, base),
    lastPage = parseInt(document.querySelector("#lastPageNum").innerHTML, base);

    //Para cambiar de página no debemos estar en la primera
    if(actual < lastPage)
    {
        actual++;
        limpiarArticulosGrid();
        if(str.includes(buscar))
        {
            buscarArticulo(this,actual-1);
        }
        else obtenerArticulos(actual-1);
        
        obtenerTotalArticulos(actual);
    }
    return false;
}

function irPaginaEspecifica(pagina)
{
    buscar = "buscar.html",
    str = window.location.pathname,
    limpiarArticulosGrid();
    if(str.includes(buscar))
    {
        buscarArticulo(this,pagina-1);
    }
    else obtenerArticulos(pagina-1);
    obtenerTotalArticulos(pagina);
}

function hacerLogin(frm) {
    let url = 'api/usuarios/login',
        fd  = new FormData(frm);

    fetch(url, {method:'POST', 
        body:fd}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                    sessionStorage['usuario'] = JSON.stringify(datos);

                    // Texto del mensaje
                    mensajeModal('LOGIN',
                        'El usuario '+ datos.login +' se ha logueado correctamente.',
                        'cerrarMensajeModal(0,true);',
                        'Aceptar');
                });
            } else if(respuesta.status == 401) {
                
                    // Texto del mensaje
                    mensajeModal('LOGIN INCORRECTO',
                        'Usuario o contraseña incorrectos.',
                        'cerrarMensajeModal(0,false);',
                        'Cerrar');
            } else 
                console.log('Error en la petición fetch de login.');
        });
    return false; // Para no recargar la página
}

function comprobarLogin() {
    // Si esta logueado, no puede entrar a login ni a registro
    if ((sessionStorage['usuario']) &&
        ((document.body.getAttribute('data-pagina') == 'login') ||
        (document.body.getAttribute('data-pagina') == 'registro'))) {
            window.location.replace("index.html");
            
    } // Si no esta logueado, no puede entrar a nuevo
    else if ((!sessionStorage['usuario']) && 
        (document.body.getAttribute('data-pagina') == 'nuevo')) {
            window.location.replace("index.html");
    }
}


//Función que deshabilita cualquier elemento que se le pase
function deshabilitarElemento(elemento, value)
{
    elemento.disabled = value
}

//Función que deshabilita enlaces
function deshabilitarEnlaces(elemento, value)
{
    if(value)
    {
        elemento.className = "disabledLink";
    }
    else
    {
        elemento.className = "";
    }
}

function obtenerTotalPaginas(totalArticulos, actual) {
    let articulosPorPagina = 6,
    paginas = Math.trunc(totalArticulos/articulosPorPagina);
    resto = totalArticulos % articulosPorPagina;
    if(resto > 0)
    {
        paginas++;
    }
    paginacion(actual, paginas);
}

function paginacion(actual, last) {
    let html = '',
    anterior = actual-1,
    siguiente = actual+1,
    primera = 1,
    segunda = 2,
    tercera = 3;
    if(last<=0)
    {
        last=1;
    }
    let penultima = last - 1,
    antepenultima = penultima - 1;

    html+= '<li><a href="#" id="prev" onclick="return prevPage();" title="Anterior"><i class="flaticon-left-arrow"></i></a></li>'
    html+= '<li><a href="#" id="firstPage" onclick="return irPaginaEspecifica('+primera+');" title="Primera">Primera</a></li>'
    if(actual > tercera)
    {
        html+= '<li class="puntitos"><i class="flaticon-ellipsis"></i></li>'
    }
    if(actual > segunda)
    {
        html+= '<li><a href="#" onclick="return irPaginaEspecifica('+anterior+');" title="'+anterior+'">'+anterior+'</a></li>'
    }
    
    html+= '<li class="active"><span id="actual" title="'+actual+'">'+actual+' </span> de <span id="lastPageNumber">'+last+'</a></li>'   
    if(actual < penultima )
    {
        html+= '<li><a href="#" onclick="return irPaginaEspecifica('+siguiente+');" title="'+siguiente+'">'+siguiente+'</a></li>'
    }
    
    if(actual < antepenultima)
    {
        html+= '<li class="puntitos"><i class="flaticon-ellipsis"></i></li>'
    }
    html+= '<li><a href="#" id="lastPage" onclick="return irPaginaEspecifica('+last+');" title="&Uacute;ltima">&Uacute;ltima</a></li>'
    html+= '<li><a href="#" id="next" onclick="return nextPage();" title="Siguiente"><i class="flaticon-next"></i></a></li></ul>'
    html+= '<li id="lastPageNum" style="visibility: hidden;">'+last+'</li>'
    document.querySelector('.paginacion>ul').innerHTML = html;
    //Si hemos subido de la penúltima página a la última deshabilitamos next y lastPage
    if(actual == last)
    {
        document.querySelector("#next").href = '';
        document.querySelector("#lastPage").href = '';
        document.querySelector("#next").className = "disabledLink";
        document.querySelector("#lastPage").className = "disabledLink";
    }
    //Si estamos en la penultima pagina se habilita el ir a la página siguiente y a la última
    else if(actual == penultima)
    {
        document.querySelector("#next").href = '#';
        document.querySelector("#lastPage").href = '#';
        document.querySelector("#next").className = "";
        document.querySelector("#lastPage").className = "";
    }
    //Si hemos llegado a la primera página, prev y firstPage se deshabilitan
    if(actual == primera)
    {
        document.querySelector("#prev").href = '';
        document.querySelector("#firstPage").href = '';
        document.querySelector("#prev").className = "disabledLink";
        document.querySelector("#firstPage").className = "disabledLink";
    }
    
    //Si estamos en la segunda pagina se habilita el ir a la página anterior y a la primera
    else if(actual == segunda)
    {
        document.querySelector("#prev").href = '#';
        document.querySelector("#firstPage").href = '#';
        document.querySelector("#prev").className = "";
        document.querySelector("#firstPage").className = "";
    }
}

function menu() {
    comprobarLogin();
    let html = '';

    if (document.body.getAttribute('data-pagina') != 'inicio')
        html += '<li><a href="index.html" title="Inicio"><i class="flaticon-home"></i> <span>Inicio</span></a></li>';
    
    if (document.body.getAttribute('data-pagina') != 'buscar')
        html += '<li><a href="buscar.html" title="Buscar"><i class="flaticon-loupe"></i> <span>Buscar</span></a></li>';

    if(sessionStorage['usuario']) {
        if (document.body.getAttribute('data-pagina') != 'nuevo')
            html += '<li><a href="nuevo.html" title="Nuevo"><i class="flaticon-plus"></i> <span>Nuevo</span></a></li>';
        
        let usu = JSON.parse(sessionStorage['usuario']);
        html += `<li onclick="logout();" class="logout"><i class="flaticon-logout"></i> <span>Logout (${usu.nombre})</span></li>`;
    
    } else {
        if (document.body.getAttribute('data-pagina') != 'login')
        html += '<li><a href="login.html" title="Login"><i class="flaticon-enter"></i> <span>Login</span></a></li>';

        if (document.body.getAttribute('data-pagina') != 'registro')
            html += '<li><a href="registro.html" title="Registro"><i class="flaticon-id-card"></i> <span>Registro</span></a></li>';
    }

    document.querySelector('body>header>nav>ul').innerHTML = html;
}

// Logout, los datos de sessionStorage se borran y en la BD borramos el token de dicho usuario
function logout() {
    let url = 'api/usuarios/logout',
        usu = JSON.parse(sessionStorage['usuario']);

        fetch(url, {method:'POST',
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos) {
                    console.log(datos);
                    delete sessionStorage['usuario'];
                    window.location.replace("index.html");
                });
            } else 
                console.log('Error al intentar hacer logout.');
        });
}

// Rellena el select de categorias que hay en buscar y el datalist de nuevo articulo
function pedirCategorias(buscar) {
    let url="api/categorias";

    fetch(url).then(function(respuesta) {
        if(respuesta.ok) { 
            respuesta.json().then(function(datos) {
                console.log(datos);
                if (datos.RESULTADO == 'OK') {
                    let html = '';
                    datos.FILAS.forEach(function(e) {
                        if (!buscar)    // opcion para el datalist
                            html += `<option id="${e.id}" value="${e.nombre}">`;
                        else            // opcion para el select
                            html += `<option value="${e.id}">${e.nombre}</option>`;
                    });
                    document.querySelector('#categorias').innerHTML = html;
                } else
                    console.log('ERROR: ' + datos.DESCRIPCION);
            });
        } else
            console.log('Error en la petición fetch');
    });
}

// Cambia la imagen por defecto que hay en registro.html y nuevo.html
function cambiarFoto(inp) {
    let fr = new FileReader();
    fr.onload = function() {
        if (inp.files[0].size <= 300000) //bytes -> 300KB 
            inp.parentNode.querySelector('img').src = fr.result;
        else
            mensajeModal('IMAGEN',
                'El tamaño de la imagen debe ser inferior a 300KB.',
                'borraCodigoModal();',
                'Aceptar');
    };
    fr.readAsDataURL(inp.files[0]);
}


// =================================================================================
// Funciones para crear un nuevo articulo
// =================================================================================

// Crea las fichas para subir fotos, la primera llamada es desde la pagina y no abre el inputfilereader
function crearNuevaFicha(abrirInput) {

    let html = '<img src="fotos/no-img.jpg" alt="Foto nueva" onclick="this.parentNode.querySelector(\'input\').click();"/>';
        html += '<input type="file" accept="image/*" onchange="cambiarFoto(this);">';
        html += '<button title="Añadir foto" onclick="this.parentNode.querySelector(\'input\').click();"><i class="flaticon-plus"></i></button>';
        html += '<button title="Eliminar foto" onclick="eliminarFicha(this);"><i class="flaticon-trash"></i></button>';

    let div = document.createElement('div');
    div.innerHTML = html;
    document.querySelector('#add-img').insertBefore(div, document.querySelector('#add-img').querySelector('.cam'));

    // Para cuando se llame desde el boton "Anyadir foto"
    if (abrirInput)
        div.querySelector('input').click();
}

// Elimina la ficha seleccionada
function eliminarFicha(boton) {
    boton.parentNode.remove();
}

// Comprueba si hay fotos para enviar en el nuevo articulo y las guarda en un array
function comprobarFotos() {
    let fichas = document.querySelector('#add-img').querySelectorAll('div');
    var fotos = [];

    if (fichas.length > 0) {
        for (var i = 0; i < fichas.length; i++) {
            let foto = fichas[i].querySelector('input').files[0];
            if (foto != null)
                fotos.push(foto);
        }
    }
    return fotos;
}

// Crea el nuevo articulo 
function crearNuevoArticulo(frm) {

    let url = 'api/articulos/',
    fd  = new FormData(frm),
    usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'POST', 
        body:fd,
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                
                    // Comprobamos si hay alguna foto seleccionada para subirla al server
                    let fotos = comprobarFotos();
                    if (fotos.length > 0) {
                        let foto = 0;
                        let continuar = true;
                        while (foto < fotos.length && continuar) {

                            enviarFoto(datos.ID, fotos[foto])
                                .then(() => {}, // Si todo va bien, no hacemos nada
                                function(err){
                                    continuar = false;
                                    console.log(err.status+': '+err.statusText);
                                });
                            foto++;
                        }
                    }
                    mensajeModal('NUEVO ARTICULO',
                        'Se ha guardado correctamente el artículo',
                        'cerrarMensajeModal(0,true);',
                        'Aceptar');
                });
            } else
                console.log('Error en la petición fetch de nuevo artículo.');
        });
    return false; // Para no recargar la página
}

// Envia 1 foto al servidor y le pasa el resultado a crearNuevoArticulo(frm)
function enviarFoto(id, foto) {
    return new Promise(function(todoOK, hayError) {

        let url = 'api/articulos/'+id+'/foto',
            fd  = new FormData(),
            usu = JSON.parse(sessionStorage['usuario']);

        fd.append('fichero', foto);

        fetch(url, {method:'POST', 
            body:fd,
            headers:{'Authorization':usu.login + ':' + usu.token}})
            .then(function(r) {
                if(r.ok) {
                    todoOK(r);
                } else
                    hayError(r);
            });
    });
}


// =================================================================================
// Funciones para ver y manejar un articulo existente
// =================================================================================

// Función que comprueba que hay ID en la url del articulo
function comprobarID() {
    let id = getIdArticulo();
    if(id == null)
    {
        window.location.replace("index.html");
    }
}

// Boton Seguir/Dejar de seguir
function crearBotonSeguir(seguir) {
    let candado = 'unlock',
        texto   = 'Seguir';

    if (seguir == 1) {
        candado = 'lock';
        texto   = 'Dejar de seguir';
    }
    
    let p = document.createElement('p');
    p.setAttribute('id','seguir');
    p.setAttribute('onclick','seguirArticulo(this);');
    p.setAttribute('data-seguir',seguir);
    p.innerHTML = `<i class="flaticon-${candado}"></i> ${texto}`;
    
    // Recojemos el boton de preguntas y le insertamos antes el boton de seguir
    let btn_preg = document.querySelector('#padre').querySelector('a');
    document.querySelector('#padre').insertBefore(p,btn_preg);
}

// Cambia al instante el boton y en la BD, el valor de seguir o no el articulo
function seguirArticulo(boton) {
    let seg = boton.getAttribute('data-seguir');
    let etqUser = document.querySelector('.flaticon-user');
    let nSeguidores = parseInt(etqUser.innerText);

    if (seg == '0') {
        seguir = true;
        texto   = 'Dejar de seguir';
        candado = 'lock';
        seg     = '1';
        nSeguidores++;
    } else {
        seguir = false,
        texto   = 'Seguir',
        candado = 'unlock';
        seg     = '0';
        nSeguidores--;
    }

    let url = 'api/articulos/'+getIdArticulo()+'/seguir/'+seguir,
        usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'POST',
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                    boton.setAttribute('data-seguir',seg);
                    boton.innerHTML = 
                        `<i class="flaticon-${candado}"></i> ${texto}`;
                    etqUser.innerText = nSeguidores;
                });
            } else 
                console.log('Error en la petición fetch de seguir artículo.');
        });
}
function enviarRespuesta(frm) {
    let idPreguntaDividido = frm.id.split("-"),
    idNum = idPreguntaDividido[1];

    let url = 'api/preguntas/'+idNum+'/respuesta',
    fd  = new FormData(frm),
    usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'POST', 
        body:fd,
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) { 
                mensajeModal('RESPUESTA',
                    'Respuesta guardada correctamente.',
                    'cerrarMensajeModal(1,true);',
                    'Cerrar');

                    let i = document.querySelector("#preguntas_respuestas").children.length-1;
                    while(i >= 0)
                    {
                        if(document.querySelector("#preguntas_respuestas").children[i].tagName == "ARTICLE")
                        {
                            document.querySelector("#preguntas_respuestas").children[i].remove();
                        }
                        i--;
                    }                
                    pedirPreguntas(getIdArticulo());
            } else
                mensajeModal('RESPUESTA',
                    'No se ha podido guardar la respuesta.',
                    'cerrarMensajeModal(1,false);',
                    'Cerrar');
        });
    return false; // Para no recargar la página
}
function hacerPregunta(frm) {

    let url = 'api/articulos/'+getIdArticulo()+'/pregunta',
        fd  = new FormData(frm),
        usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'POST', 
        body:fd,
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) { // TODO repe temporalmente
                mensajeModal('PREGUNTA',
                'Pregunta guardada correctamente.',
                'cerrarMensajeModal(1,true);',
                'Cerrar');
            } else
                mensajeModal('PREGUNTA',
                    'No se ha podido guardar la pregunta.',
                    'cerrarMensajeModal(1,false);',
                    'Cerrar');
        });
    return false; // Para no recargar la página
}

function crearFormPreguntas() {
    let div = document.querySelector('#form_preguntas');
    let html = '';
    if (sessionStorage['usuario']) {
        // TODO codigo temporal, se tiene que hacer una llamada ajax/fetch para acceder a un fichero.html
        html +=  '<p><textarea name="texto" id="art-pre" placeholder="Preguntar..." required autofocus></textarea></p>';
        html +=  '<input type="submit" value="Enviar"/>';

        let frm = document.createElement('form');
        frm.setAttribute('onsubmit','return hacerPregunta(this);');
        frm.innerHTML = html;
        div.appendChild(frm);

    } else {
        html = 'Debes hacer ';
        html += '<a href="login.html" title="Login">login</a>' ;
        html += ' para poder dejar una pregunta al vendedor.';

        let p = document.createElement('p');
        p.innerHTML = html;
        div.appendChild(p);
    }
}
function enviar_formulario(){
    document.formulario1.submit();
 }
// TO DO
function anyadirInfoArticulo(nombre, descripcion, precio, veces_visto, 
    vendedor, imagen, nfotos, nsiguiendo, npreguntas, seguir, propietario) {
    
    let html = '';
    let mainArt = document.querySelector('#articulo_principal');

    mainArt.querySelector('h1').innerHTML = nombre;

    if (propietario) {
        html += '<button title="Modificar" onclick="modificarArt();"><i class="flaticon-pencil"></i></button>';
        html += '<button title="Eliminar" onclick="eliminarArt();"><i class="flaticon-trash"></i></button>';
        let span = document.createElement('span');
        span.innerHTML = html;
        mainArt.querySelector('h1').appendChild(span);
    }

    html = `<h2>Vendido por: <a id="vendedor" href="buscar.html?login=${vendedor}">${vendedor}</a></h2>`;
    html += `<i class="flaticon-eye"> ${veces_visto}</i>`;
    mainArt.querySelector('.vendedor').innerHTML = html;

    html = `<ul id="fotosArticulo"><li><img src="fotos/articulos/${imagen}" alt="${nombre}"></img></li></ul>`;
    html += `<span id="fotoActiva" style="display: none">0</span>`;
    mainArt.querySelector('#fotos_articulo').innerHTML = html;

    mainArt.querySelector('.flaticon-gallery').innerHTML = ` <span id="fotoSeleccionada">1</span>/${nfotos}`;
    mainArt.querySelector('.flaticon-user').innerHTML = `${nsiguiendo}`;
    
    html = `<p id="precio">${precio} €</p>`;
    html += `<a href="#preguntas_respuestas">? ${npreguntas}</a>`;
    mainArt.querySelector('#padre').innerHTML = html;

    let p = document.createElement('p');
    p.setAttribute('id','descp');
    p.innerHTML = descripcion;

    mainArt.querySelector('section article').appendChild(p);

    if (seguir != null)
        crearBotonSeguir(seguir);
}

function getIdArticulo() {
    return new URLSearchParams(window.location.search).get('id');
}
function getVendedorArticulo() {
    return new URLSearchParams(window.location.search).get('login');
}
function getTextoArticulo() {
    return new URLSearchParams(window.location.search).get('texto');
}

// TO DO
function pedirInfoArticulo() {

    let url = 'api/articulos/'+getIdArticulo(),
        init = null;

    if (sessionStorage['usuario']) {
        usu = JSON.parse(sessionStorage['usuario']);
        // method get es por defecto y body no hace falta
        init = { headers:{'Authorization':usu.login + ':' + usu.token} };
    }

    // la cabecera con el login hace que aparezca el campo 'estoy_siguiendo'
    fetch(url, init).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                let articulo = datos.FILAS[0];
                let propietario = false;

                if ((init != null) && (usu.login == articulo.vendedor))
                    propietario = true;

                anyadirInfoArticulo(articulo.nombre, articulo.descripcion, articulo.precio,
                    articulo.veces_visto, articulo.vendedor, articulo.imagen, articulo.nfotos,
                    articulo.nsiguiendo, articulo.npreguntas, articulo.estoy_siguiendo, propietario);

                //articulo.fecha, articulo.categoria, articulo.foto_vendedor
                    
                obtenerFotosArticulo(getIdArticulo()); 
                pedirPreguntas(getIdArticulo());
            });
        } else
            console.log('Error en la petición fetch');
    });
}

//Función que obtiene las preguntas del servidor
function pedirPreguntas(id)
{
    let url = 'api/articulos/'+id+'/preguntas';

    fetch(url).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                for(let i = 0; i < datos.FILAS.length; i++)
                {
                    let preg = datos.FILAS[i];
                    crearPregunta(preg.login, preg.fecha_hora, preg.pregunta, preg.respuesta, preg.id);
                }
            });
        } else
            console.log('Error en la petición fetch');
    });
}

//Función que genera las preguntas con los datos del servidor
function crearPregunta(usuario, fecha_hora, pregunta, respuesta, idPregunta)
{
    let html = '',
    preg = document.createElement('article'),
    fecha = obtenerFecha(fecha_hora),
    hora = obtenerHora(fecha_hora),
    usu = ''; 
    if(sessionStorage['usuario'])
    {
        usu = JSON.parse(sessionStorage['usuario']);
    }

    html = `<h3>Pregunta</h3>`;
    html += `<div><p>Autor: ${usuario}.</p><time datetime="${fecha_hora}">${fecha}, a las ${hora}h</time></div>`;
    html += `<p class="pregunta">${pregunta}</p>`;
        
    if(respuesta != null)
    {
        html += `<h4>Respuesta</h4>`;
        html += `<p class="respuesta">${respuesta}</p>`;
    }
    else if(usu != '' && usu.login == document.querySelector("#vendedor").innerText)
    {
        html += `<form id="responder-${idPregunta}" onsubmit="return responderPregunta(this);">`;
        html += `<input type="submit" value="Responder"></form>`;
    }
    
    preg.innerHTML = html;
    document.querySelector('#preguntas_respuestas').append(preg);
}

//Función que genera el formulario de respuesta de preguntas
function responderPregunta(frm)
{
    let html = '',
    idForm = frm.id,
    section = document.querySelector('#preguntas_respuestas'),
    article = '',
    h4 = document.createElement("h4"),
    form = document.createElement("form");

    for (let i = 0; i < section.children.length; i++)
    {
        if(section.children[i].tagName == "ARTICLE" && section.children[i].lastChild.id == idForm)
        {
            article = section.children[i];
        }
    }
    article.lastChild.remove();
    
    form.id = idForm;
    form.setAttribute("onsubmit", "return enviarRespuesta(this);");

    h4.innerText = `Respuesta`;
    article.append(h4);
    html = `<p><textarea name="texto" placeholder="Respuesta" class="respuesta"></textarea></p>`;
    html += `<input type="submit" value="Responder">`;

    
    form.innerHTML = html;
    article.append(form);
    return false;
}

function obtenerFecha(fecha_hora)
{
    let fecha = '',
    fechaYHora = fecha_hora.split(" ");

    fechaPartida = fechaYHora[0].split("-");
    for(let i = fechaPartida.length - 1; i >= 0 ; i--)
    {
        if(i == 1)
        {
            mes = parseInt(fechaPartida[i]);
            switch (mes)
            {
                case 1:
                fecha += "-enero";
                break;

                case 2:
                fecha += "-febrero";
                break;

                case 3:
                fecha += "-marzo";
                break;

                case 4:
                fecha += "-abril";
                break;

                case 5:
                fecha += "-mayo";
                break;

                case 6:
                fecha += "-junio";
                break;

                case 7:
                fecha += "-julio";
                break;

                case 8:
                fecha += "-agosto";
                break;

                case 9:
                fecha += "-septiembre";
                break;

                case 10:
                fecha += "-octubre";
                break;

                case 11:
                fecha += "-nobiembre";
                break;

                case 12:
                fecha += "-diciembre";
                break;
            }
        }
        else
        {
            switch (i)
            {
                case 2:
                    fecha += fechaPartida[i];
                    break;
                case 0:
                    fecha += "-"+fechaPartida[i];
            }
        }
    }
    return fecha;
}
function obtenerHora(fecha_hora)
{
    let fechaYHora = fecha_hora.split(" "),
    hora = fechaYHora[1].split(":");
    horaArreglada = hora[0]+":"+hora[1];
    return horaArreglada;
}

function obtenerFotosArticulo(id)
{
    let url = 'api/articulos/'+id+'/fotos';

    fetch(url).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                for(i = 0; i < datos.FILAS.length; i++)
                {
                    if(i > 0)
                    {
                        let art = datos.FILAS[i], 
                        foto = document.createElement('li');
                        foto.innerHTML = `<img src="fotos/articulos/${art.fichero}" alt="${document.querySelector('h1').innerText}"style="display: none"></img></li>`;
                        document.querySelector('#fotosArticulo').append(foto);
                    }
                }
            });
        }
        else
        console.log('Error en la petición fetch');
    });
}

// Para eliminar un articulo, se abrira primero un modal para pedir confirmacion al usuario
function eliminarArt() {
    modalConfirmacion('ELIMINAR ARTICULO',
        '<p>¿Está seguro que desea eliminar el artículo?</p>',
        '<button onclick="borrarArtServer();">Aceptar</button>',
        'borraCodigoModal();');
}

function borrarArtServer() {
    let url = 'api/articulos/'+getIdArticulo(),
        usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'DELETE', 
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                    window.location.replace("index.html");
                });
            }
        });
}

function modificarArt() {
    let precio = document.querySelector('#precio').innerHTML.replace(' €','');
    let descp = document.querySelector('#descp').innerHTML.replace(/<br>/gi,'\r');
    let html = '<form id="modArt" onsubmit="modificarArtServer(this); return false;">';
        html += '<p>Nuevo precio:</p>';
        html += `<input type="number" id="prec" name="precio" min="0" max="9999" value="${precio}" step="0.01" required> €`;
        html += '<p>Nueva descripción:</p>';
        html += `<textarea maxlength="300" name="descripcion" required>${descp}</textarea>`;
        html += '</form>';

    modalConfirmacion('MODIFICAR ARTICULO',
        html,
        '<button type="submit" form="modArt">Aceptar</button>',
        'borraCodigoModal();');
}

function modificarArtServer(frm) {
    console.log(frm.descripcion.value);
    let url = 'api/articulos/'+getIdArticulo(),
    fd  = new FormData(frm),
    usu = JSON.parse(sessionStorage['usuario']);

    fetch(url, {method:'POST', 
        body:fd,
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) {
                document.querySelector('#precio').innerHTML = frm.precio.value+' €';
                document.querySelector('#descp').innerHTML = frm.descripcion.value.replace(/\n/gi,'<br>');;

                borraCodigoModal();
                mensajeModal('MODIFICAR ARTICULO',
                    'Se ha modificado correctamente el artículo',
                    'borraCodigoModal();',
                    'Aceptar');
            } else
                console.log('Error en la petición fetch de modificar artículo.');
        });
}

function moverFotoArticulo(adelante)
{
    let base = 10,
    selector = parseInt(document.querySelector("#fotoActiva").innerHTML, base),
    mainArt = document.querySelector('#articulo_principal');
    if(adelante && selector < document.querySelector("#fotosArticulo").children.length -1)
    {
        document.querySelector("#fotosArticulo").children[selector].querySelector("img").style.display="none";
        selector++;
        document.querySelector("#fotosArticulo").children[selector].querySelector("img").style.display="block";
        document.querySelector("#fotoActiva").innerHTML = selector;
        document.querySelector("#fotoSeleccionada").innerHTML = selector+1;
    }
    else if(!adelante && selector > 0)
    {
        document.querySelector("#fotosArticulo").children[selector].querySelector("img").style.display="none";
        selector--;
        document.querySelector("#fotosArticulo").children[selector].querySelector("img").style.display="block";
        document.querySelector("#fotoActiva").innerHTML = selector;
        document.querySelector("#fotoSeleccionada").innerHTML = selector+1;
    }
}


// =================================================================================
// Funciones para manejar registro
// =================================================================================

// Al resetear el form de registro, esto pone la imagen de usuario por defecto
function limpiarFotoRegistro() {
    document.querySelector('label img').src = "fotos/user-img.png";
}

//Se comprueba si el login está disponible o no
function comprobarDisponibilidad(login) {
    if(login.value)
    {
        let url = "api/usuarios/";
        url += login.value;

        fetch(url).then(function(respuesta) {
            if(respuesta.ok)
            {
                respuesta.json().then(function(datos) {
                    console.log(datos);
                    if(!datos.DISPONIBLE)
                    {
                        let elemento = document.getElementById ("registroSubmit");
                        deshabilitarElemento(elemento, true);
                        if(document.getElementById("registro").getElementsByTagName("p")[0].getElementsByClassName("loginUsado").length == 0)
                        {
                            document.getElementById("registro").getElementsByTagName("p")[0].appendChild(crearSpanTexto("El login introducido no se encuentra disponible", "loginUsado"));
                        }
                    }
                    else
                    {
                        let elemento = document.getElementById ("registroSubmit");
                        deshabilitarElemento(elemento, false);
                        if(document.getElementById("registro").getElementsByTagName("p")[0].getElementsByClassName("loginUsado").length > 0)
                        {
                            let span = document.getElementById("registro").getElementsByTagName("p")[0];
                            span.lastChild.remove();
                        }
                    }
                });
            } else
                console.log('Error en la petición fetch');

        });
    }
}
function crearSpanTexto(texto, className)
{
    let span = document.createElement("span");
    span.innerHTML = texto;
    span.setAttribute("class", className);
    span.style.color = "#f00";
    return span;
}

function comprobarContraseñas()
{
    let password1 = document.getElementById("password");
    let password2 = document.getElementById("password2");
    if(password1.value && password2.value)
    {
        if(password1.value != password2.value)
        {
            let elemento = document.getElementById ("registroSubmit");
            deshabilitarElemento(elemento, true);
            if(document.getElementById("registro").getElementsByTagName("p")[2].getElementsByClassName("contrasennasDistintas").length == 0)
            {
                document.getElementById("registro").getElementsByTagName("p")[2].appendChild(crearSpanTexto("Las contrase&ntilde;as no coinciden", "contrasennasDistintas"));
            }
        }
        else
        {
            let elemento = document.getElementById ("registroSubmit");
            deshabilitarElemento(elemento, false);
            if(document.getElementById("registro").getElementsByTagName("p")[2].getElementsByClassName("contrasennasDistintas").length > 0)
            {
                let span = document.getElementById("registro").getElementsByTagName("p")[2];
                span.lastChild.remove();
            }
        }
    }
}
function limpiarRegistro()
{
    document.querySelector("#login_name").value = "";
    document.querySelector("#password").value = "";
    document.querySelector("#password2").value = "";
    document.querySelector("#nombre").value = "";
    document.querySelector("#apellidos").value = "";
    document.querySelector("#email").value = "";
    limpiarFotoRegistro();
}

function registro(frm)
{
    let url = 'api/usuarios/registro',
    fd = new FormData(frm);

    fetch(url, {method:'POST', body:fd}).then(function(respuesta){
        if(respuesta.ok) {
            respuesta.json().then(function(datos){
                limpiarRegistro();

                // Texto del mensaje
                mensajeModal('REGISTRO',
                    'El usuario '+ datos.LOGIN +' se ha registrado correctamente.',
                    'cerrarMensajeModal(2,true);',
                    'Aceptar');
            });
        } else if(respuesta.status == 422) {
            
                // Texto del mensaje
                mensajeModal('REGISTRO INCORRECTO',
                    'Las contraseñas no coinciden.',
                    'cerrarMensajeModal(2,false);',
                    'Cerrar');
        } else 
            console.log('Error en la petición fetch de login.');
    });
    
    return false;
}

// =================================================================================
// Funciones para manejar index
// =================================================================================

function crearArticulo(id, nombre, descripcion, precio, fecha, veces_visto, imagen, nfotos, nsiguiendo) {
    html = `<a href="articulo.html?id=${id}" title="${nombre}">`;
    html +=  `<img src="fotos/articulos/${imagen}" alt="${nombre}">`;
    html += '<div>';
    html += `<i class="flaticon-eye"> ${veces_visto}</i>`;
    html += `<i class="flaticon-gallery"> ${nfotos}</i>`;
    html += '</div>';
    html += `<h2>${nombre}</h2>`;
    html += '<div>';
    html += `<p>${precio} €</p>`;
    html += `<i class="flaticon-user"> ${nsiguiendo}</i>`;
    html += '</div>';
    html += `<p>${descripcion}</p></a>`;

    let article = document.createElement('article');
    article.innerHTML = html;
    document.querySelector('.grid').appendChild(article);
}

function obtenerArticulos(pagina) {
    let url = 'api/articulos?pag='+pagina+'&lpag=6';

    // method get es por defecto y body no hace falta
    fetch(url).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                datos.FILAS.forEach(function(art) {
                    // Pasamos la descripcion sin <br>, gi es para que busque en todo el texto y que no distinga mayus de minus
                    crearArticulo(art.id, art.nombre, art.descripcion.replace(/<br>/gi,''), art.precio, 
                        art.fecha, art.veces_visto, art.imagen, art.nfotos, art.nsiguiendo);
                });
            });
        } else
            console.log('Error en la petición fetch');
    }); 
}

function obtenerTotalArticulos(actual) {

    let url = 'api/articulos',
    totalArticulos = 0;

    // method get es por defecto y body no hace falta
    fetch(url).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                totalArticulos = datos.FILAS.length;
                obtenerTotalPaginas(totalArticulos, actual);
            });
        }
        else
            console.log('Error en la petición fetch');
    });
}
function obtenerTotalArticulosBuscar(actual, url) {

    totalArticulos = 0;

    // method get es por defecto y body no hace falta
    fetch(url).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                totalArticulos = datos.FILAS.length;
                obtenerTotalPaginas(totalArticulos, actual);
            });
        }
        else
            console.log('Error en la petición fetch');
    });
}


// =================================================================================
// Funciones para manejar buscar
// =================================================================================

function buscarArticulo(frm,pagina)
{
    let url = 'api/articulos?pag='+pagina+'&lpag=6',
    usuario = false;
    fd = new FormData();

    if(frm.texto.value)
    {
        url += '&t='+frm.texto.value;
    }
    if(frm.desde.value)
    {
        url += '&pd='+frm.desde.value;
    }
    if(frm.hasta.value)
    {
        url += '&ph='+frm.hasta.value;
    }
    if(frm.categorias.value)
    {
        url += '&c='+frm.categorias.value;
    }
    if(frm.textoVendedor.value)
    {
        url += '&v='+frm.textoVendedor.value;
    }
    if(frm.artFollow.checked)
    {
        url += '&siguiendo';
        usuario = true;
    }
    if(frm.artMe.checked)
    {
        url += '&mios';
        usuario = true;
    }
    if(document.querySelector('.grid').children.length > 0)
    {
        limpiarArticulosGrid();
    }
    if(usuario && sessionStorage['usuario'])
    {
        usu = JSON.parse(sessionStorage['usuario']);
            // method get es por defecto y body no hace falta
            init = { headers:{'Authorization':usu.login + ':' + usu.token} };

        fetch(url, init).then(function(respuesta) {
            mostrarArticulosBuscar(respuesta);
        });
        obtenerTotalArticulosBuscar(pagina+1, url);
    }

    else {
        fetch(url).then(function(respuesta) {
            mostrarArticulosBuscar(respuesta);
        });
        obtenerTotalArticulosBuscar(pagina+1, url);
    }

    return false; // Para no recargar la página
}

function mostrarArticulosBuscar(respuesta)
{
    if(respuesta.ok)
    {
        respuesta.json().then(function(datos){
                datos.FILAS.forEach(function(art) {
                    // Pasamos la descripcion sin <br>, gi es para que busque en todo el texto y que no distinga mayus de minus
                    crearArticulo(art.id, art.nombre, art.descripcion.replace(/<br>/gi,''), art.precio, 
                        art.fecha, art.veces_visto, art.imagen, art.nfotos, art.nsiguiendo);
                });
        });
    }
    else
    {
        console.log('Error en la petición fetch');
    }
    return false; // Para no recargar la página
}

function limpiarArticulosGrid()
{
    while(document.querySelector('.grid').children.length > 0)
    {
        document.querySelector('.grid').firstChild.remove();
    }
}

function rellenarBuscarConUrl()
{
    let textoArticulo = getTextoArticulo(),
    loginVendedor = getVendedorArticulo(),
    buscar = false;
    
    if(textoArticulo)
    {
        document.querySelector('#texto').value = textoArticulo;
        buscar = true;
    }
    if(loginVendedor)
    {
        document.querySelector('#textoVendedor').value = loginVendedor;
        buscar = true;
    }
    if(buscar)
    {
        buscarArticulo(document.querySelector('body>main>section>form'),0);
    }
    return false; // Para no recargar la página
}

function irABuscar(frm)
{
    if(frm.busqueda.value)
    {
        let url = "buscar.html?texto="+frm.busqueda.value;
        //url = url.substring(0, url.length);
        window.location.replace(url);
    }
    return false;
}