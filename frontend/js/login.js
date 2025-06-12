document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

 

  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    if (!response.ok) {
      alert("El usuario o la contraseña son incorrectos");
      return;
    }

    const data = await response.json();
    sessionStorage.setItem("token", data.token);

    // Extraer información del usuario del token
    let currentUser;
    try {
      const payloadBase64 = data.token.split(".")[1];
      const payloadJson = atob(
        payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
      );
      currentUser = JSON.parse(payloadJson);
    } catch (e) {
      console.error("Error decodificando token:", e);
      alert("Sesión inválida");
      sessionStorage.removeItem("token");
      return;
    }

    // Redirección basada en el rol
    if (currentUser.role == "admin") {
      window.location.replace("/frontend/views/admin/index.html"); // Usar replace para no guardar en historial
    } else {
      window.location.replace("/frontend/views/index.html");
    }

  } catch (error) {
    console.error("Error:", error);
    alert("Error al iniciar sesión");
  }
});


/*

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  window.addEventListener("pageshow", function(event) {
    if(event.persisted) {
      sessionStorage.removeItem("token");
      window.location.href = "/frontend/views/login.html"
    }
  })
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;


  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = await response.json();

    if(!response.ok) {
        alert("El usuario o la contraseña son incorrectos");
        return
      }

    if (response.ok) {
      sessionStorage.setItem("token", data.token);

      const token = sessionStorage.getItem("token");

    

  // Extraer información del usuario del token
  let currentUser;
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    );
    currentUser = JSON.parse(payloadJson);
  } catch (e) {
    console.error("Error decodificando token:", e);
    alert("Sesión inválida");
    sessionStorage.removeItem("token")
    return;
  }

  // Verificar rol de admin
  if (currentUser.role == "admin") {
    window.location.href = "/frontend/views/admin/index.html";
  } else {
    window.location.href = "/frontend/views/index.html";
  }

  // /views/admin/index.html
  // /views/index.html
  // /frontend/views/admin/index.html
  // /frontend/views/index.html
 
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al iniciar sesion");
  }
});
*/