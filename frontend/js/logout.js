document.addEventListener("DOMContentLoaded", () => {
  let isNavigation = false;

  window.addEventListener("popstate", () => {
    sessionStorage.removeItem("token");
    window.location.href = "/frontend/views/login.html";
  });

  // Detectar clics en enlaces internos
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && link.href && !link.href.includes("logout")) {
      isNavigation = true;
    }
  });

  const cerrarSesionBtn = document.getElementById("cerrarSesion");

  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", (e) => {
      e.preventDefault();

      sessionStorage.removeItem("token");

      window.location.href = "/frontend/views/login.html";

      /* const confirmar = confirm('Estas seguro de que deseas cerrar sesion?');
            if (confirmar) {

                sessionStorage.removeItem('token');

                window.location.href = '/frontend/views/login.html';
            }*/
    });
  }
});
