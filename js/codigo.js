// =================================================================================
// Funciones generales que se utilizan en distintas partes de la web
// =================================================================================

function mensajeModal(h2,p,f_boton,boton) {
    let html = '';
    html += '<article>';
    html +=   '<h2>'+h2+'</h2>';
    html +=   '<p>'+p+'</p>';
    html +=   '<footer><button onclick="'+f_boton+'">'+boton+'</button></footer>';
    html += '</article>';

    let div = document.createElement('div');
    div.setAttribute('id','capa-fondo');
    div.innerHTML = html;
    document.body.appendChild(div);
    
    // Ocultamos las barras de desplazamiento
    document.body.setAttribute('style','overflow-x:hidden; overflow-y:hidden;');
}

function cerrarMensajeModal(tipo, redirigir) {
    document.querySelector('#capa-fondo').remove();
    document.body.removeAttribute('style');

    if (tipo == '0') { // Login
        // Login correcto, redirigimos a index
        if (redirigir)
            window.location.replace("index.html");
        else // si nos, devolvemos el foco al input de login
            document.querySelector("#login_name_lg").focus();

    } else if (tipo == '1') { // Preguntas
        if (redirigir)
            document.querySelector("#art-pre").value = '';
        else
            document.querySelector("#art-pre").focus();
    }
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
                        'No se ha podido loguear.',
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
                'cerrarMensajeModal(2,true);', // valores que no hacen nada
                'Aceptar');
    };
    fr.readAsDataURL(inp.files[0]);
}


// =================================================================================
// Funciones para crear un nuevo articulo
// =================================================================================

// Crea las fichas para subir fotos, la primera llamada es desde la pagina y no abre el inputfilereader
function crearNuevaFicha(abrirInput) {

    let html = '<img src="img/no-img.jpg" alt="Foto nueva" onclick="this.parentNode.querySelector(\'input\').click();"/>';
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
function comprobarFotos(fichas) {
    var fotos = [];
    for (var i = 0; i < fichas.length; i++) {
        let foto = fichas[i].querySelector('input').files[0];
        if (foto != null)
            fotos.push(foto);
    }
    return fotos;
}

// Crea el nuevo articulo pero antes comprueba que al menos tenga 1 foto seleccionada
function crearNuevoArticulo(frm) {
    try {
        // Comprobamos si hay fichas de fotos antes de enviar los datos del articulo
        let fichas = document.querySelector('#add-img').querySelectorAll('div');
        if (fichas.length > 0) {

            // Comprobamos si tienen alguna foto seleccionada
            let fotos = comprobarFotos(fichas);
            if (fotos.length > 0) {
                let url = 'api/articulos/',
                fd  = new FormData(frm),
                usu = JSON.parse(sessionStorage['usuario']);

                fetch(url, {method:'POST', 
                    body:fd,
                    headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

                        if(respuesta.ok) {
                            respuesta.json().then(function(datos){
                                
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

                               mensajeModal('NUEVO ARTICULO',
                                    'Se ha guardado correctamente el artículo',
                                    'cerrarMensajeModal(0,true);',
                                    'Aceptar');
                            });
                        } else
                            throw 'errFetchNA';
                    });
            } else {
                throw 'errorNoHayFoto';
            }
        } else {
            throw 'errorNoHayFoto';
        }
    } catch(e) {
        if(e == 'errorNoHayFoto') {
            mensajeModal('NUEVO ARTICULO',
                'Debe elegir al menos 1 foto del artículo.',
                'cerrarMensajeModal(2,false);',
                'Aceptar');
        } else if (e == 'errFetchNA') {
            console.log('Error en la petición fetch de nuevo artículo.');
        }
    } finally {
        return false; // Para no recargar la página
    }
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
function crearBotonSeguir() {
    if (sessionStorage['usuario']) {
        // TODO: flaticon-lock
        // Boton Seguir/Dejar de seguir
        let p = document.createElement('p');
        p.setAttribute('id','seguir');
        p.innerHTML = '<i class="flaticon-unlock" onclick="seguirArticulo();"></i> Seguir';
        
        // Recojemos el boton de preguntas y le insertamos antes el boton de seguir
        let btn_preg = document.querySelector('#padre').querySelector('a');
        document.querySelector('#padre').insertBefore(p,btn_preg);
    }
}

function seguirArticulo() {
    let id = 1;
    let url = 'api/articulos/'+id+'/seguir/true',
        usu = JSON.parse(sessionStorage['usuario']); // TODO: comprobar si está logueado

    fetch(url, {method:'POST',
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                    console.log(datos);
                });
            } else 
                console.log('Error en la petición fetch de seguir artículo.');
        });
}

