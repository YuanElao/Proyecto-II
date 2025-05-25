document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    alert("Debes iniciar sesión para acceder a la página");
    window.location.href = "/frontend/views/login.html";
    return;
  }

  const depSelect = document.getElementById("departamento");
  const cargoSelect = document.getElementById("cargo");
  const trabajadorSelect = document.getElementById("trabajador");

  try {
    // Cargar Departamentos
    const responseDep = await fetch(
      "http://localhost:3000/admin/department/list",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (responseDep.status === 401 || responseDep.status === 403) {
      sessionStorage.removeItem("token");
      window.location.href = "/frontend/views/login.html";
      return;
    }

    const departamentos = await responseDep.json();
    depSelect.innerHTML = `<option value="" disabled selected>Departamento</option>
            ${departamentos
              .map(
                (dep) =>
                  `<option value="${dep.id_departamento}">${dep.d_name}</option>`
              )
              .join("")}`;

    // Cargar Cargos cuando selecciona departamento
    depSelect.addEventListener("change", async (e) => {
      cargoSelect.disabled = true;
      cargoSelect.innerHTML =
        '<option value="" disabled selected>Cargando cargos...</option>';

      try {
        const responseCargos = await fetch(
          `http://localhost:3000/admin/job/list/${e.target.value}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const cargos = await responseCargos.json();
        cargoSelect.innerHTML = `<option value="" disabled selected>Cargo</option>
                    ${cargos
                      .map(
                        (cargo) =>
                          `<option value="${cargo.id_cargo}">${cargo.c_name}</option>`
                      )
                      .join("")}`;
        cargoSelect.disabled = false;
      } catch (error) {
        console.error("Error cargando cargos:", error);
        cargoSelect.innerHTML =
          '<option value="" disabled selected>Error cargando cargos</option>';
      }
    });

    // Cargar Trabajadores cuando selecciona cargo
    cargoSelect.addEventListener("change", async (e) => {
      trabajadorSelect.disabled = true;
      trabajadorSelect.innerHTML =
        '<option value="" disabled selected>Cargando trabajadores...</option>';

      try {
        const responseTrab = await fetch(
          `http://localhost:3000/user/consult/worker?departamento=${depSelect.value}&cargo=${e.target.value}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const trabajadores = await responseTrab.json();
        trabajadorSelect.innerHTML = `<option value="" disabled selected>Trabajador</option>
                    ${trabajadores
                      .map(
                        (t) =>
                          `<option value="${t.t_cedula}">${t.nombre} ${t.apellido}</option>`
                      )
                      .join("")}`;
        trabajadorSelect.disabled = false;
      } catch (error) {
        console.error("Error cargando trabajadores:", error);
        trabajadorSelect.innerHTML =
          '<option value="" disabled selected>Error cargando trabajadores</option>';
      }
    });

    // Enviar formulario de permiso
    document.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const permisoData = {
        tCedula: trabajadorSelect.value,
        fecha_inicio: document.getElementById("fecha_inicio").value,
        fecha_fin: document.getElementById("fecha_fin").value,
        motivo: document.getElementById("motivo").value,
      };

      try {
        const response = await fetch(
          "http://localhost:3000/admin/permission/add",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(permisoData),
          }
        );

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("token");
          window.location.href = "/frontend/views/login.html";
          return;
        }

        const data = await response.json();
        if (response.ok) {
          alert("Permiso registrado exitosamente");
          document.querySelector("form").reset();
        } else {
          alert(data.message || "Error al registrar permiso");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error de conexión");
      }
    });
  } catch (error) {
    console.error("Error general:", error);
    alert("Error de conexión con el servidor");
  }
});
