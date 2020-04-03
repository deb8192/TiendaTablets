function mensajeModal(html) {
    let div = document.createElement('div');
    div.setAttribute('id','capa-fondo');
    div.innerHTML = html;
    document.body.appendChild(div);
    
    // Ocultamos las barras de desplazamiento
    document.body.setAttribute('style','overflow-x:hidden; overflow-y:hidden;');
}

function cerrarMensajeModal(redirigir) {
    document.querySelector('#capa-fondo').remove();
    document.body.removeAttribute('style');

    // Login correcto, redirigimos a index
    if (redirigir)
        window.location.replace("index.html");
    else // si nos, devolvemos el foco al input de login
        document.querySelector("#login_name_lg").focus();
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
                    let html = '';
                    html += '<article>';
                    html +=   '<h2>HACER LOGIN</h2>';
                    html +=   '<p>El usuario '+ datos.login +' se ha logueado correctamente.</p>';
                    html +=   '<footer><button onclick="cerrarMensajeModal(true);">Aceptar</button></footer>';
                    html += '</article>';

                    mensajeModal(html);
                });
            } else if(respuesta.status == 401) {
                
                    // Texto del mensaje
                    let html = '';
                    html += '<article>';
                    html +=   '<h2>LOGIN INCORRECTO</h2>';
                    html +=   '<footer><button onclick="cerrarMensajeModal(false);">Cerrar</button></footer>';
                    html += '</article>';

                    mensajeModal(html);
            } else 
                console.log('Error en la petición fetch');
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
        html += `<li onclick="logout();"><a href="index.html" title="Logout"><i class="flaticon-logout"></i> <span>Logout (${usu.nombre})</span></a></li>`;
    
    } else {
        if (document.body.getAttribute('data-pagina') != 'login')
        html += '<li><a href="login.html" title="Login"><i class="flaticon-enter"></i> <span>Login</span></a></li>';

        if (document.body.getAttribute('data-pagina') != 'registro')
            html += '<li><a href="registro.html" title="Registro"><i class="flaticon-id-card"></i> <span>Registro</span></a></li>';
    }

    document.querySelector('body>header>nav>ul').innerHTML = html;
}

function logout() {
    delete sessionStorage['usuario'];
    window.location.replace("index.html");
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
            if(respuesta.ok) {
                respuesta.json().then(function(datos){
                    console.log(datos);
                });
            } else 
                console.log('Error en la petición fetch de hacer pregunta.');
        });
    return false; // Para no recargar la página
}