function hacerPregunta(frm) {
    let id = 1;
    let url = 'api/articulos/'+id+'/pregunta',
        fd  = new FormData(frm),
        usu = JSON.parse(sessionStorage['usuario']); // TODO: comprobar q esta

    fetch(url, {method:'POST', 
        body:fd,
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){

            if(respuesta.ok) { // TODO repe temporalmente
                respuesta.json().then(function(datos){
                    mensajeModal('PREGUNTA',
                    'Pregunta guardada correctamente.',
                    'cerrarMensajeModal(1,true);',
                    'Cerrar');
                });
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

// TO DO
function pedirInfoArticulo() {
    let url = 'api/articulos/1',
        usu = JSON.parse(sessionStorage['usuario']),
        cabecera;

    cabecera = usu.login + ':' + usu.token;

    // method get es por defecto y body no hace falta
    // la cabecera con el login hace que aparezca el campo 'estoy_siguiendo'
    fetch(url, { headers:{'Authorization':cabecera}}).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                console.log(datos);

                //document.querySelector('#info-articulo-2').innerHTML = JSON.stringify(datos); // sacarlo como texto en el html
                /*pedirFotos();
                pedirPreguntas();*/
            });
        } else
            console.log('Error en la petición fetch');
    }); 
}

// =================================================================================
// Funciones para manejar registro
// =================================================================================

// Al resetear el form de registro, esto pone la imagen de usuario por defecto
function limpiarFotoRegistro() {
    document.querySelector('label img').src = "img/user-img.png";
}


// =================================================================================
// Funciones para manejar index
// =================================================================================

function crearArticulo(id, nombre, descripcion, precio, fecha, veces_visto, imagen, nfotos, nsiguiendo) {
    html = '<a href="articulo.html?="'+id+' title="'+nombre+'">';
    html += '<img src="fotos/articulos/'+imagen+'" alt="'+nombre+'">';
    html += '<div>';
    html += '<i class="flaticon-eye"> '+veces_visto+'</i>';
    html += '<i class="flaticon-gallery"> '+nfotos+'</i>';
    html += '</div>';
    html += '<h2>'+nombre+'</h2>';
    html += '<div>';
    html += '<p>'+precio+' €</p>';
    html += '<i class="flaticon-user"> '+nsiguiendo+'</i>';
    html += '</div>';
    html += '<p>'+descripcion+'</p></a>';

    let article = document.createElement('article');
    article.innerHTML = html;
    document.querySelector('.grid').appendChild(article);
}

function obtenerArticulos() {
    let url = 'api/articulos?pag={0}&lpag={6}';

    // method get es por defecto y body no hace falta
    fetch(url).then(function(respuesta) {
        if(respuesta.ok) {
            respuesta.json().then(function(datos) {
                datos.FILAS.forEach(function(art) {
                    // Pasamos la descripcion sin <br>, gi es para que busque en todo el texto y que no distinga mayus de minus
                    crearArticulo(art.ID, art.nombre, art.descripcion.replace(/<br>/gi,''), parseInt(art.precio), 
                        art.fecha, art.veces_visto, art.imagen, art.nfotos, art.nsiguiendo);
                });
            });
        } else
            console.log('Error en la petición fetch');
    }); 
}


// =================================================================================
// Funciones para manejar buscar
// =================================================================================

// TO DO