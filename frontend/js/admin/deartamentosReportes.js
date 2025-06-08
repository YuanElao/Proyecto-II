document.addEventListener("DOMContentLoaded", async () => {
    // Elementos del DOM para reportes de departamento
    const btnReporteDepto = document.getElementById("btnReporteDepartamento");
    const modalReporteDepto = document.getElementById("modalReporteDepartamento");
    const btnGenerarReporteDepto = document.getElementById("btnGenerarReporteDepto");
    const anioReporteDepto = document.getElementById("anioReporteDepto");
    const mesInicioDepto = document.getElementById("mesInicioDepto");
    const mesFinDepto = document.getElementById("mesFinDepto");
    
    // Variables de estado
    const token = sessionStorage.getItem("token");
    let departamentoActual = null;

    // Abrir modal de reportes
    btnReporteDepto.addEventListener("click", () => {
        // Aquí deberías obtener el departamento actual de alguna manera
        // Por ejemplo, si tienes una variable global o puedes obtenerlo de la tabla
        departamentoActual = "Nombre del Departamento"; // Reemplaza esto con tu lógica
        cargarAniosReporteDepto();
        modalReporteDepto.style.display = "block";
    });

    // Cerrar modal
    modalReporteDepto.querySelector(".cerrar").addEventListener("click", () => {
        modalReporteDepto.style.display = "none";
    });

    // Cargar años disponibles para reportes de departamento
    async function cargarAniosReporteDepto() {
        try {
            const response = await fetch("http://localhost:3000/admin/report/anios-generales", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error("Error al obtener años");
            
            const anios = await response.json();
            anioReporteDepto.innerHTML = anios.map(anio => 
                `<option value="${anio}">${anio}</option>`
            ).join("");
            
            // Cargar meses para el año seleccionado
            anioReporteDepto.addEventListener("change", () => {
                cargarMesesReporteDepto(anioReporteDepto.value);
            });
            
            // Cargar meses para el año actual por defecto
            if (anios.length > 0) {
                cargarMesesReporteDepto(anioReporteDepto.value);
            }
        } catch (error) {
            console.error("Error cargando años:", error);
            alert("Error al cargar años disponibles");
        }
    }

    // Cargar meses disponibles para reportes de departamento
    async function cargarMesesReporteDepto(anio) {
        try {
            // Aquí necesitarías una nueva ruta en tu backend para obtener meses por departamento
            const response = await fetch(`http://localhost:3000/admin/report/departamento/${departamentoActual}/meses/${anio}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error("Error al obtener meses");
            
            const meses = await response.json();
            
            // Limpiar selects
            mesInicioDepto.innerHTML = '';
            mesFinDepto.innerHTML = '';
            
            // Poblar selects
            const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
                              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
            
            monthNames.forEach((name, index) => {
                const isAvailable = meses.includes(index);
                const option = `<option value="${index}" ${!isAvailable ? 'disabled' : ''}>${name}</option>`;
                mesInicioDepto.innerHTML += option;
                mesFinDepto.innerHTML += option;
            });
            
            // Establecer valores por defecto
            mesInicioDepto.value = 0;
            mesFinDepto.value = 11;
            
        } catch (error) {
            console.error("Error cargando meses:", error);
            alert("Error al cargar meses disponibles");
        }
    }

    // Generar reporte de departamento
    btnGenerarReporteDepto.addEventListener("click", async () => {
        const anio = anioReporteDepto.value;
        const mesInicio = parseInt(mesInicioDepto.value);
        const mesFin = parseInt(mesFinDepto.value);
        
        try {
            btnGenerarReporteDepto.disabled = true;
            btnGenerarReporteDepto.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generando...';
            
            // Obtener datos del backend para el departamento
            const params = new URLSearchParams({
                anio: anio,
                mesInicio: mesInicio,
                mesFin: mesFin
            });
            
            const response = await fetch(
                `http://localhost:3000/admin/report/departamento/${departamentoActual}/data?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (!response.ok) throw new Error("Error al generar el reporte");
            
            const eventos = await response.json();
            
            // Generar el PDF (similar a tu función existente)
            generarPDFReporteDepto(departamentoActual, eventos, anio, mesInicio, mesFin);
            
        } catch (error) {
            console.error("Error generando reporte:", error);
            alert("Error al generar reporte: " + error.message);
        } finally {
            btnGenerarReporteDepto.disabled = false;
            btnGenerarReporteDepto.innerHTML = '<i class="bx bx-printer"></i> Generar Reporte';
        }
    });

    // Función para generar el PDF del departamento (similar a la que ya tienes)
    function generarPDFReporteDepto(nombreDepto, eventos, anio, mesInicio, mesFin) {
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte ${nombreDepto}</title>
                <script src="../../extra/chart.umd.js"></script>
                <style>
                    /* Usa los mismos estilos que en tu función generatePDFReport */
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    /* ... resto de estilos ... */
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Reporte de Departamento</h1>
                    <h2>${nombreDepto}</h2>
                    <p><strong>Período:</strong> ${getMonthNames(mesInicio, mesFin)} ${anio}</p>
                </div>

                <div class="charts-container">
                    <!-- Gráficas similares a las de perfilAdmin -->
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
                    // Código similar al de generatePDFReport para procesar datos y generar gráficas
                    // Solo cambia el título y los datos que vienen del backend
                    const eventos = ${JSON.stringify(eventos)};
                    
                    // Resto del código para generar gráficas...
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
});