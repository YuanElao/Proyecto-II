document.addEventListener('DOMContentLoaded', () => {
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