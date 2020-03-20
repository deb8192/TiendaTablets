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
                    } else
                        console.log('Error en la petición fetch');
                });

    return false; // Para no recargar la página
}