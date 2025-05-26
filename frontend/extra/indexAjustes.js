window.addEventListener("load", () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
        alert('Debes iniciar sesión para acceder a la página');
        window.location.href = '/frontend/views/login.html';
        return;
    }

    try {
        const payloadBase64 = token.split(".")[1];
        const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
        const currentUser = JSON.parse(payloadJson);

        // Verificar que sea admin y root
        if (currentUser.role === "admin" && (currentUser.root === 1 || currentUser.root === true)) {
            document.getElementById('ajustesMenuItem').style.display = 'block';
        }
    } catch (e) {
        console.error("Error decodificando token:", e);
        alert("Error al verificar permisos");
        window.location.href = '/frontend/views/login.html';
    }
});