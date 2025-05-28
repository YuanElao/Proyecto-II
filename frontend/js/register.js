document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("Debes iniciar sesion para acceder a la pagina");
    window.location.href = "/frontend/views/login.html";
    return;
  }

  const departamentoSelect = document.getElementById("departamento");
  const cargoSelect = document.getElementById("cargo");

  try {
    //Cargar Departamentos
    const responseDep = await fetch(
      "http://localhost:3000/admin/department/list",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (responseDep.status === 401 || responseDep.status === 403) {
      sessionStorage.removeItem("token");
      window.location.href = "/frontend/views/login.html";
      return;
    }

    const departamentos = await responseDep.json();

    departamentoSelect.innerHTML = `<option value="" disable selected>Departamento</option> 
        ${departamentos
          .map(
            (dep) =>
              `<option value="${dep.id_departamento}">${dep.d_name}</option>`
          )
          .join("")}`;

    //Cuando seleccione un departamento, cargar cargos

    departamentoSelect.addEventListener("change", async (e) => {
      cargoSelect.disable = true;
      cargoSelect.innerHTML =
        '<option value="" disable selected>Cargando cargos...</option>';

      const idDepartamento = e.target.value;

      try {
        const responseCargos = await fetch(
          `http://localhost:3000/admin/job/list/${idDepartamento}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (responseCargos.status === 401 || responseCargos.status === 403) {
          sessionStorage.removeItem("token");
          window.location.href = "/frontend/views/login.html";
          return;
        }

        const cargos = await responseCargos.json();

        cargoSelect.innerHTML = `<option value="" disable selected>Cargo</option>
            ${cargos
              .map(
                (cargo) =>
                  `<option value="${cargo.id_cargo}">${cargo.c_name}</option>`
              )
              .join("")}`;

        cargoSelect.disable = false;
      } catch (error) {
        console.error("Error cargando cargos:", error);
        cargoSelect.innerHTML =
          '<option value="" disable selected>Error cargando cargos</options>';
      }
    });

    //Envio de formulario

    document
      .getElementById("registroForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        const trabajador = {
          tname: document.getElementById("nombre").value,
          tapellido: document.getElementById("apellido").value,
          tcedula: document.getElementById("cedula").value,
          id_departamento: departamentoSelect.value,
          id_cargo: cargoSelect.value,
        };

 // Validar campos vacíos
  if (!trabajador.tname || !trabajador.tapellido || !trabajador.tcedula) {
    alert("Todos los campos son obligatorios");
    return;
  }

  // Validar departamento y cargo seleccionados
  if (!trabajador.id_departamento) {
    alert("Debe seleccionar un departamento");
    departamentoSelect.focus();
    return;
  }

  if (!trabajador.id_cargo) {
    alert("Debe seleccionar un cargo");
    cargoSelect.focus();
    return;
  }

  // Validar solo letras en nombre y apellido
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

  if (!soloLetras.test(trabajador.tname)) {
    alert("El nombre solo puede contener letras y espacios");
    document.getElementById("nombre").focus();
    return;
  }

  if (!soloLetras.test(trabajador.tapellido)) {
    alert("El apellido solo puede contener letras y espacios");
    document.getElementById("apellido").focus();
    return;
  }

  // Validar cédula (7-8 dígitos numéricos)
  const soloNumeros = /^[0-9]+$/;
  if (!soloNumeros.test(trabajador.tcedula) || trabajador.tcedula.length < 7 || trabajador.tcedula.length > 8) {
    alert("La cédula debe contener entre 7 y 8 dígitos numéricos");
    document.getElementById("cedula").focus();
    return;
  }

        try {
          const response = await fetch("http://localhost:3000/user/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(trabajador),
          });

          if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("token");
            window.location.href = "/frontend/views/login.html";
            return;
          }

          
          if (response.ok) {
            document.getElementById("registroForm").reset();
            alert("Trabajador registrado exitosamente");
            console.log("Trabajador registrado exitosamente");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Error de conexion");
        }
      });
  } catch (error) {
    console.error("Error general:", error);
    alert("Error de conexion con el servidor");
  }
});
