document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    window.location.href = "/frontend/views/login.html";
    return;
  }

  // Elementos del DOM
  const selectItem = document.getElementById("accionSelect");
  const formContainer = document.getElementById("formContainer");
  const departamentosTable = document.querySelector("#data-table tbody");
  const cargosTable = document.querySelector("#data-table2 tbody");
  const btnReporteDepto = document.getElementById("btnGenerarReporteDepto");
  let currentEditId = null;
  let departamentoReporteId = null;
  let departamentoReporteNombre = null;

  // Cargar datos iniciales
  const loadData = async () => {
    await loadDepartamentos();
    await loadCargos();
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
      const data = await response.json();
      renderDepartamentos(data);
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    }
  };

  // Cargar cargos
  const loadCargos = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/job/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      renderCargos(data);
    } catch (error) {
      console.error("Error cargando cargos:", error);
    }
  };

  // Renderizar departamentos (con botón de reporte)
  const renderDepartamentos = (departamentos) => {
    departamentosTable.innerHTML = departamentos
      .map(
        (dep) => `
            <tr data-id="${dep.id_departamento}">
                <td>${dep.d_name}</td>
                <td>
                    <button class="enlace editar-dep">Modificar</button>
                    <button class="enlace eliminar-dep">Eliminar</button>
                    <button class="enlace reporte-dep" 
                            data-id="${dep.id_departamento}" 
                            data-nombre="${dep.d_name}">
                        Reporte
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  };

  // Renderizar cargos
  const renderCargos = (cargos) => {
    cargosTable.innerHTML = cargos
      .map(
        (c) => `
            <tr data-id="${c.id}">
                <td>${c.nombre}</td>
                <td>${c.departamento}</td>
                <td>
                    <button class="enlace editar-car">Modificar</button>
                    <button class="enlace eliminar-car">Eliminar</button>
                </td>
            </tr>
        `
      )
      .join("");
  };

  // Manejar selección de acción
  selectItem.addEventListener("change", async (e) => {
    const action = e.target.value;
    formContainer.innerHTML =
      action === "departamento"
        ? `<input type="text" class="input-crear" placeholder="Nombre" id="nombreInput">
           <button class="crear">Crear</button>`
        : `<div class="input-group">
               <select class="seleccionable1" id="depSelect"></select>
               <input type="text" class="input-crear" placeholder="Nombre" id="nombreInput">
           </div>
           <button class="crear">Crear</button>`;

    if (action === "cargo") await loadDepartamentosSelect("#depSelect");
  });

  // Cargar departamentos en select
  const loadDepartamentosSelect = async (selector) => {
    try {
      const response = await fetch(
        "http://localhost:3000/admin/department/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      document.querySelector(selector).innerHTML = `
                <option value="" disabled selected>Departamento</option>
                ${data
                  .map(
                    (d) =>
                      `<option value="${d.id_departamento}">${d.d_name}</option>`
                  )
                  .join("")}
            `;
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    }
  };

  // Crear elementos
  formContainer.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("crear") || currentEditId) return;

    const action = selectItem.value;
    const nombre = document.getElementById("nombreInput")?.value;
    const depId =
      action === "cargo" ? document.getElementById("depSelect")?.value : null;

    if (!nombre || (action === "cargo" && !depId)) {
      alert("Complete todos los campos");
      return;
    }

    // Validar solo letras
    const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!soloLetras.test(nombre)) {
      alert("El nombre solo puede contener letras y espacios");
      return;
    }

    try {
      const endpoint =
        action === "departamento" ? "/admin/department/add" : "/admin/job/add";

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          action === "departamento"
            ? { d_name: nombre }
            : { c_name: nombre, id_departamento: depId }
        ),
      });

      if (response.ok) {
        document.getElementById("nombreInput").value = "";
        if (action === "cargo") document.getElementById("depSelect").value = "";
        await loadData();
      }
    } catch (error) {
      console.error("Error creando:", error);
    }
  });

  // Editar elementos
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("editar-dep")) {
      const row = e.target.closest("tr");
      currentEditId = row.dataset.id;
      document.getElementById("editDepNombre").value =
        row.querySelector("td:first-child").textContent;
      document.getElementById("modalDepartamento").style.display = "block";
    }

    if (e.target.classList.contains("editar-car")) {
      const row = e.target.closest("tr");
      currentEditId = row.dataset.id;
      document.getElementById("editCarNombre").value =
        row.querySelector("td:first-child").textContent;
      await loadDepartamentosSelect("#editCarDepartamento");
      document.getElementById("modalCargo").style.display = "block";
    }

    // Manejar clic en botón de reporte
    if (e.target.classList.contains("reporte-dep")) {
      const row = e.target.closest("tr");
      departamentoReporteId = row.dataset.id;
      departamentoReporteNombre = e.target.dataset.nombre;
      
      // Mostrar botón de reporte general
      btnReporteDepto.style.display = "block";
      
      // Actualizar título del modal
      document.querySelector("#modalReporteDepartamento h3").textContent = 
        `Reporte de Departamento: ${departamentoReporteNombre}`;
      
      // Cargar años disponibles
      await cargarAniosReporteDepto();
      document.getElementById("modalReporteDepartamento").style.display = "block";
    }
  });

  // Eliminar elementos
  document.addEventListener("click", async (e) => {
    if (
      !e.target.classList.contains("eliminar-dep") &&
      !e.target.classList.contains("eliminar-car")
    )
      return;

    const confirmacion = prompt('Escriba "confirmar" para proceder:');
    if (confirmacion?.toLowerCase() !== "confirmar") {
      alert("Acción cancelada");
      return;
    }

    const isDep = e.target.classList.contains("eliminar-dep");
    const id = e.target.closest("tr").dataset.id;
    const endpoint = isDep ? `/admin/department/${id}` : `/admin/job/${id}`;

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) await loadData();
    } catch (error) {
      console.error("Error eliminando:", error);
    }
  });

  // Cerrar modales
  document.querySelectorAll(".cerrar").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".modal").forEach((modal) => {
        modal.style.display = "none";
        currentEditId = null;
      });
    });
  });

  // Guardar cambios en modales
  document
    .getElementById("btnGuardarDep")
    .addEventListener("click", async () => {
      const nuevoNombre = document.getElementById("editDepNombre").value;

      if(!nuevoNombre) {
        alert("El nombre no puede estar vacio");
        return;
      }

      const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
      if (!soloLetras.test(nuevoNombre)) {
        alert("El nombre solo puede contener letras y espacios");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/admin/department/${currentEditId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ d_name: nuevoNombre }),
          }
        );

        if (response.ok) {
          document.getElementById("modalDepartamento").style.display = "none";
          await loadData();
        }
      } catch (error) {
        console.error("Error actualizando departamento:", error);
      }
    });

  document
    .getElementById("btnGuardarCar")
    .addEventListener("click", async () => {
      const nuevoNombre = document.getElementById("editCarNombre").value;
      const Dep = document.getElementById("editCarDepartamento").value;

      if(!nuevoNombre) {
        alert("El nombre no puede estar vacio");
        return;
      }

      const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
      if (!soloLetras.test(nuevoNombre)) {
        alert("El nombre solo puede contener letras y espacios");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/admin/job/${currentEditId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              c_name: nuevoNombre,
              id_departamento: Dep,
            }),
          }
        );

        if (response.ok) {
          document.getElementById("modalCargo").style.display = "none";
          await loadData();
        }
      } catch (error) {
        console.error("Error actualizando cargo:", error);
      }
    });

  // Función para cargar años disponibles para reportes
  async function cargarAniosReporteDepto() {
    try {
      const response = await fetch("http://localhost:3000/admin/report/anios-generales", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Error al obtener años");
      
      const anios = await response.json();
      const anioSelect = document.getElementById("anioReporteDepto");
      anioSelect.innerHTML = anios.map(anio => 
        `<option value="${anio}">${anio}</option>`
      ).join("");
      
      // Cargar meses para el año seleccionado
      anioSelect.addEventListener("change", () => {
        cargarMesesReporteDepto(anioSelect.value);
      });
      
      // Cargar meses para el año actual por defecto
      if (anios.length > 0) {
        await cargarMesesReporteDepto(anioSelect.value);
      }
    } catch (error) {
      console.error("Error cargando años:", error);
      alert("Error al cargar años disponibles");
    }
  }

  // Función para cargar meses disponibles
  async function cargarMesesReporteDepto(anio) {
    try {
      const response = await fetch(
        `http://localhost:3000/admin/report/departamento/${departamentoReporteId}/meses/${anio}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error("Error al obtener meses");
      
      const meses = await response.json();
      const mesInicio = document.getElementById("mesInicioDepto");
      const mesFin = document.getElementById("mesFinDepto");
      
      // Limpiar selects
      mesInicio.innerHTML = '';
      mesFin.innerHTML = '';
      
      // Poblar selects
      const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      
      monthNames.forEach((name, index) => {
        const isAvailable = meses.includes(index);
        const option = `<option value="${index}" ${!isAvailable ? 'disabled' : ''}>${name}</option>`;
        mesInicio.innerHTML += option;
        mesFin.innerHTML += option;
      });
      
      // Establecer valores por defecto
      mesInicio.value = 0;
      mesFin.value = 11;
      
    } catch (error) {
      console.error("Error cargando meses:", error);
      alert("Error al cargar meses disponibles");
    }
  }

  // Función para generar el reporte
  document.getElementById("btnGenerarReporteDepto").addEventListener("click", async () => {
    const anio = document.getElementById("anioReporteDepto").value;
    const mesInicio = parseInt(document.getElementById("mesInicioDepto").value);
    const mesFin = parseInt(document.getElementById("mesFinDepto").value);
    const btnGenerar = document.getElementById("btnGenerarReporteDepto");
    
    try {
      btnGenerar.disabled = true;
      btnGenerar.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generando...';
      
      // Obtener datos del backend para el departamento
      const params = new URLSearchParams({
        anio: anio,
        mesInicio: mesInicio,
        mesFin: mesFin
      });
      
      const response = await fetch(
        `http://localhost:3000/admin/report/departamento/${departamentoReporteId}/data?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!response.ok) throw new Error("Error al generar el reporte");
      
      const eventos = await response.json();
      
      // Generar el PDF
      generarPDFReporteDepto(departamentoReporteNombre, eventos, anio, mesInicio, mesFin);
      
    } catch (error) {
      console.error("Error generando reporte:", error);
      alert("Error al generar reporte: " + error.message);
    } finally {
      btnGenerar.disabled = false;
      btnGenerar.innerHTML = '<i class="bx bx-printer"></i> Generar Reporte';
    }
  });

  // Función para generar el PDF del departamento
  function generarPDFReporteDepto(nombreDepto, eventos, anio, mesInicio, mesFin) {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Reporte ${nombreDepto}</title>
          <script src="../../extra/chart.umd.js"></script>
          <style>
              body { 
                  font-family: Arial, sans-serif; 
                  padding: 10px 15px; 
                  color: #333;
                  -webkit-print-color-adjust: exact;
              }
              .header { 
                  text-align: center; 
                  margin-bottom: 10px;
                  padding-bottom: 8px;
                  border-bottom: 1px solid #ddd;
              }
              .info-trabajador {
                  display: flex;
                  justify-content: center;
                  flex-wrap: wrap;
                  gap: 15px;
                  margin: 8px 0;
                  font-size: 0.85rem;
              }
              .charts-container {
                  display: flex;
                  flex-direction: column;
                  gap: 15px;
                  margin: 15px 0;
              }
              .chart-wrapper {
                  width: 100%;
                  margin-bottom: 10px;
                  page-break-inside: avoid;
              }
              .pie-container {
                  width: 80%;
                  margin: 0 auto;
                  max-width: 400px;
              }
              .chart-title {
                  text-align: center;
                  font-size: 13px;
                  margin-bottom: 5px;
                  font-weight: bold;
                  color: #2c3e50;
              }
              canvas { 
                  width: 100% !important;
                  height: 220px !important;
                  max-width: 100%;
                  max-height: 220px;
              }
              .resumen { 
                  background: #f8f9fa; 
                  padding: 10px; 
                  border-radius: 4px;
                  margin-top: 10px;
                  page-break-inside: avoid;
                  font-size: 0.85rem;
                  border: 1px solid #e0e0e0;
              }
              .resumen h3 {
                  margin-top: 0;
                  margin-bottom: 8px;
                  color: #2c3e50;
                  font-size: 1rem;
                  text-align: center;
              }
              .resumen p {
                  display: flex;
                  justify-content: space-between;
                  margin: 5px 0;
                  padding: 0 5px;
              }
              .resumen strong {
                  color: #2c3e50;
              }
              @page { 
                  size: letter portrait; 
                  margin: 10mm;
              }
              @media print {
                  body { 
                      padding: 0;
                      font-size: 9pt;
                  }
                  .header h1 {
                      font-size: 16pt;
                      margin-bottom: 4px;
                  }
                  .header h2 {
                      font-size: 13pt;
                      margin-top: 0;
                      margin-bottom: 8px;
                  }
                  .header p {
                      margin: 5px 0;
                      font-size: 10pt;
                  }
                  .pie-container {
                      width: 70%;
                      max-width: 350px;
                  }
                  canvas {
                      height: 200px !important;
                  }
                  .chart-wrapper {
                      margin-bottom: 5px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Reporte de Departamento</h1>
              <h2>${nombreDepto}</h2>
              <p><strong>Período:</strong> ${getMonthNames(mesInicio, mesFin)} ${anio}</p>
          </div>

          <div class="charts-container">
              <div class="chart-wrapper">
                  <div class="chart-title">Eventos por Mes</div>
                  <canvas id="graficaBarras"></canvas>
              </div>
              <div class="chart-wrapper">
                  <div class="chart-title">Distribución Total</div>
                  <div class="pie-container">
                      <canvas id="graficaPastel"></canvas>
                  </div>
              </div>
          </div>

          <div class="resumen" id="resumenEstadistico"></div>

          <script>
              // Datos para las gráficas
              const eventos = ${JSON.stringify(eventos)};
              const anio = ${anio};
              const mesInicio = ${mesInicio};
              const mesFin = ${mesFin};

// Procesar datos para gráficas
              function procesarDatos() {
                  const meses = [];
                  const datos = {
                      asistencias: [],
                      faltas: [],
                      permisos: []
                  };

                  for (let mes = mesInicio; mes <= mesFin; mes++) {
                      const eventosMes = eventos.filter(e => {
                          const fecha = new Date(e.start);
                          return fecha.getFullYear() == anio && fecha.getMonth() == mes;
                      });

                      meses.push(new Date(anio, mes, 1).toLocaleString('es-ES', { month: 'short' }));
                      datos.asistencias.push(eventosMes.filter(e => e.tipo === 'Asistencia').length);
                      datos.faltas.push(eventosMes.filter(e => e.tipo === 'Falta').length);
                      datos.permisos.push(eventosMes.filter(e => e.tipo === 'Permiso').length);
                  }

                  return { meses, datos };
              }

              // Generar gráficas optimizadas para impresión
              function generarGraficas() {
                  const { meses, datos } = procesarDatos();
                  const totales = {
                      asistencias: datos.asistencias.reduce((a, b) => a + b, 0),
                      faltas: datos.faltas.reduce((a, b) => a + b, 0),
                      permisos: datos.permisos.reduce((a, b) => a + b, 0)
                  };

                  // Gráfica de barras
                  new Chart(
                      document.getElementById('graficaBarras').getContext('2d'),
                      {
                          type: 'bar',
                          data: {
                              labels: meses,
                              datasets: [
                                  { 
                                      label: 'Asistencias', 
                                      data: datos.asistencias, 
                                      backgroundColor: '#28a745',
                                      borderColor: '#218838',
                                      borderWidth: 1
                                  },
                                  { 
                                      label: 'Faltas', 
                                      data: datos.faltas, 
                                      backgroundColor: '#dc3545',
                                      borderColor: '#c82333',
                                      borderWidth: 1
                                  },
                                  { 
                                      label: 'Permisos', 
                                      data: datos.permisos, 
                                      backgroundColor: '#ffc107',
                                      borderColor: '#e0a800',
                                      borderWidth: 1
                                  }
                              ]
                          },
                          options: {
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                  title: { display: false },
                                  legend: { 
                                      position: 'top',
                                      labels: { 
                                          font: { 
                                              size: 9,
                                              family: 'Arial'
                                          },
                                          boxWidth: 12
                                      }
                                  }
                              },
                              scales: {
                                  y: { 
                                      beginAtZero: true,
                                      title: { 
                                          display: true, 
                                          text: 'Cantidad', 
                                          font: { size: 9 } 
                                      },
                                      ticks: { 
                                          font: { size: 8 },
                                          stepSize: 1
                                      }
                                  },
                                  x: {
                                      ticks: { 
                                          font: { size: 8 },
                                          maxRotation: 45,
                                          minRotation: 45
                                      }
                                  }
                              }
                          }
                      }
                  );

                  // Gráfica de pastel
                  new Chart(
                      document.getElementById('graficaPastel').getContext('2d'),
                      {
                          type: 'pie',
                          data: {
                              labels: ['Asistencias', 'Faltas', 'Permisos'],
                              datasets: [{
                                  data: [totales.asistencias, totales.faltas, totales.permisos],
                                  backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                                  borderWidth: 1
                              }]
                          },
                          options: {
                              responsive: true,
                              maintainAspectRatio: false,
                              aspectRatio: 1.5,
                              plugins: {
                                  title: { display: false },
                                  legend: { 
                                      position: 'bottom',
                                      labels: { 
                                          font: { 
                                              size: 9,
                                              family: 'Arial'
                                          },
                                          boxWidth: 12
                                      },
                                      tooltip: {
                                          bodyFont: { size: 9 }
                                      }
                                  }
                              }
                          }
                      }
                  );

                  // Actualizar resumen
                  document.getElementById('resumenEstadistico').innerHTML = \`
                      <h3>Resumen Estadístico</h3>
                      <p><strong>Total Asistencias:</strong> \${totales.asistencias}</p>
                      <p><strong>Total Faltas:</strong> \${totales.faltas}</p>
                      <p><strong>Total Permisos:</strong> \${totales.permisos}</p>
                      <p><strong>Porcentaje de Asistencia:</strong> \${((totales.asistencias / (totales.asistencias + totales.faltas)) * 100 || 0).toFixed(2)}%</p>
                  \`;
              }

              // Iniciar al cargar la ventana
              window.onload = function() {
                  generarGraficas();
                  setTimeout(() => {
                      window.print();
                      window.onafterprint = function() {
                          window.close();
                      };
                  }, 1200);
              };
          </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  // Función auxiliar para nombres de meses
  function getMonthNames(start, end) {
    const months = [];
    for (let i = start; i <= end; i++) {
      months.push(new Date(0, i).toLocaleString('es-ES', { month: 'long' }));
    }
    return months.join(" - ");
  }

  // Inicialización
  await loadData();
});
