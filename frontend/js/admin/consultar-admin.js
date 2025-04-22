document.addEventListener('DOMContentLoaded', async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = '/frontend/views/login.html';
        return;
    }

    // Elementos 
    const searchInput = document.getElementById('searchInput');
    const departamentoFilter = document.getElementById('departamentoFilter');
    const cargoFilter = document.getElementById('cargoFilter');
    const tableBody = document.querySelector('#data-table tbody');
    const departamentoSelect = document.getElementById('departamentoModal');
    const cargoSelect = document.getElementById('cargoModal');

    // Función  cargar cargos
    const loadCargos = async (departamentoId, targetElement) => {
        try {
            const response = await fetch(`http://localhost:3000/admin/job/list/${departamentoId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const cargos = await response.json();
            targetElement.innerHTML = `
                <option value="" disabled selected>${targetElement === cargoFilter ? 'Todos los cargos' : 'Cargo'}</option>
                ${cargos.map(c => `<option value="${c.id_cargo}">${c.c_name}</option>`).join('')}
            `;
            
            if (targetElement === cargoFilter) targetElement.disabled = false;
        } catch (error) {
            console.error("Error cargando cargos:", error);
            targetElement.innerHTML = '<option value="" disabled>Error cargando cargos</option>';
        }
    };

    // Cargar departamentos 
    const loadDepartamentos = async () => {
        try {
            const response = await fetch('http://localhost:3000/admin/department/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const departamentos = await response.json();
            const options = departamentos.map(dep => 
                `<option value="${dep.id_departamento}">${dep.d_name}</option>`
            ).join('');

            // Para filtro
            departamentoFilter.innerHTML = `<option value="">Todos los departamentos</option>${options}`;
            
            // Para modal
            departamentoSelect.innerHTML = 
                `<option value="" disabled selected>Departamento</option>${options}`;
            
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
                cargo: cargoFilter.value
            });

            const response = await fetch(`http://localhost:3000/user/consult/worker?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const trabajadores = await response.json();
            tableBody.innerHTML = trabajadores.map(t => `
                <tr>
                    <td>${t.nombre}</td>
                    <td>${t.apellido}</td>
                    <td>${t.t_cedula}</td>
                    <td>${t.departamento}</td>
                    <td>${t.cargo}</td>
                </tr>`
            ).join('');

        document.getElementById('data-table').addEventListener('click', (e) => {
        const fila = e.target.closest('tr');
        if (!fila || fila.parentNode.tagName !== 'TBODY') return;

        const cedula = fila.cells[2].textContent.trim();
        
        // Guardar la cédula en localStorage
        localStorage.setItem('cedulaActual', cedula);
        
        // Redirigir sin parámetros en la URL
        window.location.href = 'perfilAdmin.html'; 
    });
        } catch (error) {
            console.error("Error cargando trabajadores:", error);
        }
    };

    // Eventos comunes para filtros
    const handleDepartamentoChange = async (e, isFilter = true) => {
        const target = isFilter ? cargoFilter : cargoSelect;
        if (e.target.value) {
            await loadCargos(e.target.value, target);
        } else {
            target.innerHTML = `<option value="" ${isFilter ? 'selected' : 'disabled'}>${
                isFilter ? 'Todos los cargos' : 'Cargo'
            }</option>`;
            if (isFilter) target.disabled = true;
        }
        if (isFilter) await loadWorkers();
    };

    // Configurar eventos
    departamentoFilter.addEventListener('change', (e) => handleDepartamentoChange(e, true));
    departamentoSelect.addEventListener('change', (e) => handleDepartamentoChange(e, false));
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            await loadWorkers()
        }, 1000);
    });
    
    cargoFilter.addEventListener('change', loadWorkers);

    //Enviar formulario
    document.getElementById('registroForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const trabajador = {
            tname: document.getElementById('nombreModal').value,
            tapellido: document.getElementById('apellidoModal').value,
            tcedula: document.getElementById('cedulaModal').value,
            id_departamento: departamentoSelect.value,
            id_cargo: cargoSelect.value
        };

        try {
            const response = await fetch('http://localhost:3000/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(trabajador)
            });

            if (response.ok) {
                alert('Trabajador registrado');
                document.getElementById('popup').hidePopover();
                loadWorkers();
            }
        } catch (error) {
            console.error("Error registrando trabajador:", error);
        }
    });

    //Logica de Faltas 
    document.querySelector('.enlace').addEventListener('click', async () => {
        const confirmacion = prompt('Al presionar este boton esta deacuerdo con registrar faltas a todos aquellos trabajadores que aun no han registrado su asistencia. Para continuar, escriba "confirmar":');

        if (confirmacion?.toLowerCase() !== "confirmar") {
            alert('Accioon cancelada. Debe escribir "confirmar" para continuar');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/admin/faltas/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
               
            });

            if(response.ok){

                alert('Faltas registradas exitosamente');
            }

            if (!response.ok) throw new Error(data.error);


            

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Inicializar
    cargoFilter.disabled = true;
    await loadDepartamentos();
    await loadWorkers();

});