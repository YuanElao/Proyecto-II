document.addEventListener('DOMContentLoaded', async () => {
    


    
    const cedula = localStorage.getItem('cedulaActual')
    
    
    // Obtener parámetro de la cédula
    

    if (!cedula) {
        alert('Error: No se especificó la cédula');
        window.location.href = 'Consultar.html';
        return;
    }

    try {
        const token = sessionStorage.getItem('token')
        // Obtener datos del trabajador
        console.log("Este es el token:", token)
        const response = await fetch(`http://localhost:3000/user/profile/${cedula}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        console.log(data)

        localStorage.removeItem('cedulaActual');
        // Llenar datos principales
        document.getElementById('nombre').value = data.trabajador.nombre;
        document.getElementById('apellido').value = data.trabajador.apellido;
        document.getElementById('cedula').value = data.trabajador.cedula;
        document.getElementById('departamento').value = data.trabajador.departamento;
        document.getElementById('cargo').value = data.trabajador.cargo;

        const qrElement = document.querySelector('.codigoqr');
        qrElement.dataset.qrBackend = data.trabajador.qr_code;

        // Llenar contadores
        document.getElementById('countA').textContent = `Asistencias: ${data.contadores.asistencias}`;
        document.getElementById('countP').textContent = `Permisos: ${data.contadores.permisos}`;
        document.getElementById('countF').textContent = `Faltas: ${data.contadores.faltas}`;

        const calendario = data.calendario;
        generarCalendarioAnual(calendario);
        
        // Agrega esta función al final del archivo:
        function generarCalendarioAnual(eventos) {
            const container = document.getElementById('calendarContainer');
            const añoActual = new Date().getFullYear();
            
            for (let mes = 0; mes < 12; mes++) {
                const primerDia = new Date(añoActual, mes, 1);
                const ultimoDia = new Date(añoActual, mes + 1, 0);
                
                const divMes = document.createElement('div');
                divMes.className = 'mes-calendario';
                divMes.innerHTML = `
                    <h3>${primerDia.toLocaleDateString('es-ES', { month: 'long' })}</h3>
                    <div class="dias-semana">
                        ${['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => `<span>${d}</span>`).join('')}
                    </div>
                    <div class="dias-mes"></div>
                `;
                
                const diasDiv = divMes.querySelector('.dias-mes');
                const diasEnMes = ultimoDia.getDate();
                
                // Rellenar días
                for (let i = 1; i <= diasEnMes; i++) {
                    const dia = new Date(añoActual, mes, i);
                    const fechaISO = dia.toISOString().split('T')[0];
                    
                    const diaElement = document.createElement('div');
                    diaElement.className = 'dia';
                    diaElement.textContent = i;
                    
                    // Buscar eventos para este día
                    const eventosDia = eventos.filter(e => e.start.startsWith(fechaISO));
                    if (eventosDia.length > 0) {
                        diaElement.classList.add('evento');
                        diaElement.style.color = eventosDia[0].color;
                        diaElement.title = eventosDia.map(e => `${e.title}: ${e.description || ''}`).join('\n');
                    }
                    
                    diasDiv.appendChild(diaElement);
                }
                
                container.appendChild(divMes);
            }
        }

        // Configurar botón de imprimir
        document.getElementById('qr').addEventListener('click', imprimirCredencial);

    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        alert('Error al cargar los datos del trabajador');
    }
});

function imprimirCredencial() {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const cedula = document.getElementById('cedula').value;
    const departamento = document.getElementById('departamento').value
    const cargo = document.getElementById('cargo').value

    const qrBase64 = document.querySelector('.codigoqr').dataset.qrBackend;

    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html>
            <head>
                <title>Credencial - ${nombre} ${apellido}</title>
                <style>
                        @page { margin: 0; }
                        body { 
                            font-family: Arial;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            margin: 0;
                        }
                        .credencial {
                            text-align: center;
                            border: 2px solid #000;
                            padding: 20px;
                            width: 300px;
                        }
                        .qr-impresion {
                            width: 200px;
                            height: 200px;
                            margin: 15px auto;
                            display: block;
                        }
                    
                </style>
            </head>
            <body>
                <div class="credencial">
                    <h2>${nombre} ${apellido}</h2>
                    <p>${departamento} - ${cargo}</p>
                    <p>C.I.: ${cedula}</p>
                
                    <img src="${qrBase64}" class="qr-impresion">
                </div>
            </body>
        </html>
    `);


    ventana.onload = () => {
        ventana.print();
        ventana.close();
    }
    ventana.document.close();
    
}