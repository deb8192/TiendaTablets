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

    return false; // Para no recargar la página
}

function menu() {
    let html = '';

    if (document.body.getAttribute('data-pagina') != 'inicio')
        html += '<li title = "Inicio"><a href="index.html"><i class="flaticon-home"></i> <span>Inicio</span></a></li>';
    
    if (document.body.getAttribute('data-pagina') != 'buscar')
        html += '<li title = "Buscar"><a href="buscar.html"><i class="flaticon-loupe"></i> <span>Buscar</span></a></li>';
       
    if (document.body.getAttribute('data-pagina') != 'nuevo')
        html += '<li title = "Nuevo"><a href="nuevo.html"><i class="flaticon-plus"></i> <span>Nuevo</span></a></li>';
       
    if (document.body.getAttribute('data-pagina') != 'login')
        html += '<li title = "Login"><a href="login.html"><i class="flaticon-enter"></i> <span>Login</span></a></li>';

    if (document.body.getAttribute('data-pagina') != 'registro')
        html += '<li title = "Registro"><a href="registro.html"><i class="flaticon-id-card"></i> <span>Registro</span></a></li>';

    if (document.body.getAttribute('data-pagina') != 'acerca')
        html += '<li title = "Acerca"><a href="acerca.html"><i class="flaticon-user"></i> <span>Acerca</span></a></li>';


    if(sessionStorage['usuario'])
        html += '<li title = "Logout"><a href="index.html"><i class="flaticon-logout"></i> <span>Logout</span></a></li>';

    document.querySelector('body>header>nav>ul').innerHTML = html;
}