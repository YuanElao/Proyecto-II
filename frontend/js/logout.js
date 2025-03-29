document.addEventListener('DOMContentLoaded', () => {

    window.addEventListener("popstate", () => {
        sessionStorage.removeItem("token");
        window.location.href = '/frontend/views/login.html';
    });

    let isReload = false;

    window.addEventListener("beforeunload", () => {
        if (!isReload) {
            sessionStorage.removeItem("token");
            window.location.href = '/frontend/views/login.html';
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
            isReload = true ;
        }
    });



    const cerrarSesionBtn = document.getElementById('cerrarSesion');

    if (cerrarSesionBtn) {
        cerrarSesionBtn.addEventListener('click', (e) => {
            e.preventDefault();

            sessionStorage.removeItem('token');

            window.location.href = '/frontend/views/login.html';
            
           /* const confirmar = confirm('Estas seguro de que deseas cerrar sesion?');
            if (confirmar) {

                sessionStorage.removeItem('token');

                window.location.href = '/frontend/views/login.html';
            }*/
        });
    }



});