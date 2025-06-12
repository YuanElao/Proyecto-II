document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("searchInput");
  const departamentoFilter = document.getElementById("departamentoFilter");
  const jobFilter = document.getElementById("cargoFilter");
  const tableBody = document.getElementById("tableBody");
  const token = sessionStorage.getItem("token");

  const itemsPorPagina = 10;
  let paginaActual = 1;
  let todosTrabajadores = [];

  //Cargar departamentos
  const loadDepartment = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/admin/department/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("token");
        window.location.href = "/frontend/views/login.html";
        return;
      }
      const departamentos = await response.json();

      departamentoFilter.innerHTML = `<option value="">Todos los departamentos</option>
        ${departamentos
          .map(
            (dep) =>
              `<option value="${dep.id_departamento}">${dep.d_name}</option>`
          )
          .join("")}`;
    } catch {
      console.error("Error al cargar departamentos");
    }
  };

  const loadCargos = async (idDepartamento) => {
    try {
      jobFilter.disabled = true;
      const response = await fetch(
        `http://localhost:3000/admin/job/list/${idDepartamento}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("token");
        window.location.href = "/frontend/views/login.html";
        return;
      }

      const cargos = await response.json();

      jobFilter.innerHTML = `<option value="">Todos los cargos</option>
                ${cargos
                  .map(
                    (c) => `<option value="${c.id_cargo}">${c.c_name}</option>`
                  )
                  .join("")}`;
      jobFilter.disabled = false;
    } catch (error) {
      console.error("Error:", error);
      jobFilter.innerHTML = '<option value="">Error cargando cargos</option>';
    }
  };

  const loadWorkers = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/user/consult/workers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("token");
        window.location.href = "/frontend/views/login.html";
        return;
      }

      todosTrabajadores = await response.json();
      actualizarTabla(); // <-- Solo llamamos a actualizarTabla aquí
    
      // Eliminar esta línea que causaba el error
      // updateTable(trabajadores);
    } catch (error) {
      console.error("Error:", error);
      tableBody.innerHTML = `<tr><td colspan="5">Error cargando datos</td></tr>`;
    }
  };

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

  // Event listener para cambio de departamento
  departamentoFilter.addEventListener("change", async (e) => {
    const idDepartamento = e.target.value;
    jobFilter.disabled = !idDepartamento;

    if (idDepartamento) {
      await loadCargos(idDepartamento);
    } else {
      jobFilter.innerHTML = '<option value="">Todos los cargos</option>';
      jobFilter.disabled = true;
    }

    // Actualizar tabla
    await updateFilters();
  });

  jobFilter.addEventListener("change", async () => {
    await updateFilters();
  });

  let searchTimeout;
  const updateFilters = async () => {
    const search = searchInput.value;
    const idDepartamento = departamentoFilter.value;
    const idCargo = jobFilter.value;

    const url = new URL("http://localhost:3000/user/consult/worker");
    url.searchParams.append("search", search);
    if (idDepartamento) url.searchParams.append("departamento", idDepartamento);
    if (idCargo) url.searchParams.append("cargo", idCargo);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    todosTrabajadores = await response.json();
    paginaActual = 1; // Resetear a la primera página al aplicar nuevos filtros
    actualizarTabla();
  };

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      await updateFilters();
    }, 1000);
  });

  document.getElementById("data-table").addEventListener("click", (e) => {
    const fila = e.target.closest("tr");
    if (!fila || fila.parentNode.tagName !== "TBODY") return;

    const cedula = fila.cells[2].textContent.trim();
    localStorage.setItem("cedulaActual", cedula);
    window.location.href = "perfil.html";
  });

  const actualizarTabla = () => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const trabajadoresPagina = todosTrabajadores.slice(inicio, fin);

    tableBody.innerHTML = trabajadoresPagina.map(
      (t) => `
            <tr>
                <td>${t.nombre}</td>
                <td>${t.apellido}</td>
                <td>${t.t_cedula}</td>
                <td>${t.departamento}</td>
                <td>${t.cargo}</td>
            </tr>`
    ).join('');

    actualizarControlesPaginacion();
  };

  await loadDepartment();
  await loadWorkers();
});
