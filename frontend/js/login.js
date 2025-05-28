document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  try {
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem("token", data.token);

      window.location.href =
        role === "admin"
          ? "/views/admin/index.html"//"/frontend/views/admin/index.html"
          : "/views/index.html"//"/frontend/views/index.html"
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al iniciar sesion");
  }
});
