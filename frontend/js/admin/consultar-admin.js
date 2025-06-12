document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    window.location.href = "/frontend/views/login.html";
    return;
  }

  // Elementos
  const searchInput = document.getElementById("searchInput");
  const departamentoFilter = document.getElementById("departamentoFilter");
  const cargoFilter = document.getElementById("cargoFilter");
  const tableBody = document.querySelector("#data-table tbody");
  const departamentoSelect = document.getElementById("departamentoModal");
  const cargoSelect = document.getElementById("cargoModal");

  
const itemsPorPagina = 10; // Ajusta este número según prefieras
let paginaActual = 1;
let todosTrabajadores = [];


  // Función  cargar cargos
  const loadCargos = async (departamentoId, targetElement) => {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/job/list/${departamentoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const cargos = await response.json();
      targetElement.innerHTML = `
                <option value="" disabled selected>${
                  targetElement === cargoFilter ? "Todos los cargos" : "Cargo"
                }</option>
                ${cargos
                  .map(
                    (c) => `<option value="${c.id_cargo}">${c.c_name}</option>`
                  )
                  .join("")}
            `;

      if (targetElement === cargoFilter) targetElement.disabled = false;
    } catch (error) {
      console.error("Error cargando cargos:", error);
      targetElement.innerHTML =
        '<option value="" disabled>Error cargando cargos</option>';
    }
  };

  // Cargar departamentos
  const loadDepartamentos = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/admin/department/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const departamentos = await response.json();
      const options = departamentos
        .map(
          (dep) =>
            `<option value="${dep.id_departamento}">${dep.d_name}</option>`
        )
        .join("");

      // Para filtro
      departamentoFilter.innerHTML = `<option value="">Todos los departamentos</option>${options}`;

      // Para modal
      departamentoSelect.innerHTML = `<option value="" disabled selected>Departamento</option>${options}`;
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    }
  };

  // Cargar trabajadores con todos los filtros
  let searchTimeout;

  const loadWorkers = async () => {
    try {
      const params = new URLSearchParams({
        search: searchInput.value,
        departamento: departamentoFilter.value,
        cargo: cargoFilter.value,
      });

      const response = await fetch(
        `http://localhost:3000/user/consult/worker?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

        todosTrabajadores = await response.json();
        actualizarTabla();


      document.getElementById("data-table").addEventListener("click", (e) => {
        const fila = e.target.closest("tr");
        if (!fila || fila.parentNode.tagName !== "TBODY") return;

        const cedula = fila.cells[2].textContent.trim();

        // Guardar la cédula en localStorage
        localStorage.setItem("cedulaActual", cedula);

        // Redirigir sin parámetros en la URL
        window.location.href = "perfilAdmin.html";
      });
    } catch (error) {
      console.error("Error cargando trabajadores:", error);
    }
  };

  const actualizarTabla = () => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const trabajadoresPagina = todosTrabajadores.slice(inicio, fin);

    tableBody.innerHTML = trabajadoresPagina
        .map(
            (t) => `
            <tr>
                <td>${t.nombre}</td>
                <td>${t.apellido}</td>
                <td>${t.t_cedula}</td>
                <td>${t.departamento}</td>
                <td>${t.cargo}</td>
            </tr>`
        )
        .join("");

    // Actualizar controles de paginación
    actualizarControlesPaginacion();
};

// Función para actualizar los controles de paginación
const actualizarControlesPaginacion = () => {
    const totalPaginas = Math.ceil(todosTrabajadores.length / itemsPorPagina);
    const paginaActualElement = document.querySelector('.pagina-actual');
    const [btnAnterior, btnSiguiente] = document.querySelectorAll('.paginacion-btn');

    paginaActualElement.textContent = paginaActual;
    btnAnterior.disabled = paginaActual <= 1;
    btnSiguiente.disabled = paginaActual >= totalPaginas;
};

document.addEventListener('click', (e) => {
    if (e.target.closest('.paginacion-btn')) {
        const accion = e.target.closest('.paginacion-btn').dataset.accion;
        
        if (accion === 'anterior' && paginaActual > 1) {
            paginaActual--;
        } else if (accion === 'siguiente' && paginaActual < Math.ceil(todosTrabajadores.length / itemsPorPagina)) {
            paginaActual++;
        }
        
        actualizarTabla();
    }
});

  // Eventos comunes para filtros
  const handleDepartamentoChange = async (e, isFilter = true) => {
    const target = isFilter ? cargoFilter : cargoSelect;
    if (e.target.value) {
      await loadCargos(e.target.value, target);
    } else {
      target.innerHTML = `<option value="" ${
        isFilter ? "selected" : "disabled"
      }>${isFilter ? "Todos los cargos" : "Cargo"}</option>`;
      if (isFilter) target.disabled = true;
    }
    if (isFilter) await loadWorkers();
  };

  // Configurar eventos
  departamentoFilter.addEventListener("change", (e) =>
    handleDepartamentoChange(e, true)
  );
  departamentoSelect.addEventListener("change", (e) =>
    handleDepartamentoChange(e, false)
  );

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      await loadWorkers();
    }, 1000);
  });

  cargoFilter.addEventListener("change", loadWorkers);

  //Enviar formulario
  document
    .getElementById("registroForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();


      const cedulaInput = document.getElementById("cedulaModal");
      const cedulaValue = cedulaInput.value.trim()

      const nombre = document.getElementById("nombreModal").value.trim();
      const apellido = document.getElementById("apellidoModal").value.trim();
      const cedula = document.getElementById("cedulaModal").value.trim();

      //validar solo letras
      const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]+$/;

      // Validar nombres y apellidos
      if (!soloLetras.test(nombre)) {
        alert("El nombre solo puede contener letras");
        document.getElementById("nombreModal").focus();
        return;
      }

      if (!soloLetras.test(apellido)) {
        alert("El apellido solo puede contener letras");
        document.getElementById("apellidoModal").focus();
        return;
      }

      if (cedulaValue.length < 7 || cedulaValue.length > 8) {
        alert("Verifique que la cedula propuesta es correcta")
        return
      }

      const trabajador = {
        tname: document.getElementById("nombreModal").value,
        tapellido: document.getElementById("apellidoModal").value,
        tcedula: document.getElementById("cedulaModal").value,
        id_departamento: departamentoSelect.value,
        id_cargo: cargoSelect.value,
      };

      try {
        const response = await fetch("http://localhost:3000/user/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(trabajador),
        });

        if (response.ok) {
          alert("Trabajador registrado con exito");
          document.getElementById("registroForm").reset();
          popup.style.display = "none"
          await loadWorkers();
        }
      } catch (error) {
        console.error("Error registrando trabajador:", error);
      }
    });

  //Logica de Faltas
  document.querySelector(".enlace").addEventListener("click", async () => {
    const confirmacion = prompt(
      'Al presionar este boton esta deacuerdo con registrar faltas a todos aquellos trabajadores que aun no han registrado su asistencia. Para continuar, escriba "confirmar":'
    );

    if (confirmacion?.toLowerCase() !== "confirmar") {
      alert('Accion cancelada. Debe escribir "confirmar" para continuar');
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3000/admin/faltas/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrar faltas");
      }

      const data = await response.json();
      alert(data.message || "Faltas registradas exitosamente")

    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  });
  const popup = document.getElementById("popup");
  const btnRegistrar = document.querySelector('[popovertarget="popup"]');

  // Mostrar modal
  btnRegistrar.addEventListener("click", () => {
    popup.style.display = "block";
  });

  // Ocultar modal
  document.getElementById("cerrarPopup").addEventListener("click", () => {
    popup.style.display = "none";
  });

  // Cerrar al hacer clic fuera del modal
  window.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  });
  // Inicializar
  cargoFilter.disabled = true;
  await loadDepartamentos();
  await loadWorkers();
});
