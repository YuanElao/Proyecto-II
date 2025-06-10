document.addEventListener("DOMContentLoaded", async () => {
    // Elementos del DOM
    const tipoReporteSelect = document.getElementById("tipoReporte");
    const datosPersonalesContainer = document.getElementById("datosPersonalesContainer");
    const recordLaboralContainer = document.getElementById("recordLaboralContainer");
    const btnGenerarDatosPersonales = document.getElementById("btnGenerarDatosPersonales");
  
    const anioReporteSelect = document.getElementById("anioReporte");
    const mesInicioSelect = document.getElementById("mesInicio");
    const mesFinSelect = document.getElementById("mesFin");
    const btnGenerarReporte = document.getElementById("btnGenerarReporte");

    // Variables de estado
    const token = sessionStorage.getItem("token");
    const cedula = localStorage.getItem("cedulaActual");
    let workerData = {};
    const monthCache = {};

    // Validar autenticación
    if (!token || !cedula) {
        window.location.href = "../login.html";
        return;
    }

    // Inicialización
    try {
        // Cargar datos del trabajador
        const workerResponse = await fetch(
            `http://localhost:3000/user/profile/${cedula}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (!workerResponse.ok) throw new Error("Error al cargar datos del trabajador");
        
        workerData = await workerResponse.json();

        await loadAvailableYears();
        setupEventListeners();
        
        // Establecer meses iniciales (actual y diciembre por defecto)
        const currentMonth = new Date().getMonth();
        mesInicioSelect.value = currentMonth;
        mesFinSelect.value = 11; // Diciembre
        
    } catch (error) {
        console.error("Error inicializando reportes:", error);
        alert(error.message);
        window.location.href = "Consultar.html";
    }

    // Cargar años disponibles desde el backend
    async function loadAvailableYears() {
        try {
            const { id_trabajador } = workerData.trabajador;
            const response = await fetch(
                `http://localhost:3000/admin/report/${id_trabajador}/anios`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) throw new Error("Error al obtener años disponibles");

            const anios = await response.json();

            if (anios.length === 0) {
            // Bloquear Record Laboral si no hay años
            document.getElementById("recordLaboralContainer").style.display = "none";
            document.getElementById("tipoReporte").value = "datosPersonales";
            document.getElementById("tipoReporte").disabled = true;
            showNoDataMessage("No hay datos disponibles para generar reportes laborales");
            return;
        }

            anioReporteSelect.innerHTML = anios
                .map(anio => `<option value="${anio}" ${anio === new Date().getFullYear() ? "selected" : ""}>${anio}</option>`)
                .join("");


            
            await loadAvailableMonths(anioReporteSelect.value)

                
        } catch (error) {
            console.error("Error cargando años:", error);
            alert("Error al cargar años disponibles");
        }
    }


    async function loadAvailableMonths(anio) {
    try {
        const { id_trabajador } = workerData.trabajador;
        console.log(`Cargando meses para trabajador: ${id_trabajador}, año: ${anio}`);
        
        // URL con timestamp para evitar caché
        const url = `http://localhost:3000/admin/report/${id_trabajador}/meses/${anio}?_=${Date.now()}`;
        
        const response = await fetch(url, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error en respuesta: ${response.status} - ${errorText}`);
            throw new Error(`Error al obtener meses: ${response.status}`);
        }

        let mesesDisponibles = await response.json();
        console.log("Meses disponibles recibidos:", mesesDisponibles);
        
        // Manejar caso de meses vacíos
        if (!Array.isArray(mesesDisponibles)) {
            console.warn("MesesDisponibles no es un array:", mesesDisponibles);
            mesesDisponibles = [];
        }
        
        // Ordenar meses y manejar caso sin datos
        mesesDisponibles = mesesDisponibles
            .map(m => parseInt(m))
            .filter(m => !isNaN(m) && m >= 0 && m < 12)
            .sort((a, b) => a - b);
        
        if (mesesDisponibles.length === 0) {
            console.log("No hay meses disponibles para este año");
            showNoDataMessage();
            return;
        }

        // Actualizar caché de meses y selects
        monthCache[anio] = mesesDisponibles;
        updateMonthSelects(mesesDisponibles);
        
    } catch (error) {
        console.error("Error en loadAvailableMonths:", error);
        showNoDataMessage();
        // Mostrar error al usuario
        alert(`Error al cargar meses: ${error.message}`);
    }
}


    function updateMonthSelects(mesesDisponibles) {
        const monthNames = [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        // Limpiar selects
        mesInicioSelect.innerHTML = '';
        mesFinSelect.innerHTML = '';

        // Poblar selects
        monthNames.forEach((name, index) => {
            const isAvailable = mesesDisponibles.includes(index);
            
            const option = document.createElement('option');
            option.value = index;
            option.textContent = name;
            option.disabled = !isAvailable;
            
            mesInicioSelect.appendChild(option.cloneNode(true));
            mesFinSelect.appendChild(option);
        });

        if (mesesDisponibles.length > 0) {
        mesInicioSelect.value = mesesDisponibles[0];
        mesFinSelect.value = mesesDisponibles[mesesDisponibles.length - 1];
        btnGenerarReporte.disabled = false;
    } else {
        btnGenerarReporte.disabled = true;
        showNoDataMessage("No hay meses disponibles para el año seleccionado");
    }
}


    function showNoDataMessage() {
        const noDataMsg = document.createElement('p');
        noDataMsg.textContent = 'No hay datos disponibles para este año';
        noDataMsg.style.color = '#dc3545';
        noDataMsg.style.marginTop = '10px';
        
        // Limpiar selects
        mesInicioSelect.innerHTML = '';
        mesFinSelect.innerHTML = '';
        
        // Insertar mensaje después del contenedor de meses
        document.querySelector('.meses-container').appendChild(noDataMsg);
    }

    // Configurar event listeners
    function setupEventListeners() {

                // Cambio de tipo de reporte
        tipoReporteSelect.addEventListener("change", (e) => {
            if (e.target.value === "datosPersonales") {
                datosPersonalesContainer.style.display = "block";
                recordLaboralContainer.style.display = "none";
            } else {
                datosPersonalesContainer.style.display = "none";
                recordLaboralContainer.style.display = "block";
                loadAvailableYears();
            }
        });

        // Botón para generar reporte de datos personales
        btnGenerarDatosPersonales.addEventListener("click", generatePersonalDataPDF);


        btnGenerarReporte.addEventListener("click", generatePDFReport);
        
        // Validar rango de meses automáticamente
        mesInicioSelect.addEventListener("change", () => {
    const mesInicio = parseInt(mesInicioSelect.value);
    const mesFin = parseInt(mesFinSelect.value);
    
    if (mesInicio > mesFin) {
        mesFinSelect.value = mesInicio;
    }
    validateGenerateButton();
});
        
        mesFinSelect.addEventListener("change", () => {
    const mesInicio = parseInt(mesInicioSelect.value);
    const mesFin = parseInt(mesFinSelect.value);
    
    if (mesFin < mesInicio) {
        mesInicioSelect.value = mesFin;
    }
    validateGenerateButton();
});

        anioReporteSelect.addEventListener("change", () => {
        const selectedYear = anioReporteSelect.value;
        loadAvailableMonths(selectedYear);
    });
    }

    function validateGenerateButton() {
    const mesInicio = parseInt(mesInicioSelect.value);
    const mesFin = parseInt(mesFinSelect.value);
    
    // Verificar si los meses seleccionados están disponibles
    const mesInicioDisabled = mesInicioSelect.options[mesInicioSelect.selectedIndex].disabled;
    const mesFinDisabled = mesFinSelect.options[mesFinSelect.selectedIndex].disabled;
    
    btnGenerarReporte.disabled = mesInicioDisabled || mesFinDisabled;
}

    async function generatePersonalDataPDF() {
        const { nombre, apellido, cedula, departamento, cargo, qr_code } = workerData.trabajador;

        try {
            // Mostrar estado de carga
            btnGenerarDatosPersonales.disabled = true;
            btnGenerarDatosPersonales.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generando...';

            // Crear ventana de impresión
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Datos Personales - ${nombre} ${apellido}</title>
                    <style>

                                    
                            .encabezado {
                            width: 75%;
                            margin-bottom: 5px;
                            margin-left: 100px;

                        }
                            .encabezado-img {
                            width: 75%;
                            max-height: 120px;
                            object-fit: contain;
                            margin-left: 100px;

                        }

                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 20px;
                            color: #333;
                            -webkit-print-color-adjust: exact;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                            padding-bottom: 10px;
                            border-bottom: 1px solid #ddd;
                        }
                        .datos-container {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 15px;
                            margin-bottom: 20px;
                        }
                        .dato-item {
                            margin-bottom: 10px;
                        }
                        .dato-item strong {
                            display: inline-block;
                            width: 120px;
                        }
                        .qr-container {
                            text-align: center;
                            margin-top: 20px;
                        }
                        .qr-image {
                            width: 150px;
                            height: 150px;
                            margin: 0 auto;
                        }
                        .fecha-generacion {
                            text-align: right;
                            font-size: 12px;
                            color: #666;
                            margin-top: 20px;
                        }
                        @page {
                            size: letter portrait;
                            margin: 10mm;
                        }
                    </style>
                </head>
                <body>
                <div class="encabezado" style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
    <img src="../../img/membrete.png" 
         style="max-width: 80%; height: auto; max-height: 100px;">
    <div style="border-top: 1px solid #003366; width: 100%; margin: 8px 0;"></div>
</div>
                    <div class="header">
                        <h1>Datos Personales</h1>
                        <h2>${nombre} ${apellido}</h2>
                    </div>

                    <div class="datos-container">
                        <div class="dato-item"><strong>Nombre:</strong> ${nombre}</div>
                        <div class="dato-item"><strong>Apellido:</strong> ${apellido}</div>
                        <div class="dato-item"><strong>Cédula:</strong> ${cedula}</div>
                        <div class="dato-item"><strong>Departamento:</strong> ${departamento || 'N/A'}</div>
                        <div class="dato-item"><strong>Cargo:</strong> ${cargo || 'N/A'}</div>
                    </div>

                    <div class="qr-container">
                        <img src="${qr_code}" class="qr-image" alt="Código QR">
                        <p>Código QR de identificación</p>
                    </div>

                    <div class="fecha-generacion">
                        Generado el ${new Date().toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric'})}
                    </div>

                    <script>
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                };
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();

        } catch (error) {
            console.error("Error generando reporte de datos personales:", error);
            alert("Error al generar reporte: " + error.message);
        } finally {
            btnGenerarDatosPersonales.disabled = false;
            btnGenerarDatosPersonales.innerHTML = '<i class="bx bx-printer"></i> Generar Reporte';
        }
    }

    // Función principal para generar el PDF
    async function generatePDFReport() {
        const { id_trabajador, nombre, apellido, departamento, cargo } = workerData.trabajador;
        const anio = anioReporteSelect.value;
        const mesInicio = parseInt(mesInicioSelect.value);
        const mesFin = parseInt(mesFinSelect.value);

        try {
            // Mostrar estado de carga
            btnGenerarReporte.disabled = true;
            btnGenerarReporte.innerHTML = '<i class="bx bx-loader bx-spin"></i> Generando...';

            // Obtener datos del backend
            const params = new URLSearchParams({
                anio: anio,
                mesInicio: mesInicio,
                mesFin: mesFin
            });

            const response = await fetch(
                `http://localhost:3000/admin/report/${id_trabajador}/data?${params}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Error al generar el reporte");
            }

            const eventos = await response.json();

            // Crear ventana de impresión
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Reporte ${nombre} ${apellido}</title>
                <script src="../../extra/chart.umd.js"></script>
                <style>

                .encabezado {
                width: 75%;
                margin-bottom: 5px;
                margin-left: 100px;

            }
                .encabezado-img {
                width: 75%;
                max-height: 120px;
                object-fit: contain;
                margin-left: 100px;

            }

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
                        max-width: 400px
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
                            width: 70%
                            max-width: 350px}

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
           <div class="encabezado" style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
    <img src="../../img/membrete.png" 
         style="max-width: 80%; height: auto; max-height: 100px;">
    <div class="fecha-generacion" style="text-align: center; font-size: 10px; color: #555; margin-top: 5px;">
        Generado el ${new Date().toLocaleDateString('es-ES', {day: 'numeric', month: 'long', year: 'numeric'})}
    </div>
    <div style="border-top: 1px solid #003366; width: 100%; margin: 8px 0;"></div>
</div>
                <div class="header">
                    <h1>Reporte Laboral</h1>
                    <h2>${nombre} ${apellido}</h2>
                    <div class="info-trabajador">
                        <div><strong>Departamento:</strong> ${departamento || 'N/A'}</div>
                        <div><strong>Cargo:</strong> ${cargo || 'N/A'}</div>
                    </div>
                    <p><strong>Período:</strong> ${getMonthNames(mesInicio, mesFin)} ${anio}</p>
                </div>

                <div class="charts-container">
                    <div class="chart-wrapper">
                        <div class="chart-title">Eventos por Mes</div>
                        <canvas id="graficaBarras"></canvas>
                    </div>
                    <div class="chart-wrapper">
                        <div class="chart-title">Distribución Total</div>
                        <div class= "pie-container">
                        <canvas id="graficaPastel"></canvas>
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

                        // Gráfica de barras optimizada
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

                        // Gráfica de pastel optimizada
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
                                            }
                                        },
                                        tooltip: {
                                            bodyFont: { size: 9 }
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
                        }, 1200); // Tiempo suficiente para renderizar
                    };
                </script>
            </body>
            </html>
        `);
            printWindow.document.close();

        } catch (error) {
            console.error("Error generando reporte:", error);
            alert("Error al generar reporte: " + error.message);
        } finally {
            btnGenerarReporte.disabled = false;
            btnGenerarReporte.innerHTML = '<i class="bx bx-printer"></i> Generar PDF';
        }
    }

    // Función auxiliar para obtener nombres de meses
    function getMonthNames(start, end) {
        const months = [];
        for (let i = start; i <= end; i++) {
            months.push(new Date(0, i).toLocaleString('es-ES', { month: 'long' }));
        }
        return months.join(" - ");
    }
});
