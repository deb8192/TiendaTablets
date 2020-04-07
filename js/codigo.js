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
        html += `<li onclick="logout();"><span><i class="flaticon-logout"></i> Logout (${usu.nombre})</span></li>`;
    
    } else {
        if (document.body.getAttribute('data-pagina') != 'login')
        html += '<li><a href="login.html" title="Login"><i class="flaticon-enter"></i> <span>Login</span></a></li>';

        if (document.body.getAttribute('data-pagina') != 'registro')
            html += '<li><a href="registro.html" title="Registro"><i class="flaticon-id-card"></i> <span>Registro</span></a></li>';
    }

    document.querySelector('body>header>nav>ul').innerHTML = html;
}

function logout() {
    let url = 'api/usuarios/logout',
        usu = JSON.parse(sessionStorage['usuario']);

        fetch(url, {method:'POST',
        headers:{'Authorization':usu.login + ':' + usu.token}}).then(function(respuesta){
            if(respuesta.ok) {
                respuesta.json().then(function(datos) {
                    console.log(datos);
                    console.log('Esdfsdfsdflogout.');
                    delete sessionStorage['usuario'];
                    window.location.replace("index.html");
                });
                
            } else 
                console.log('Error al intentar hacer logout.');
        });
}

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

function pedirCategorias() {
    let url="api/categorias";

    fetch(url).then(function(respuesta) {
        if(respuesta.ok) { 
            respuesta.json().then(function(datos) {
                console.log(datos);
                if (datos.RESULTADO == 'OK') {
                    let html = '';
                    datos.FILAS.forEach(function(e) {
                        html += `<option id="${e.id}" value="${e.nombre}">`;
                    });
                    document.querySelector('#categorias' ).innerHTML = html;
                } else
                    console.log('ERROR: ' + datos.DESCRIPCION);
            });
        } else
            console.log('Error en la petición fetch');
    });
}

function cambiarFoto(inp) {
    let fr = new FileReader();
    fr.onload = function() {
        if (inp.files[0].size <= 300000) //bytes -> 300KB
            inp.parentNode.querySelector('img').src = fr.result;
    };
    fr.readAsDataURL(inp.files[0]);
}

function limpiarFotoRegistro() {
    document.querySelector('label img').src = "img/user-img.png";
}

function enviarFoto(btn) { // TO DO

    let url = 'api/articulos/3/foto',
        usu = 'usuario3:8570f9e624d4d4aaf7de2805289efba2fc51c0017e0b865bc4aaefe23c14da9ba00296f873c8d99eb29d6d0efacced0d0026525077aa217c364cfc09b9ce2cb8',
        fd  = new FormData();

    fd.append('fichero', btn.parentNode.querySelector('input').files[0]);

    fetch(url, {method:'POST', 
        body:fd,
        headers:{'Authorization':usu}}).then(function(respuesta){

            if(respuesta.ok) { 
                respuesta.json().then(function(datos){
                    console.log(datos);
                });
            } else
                console.log('Error en la petición fetch de dar de alta foto.');
        });
}


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