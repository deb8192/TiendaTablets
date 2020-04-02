function hacerLogin(frm) {
    let url = 'api/usuarios/login',
        fd  = new FormData(frm);

    fetch(url, {method:'POST', 
                body:fd}).then(function(respuesta){
                    if(respuesta.ok) {
                        respuesta.json().then(function(datos){
                            console.log(datos);

                            console.log(JSON.stringify(datos));
                            sessionStorage['usuario'] = JSON.stringify(datos);
                        });
                    } else if(respuesta.status == 401) {
                        
                            console.log('Usuario incorrecto - sacar modal');
                    } else 
                        console.log('Error en la petición fetch');
                });
    
      //window.location.replace("index.html");          
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