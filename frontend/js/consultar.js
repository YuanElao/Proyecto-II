document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const departamentoFilter = document.getElementById('departamentoFilter');
    const jobFilter = document.getElementById('cargoFilter'); 
    const tableBody = document.getElementById('tableBody')
    const token = sessionStorage.getItem('token')

    
    //Cargar departamentos
    const loadDepartment = async () => {

        try{
            
            const response = await fetch('http://localhost:3000/admin/department/list', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem('token');
            window.location.href = '/frontend/views/login.html';
            return;
        }
        const departamentos = await response.json();

        departamentoFilter.innerHTML = `<option value="">Todos los departamentos</option>
        ${departamentos.map(dep => `<option value="${dep.id_departamento}">${dep.d_name}</option>`).join('')}`;
        
        }catch {
            console.error("Error al cargar departamentos")
        }
    }

    const loadCargos = async (idDepartamento) => {
        try {
            jobFilter.disabled = true; 
            const response = await fetch(`http://localhost:3000/admin/job/list/${idDepartamento}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('token');
                window.location.href = '/frontend/views/login.html';
                return;
            }

            const cargos = await response.json();
            
            jobFilter.innerHTML = `<option value="">Todos los cargos</option>
                ${cargos.map(c => `<option value="${c.id_cargo}">${c.c_name}</option>`).join('')}`;
                jobFilter.disabled = false;
        } catch (error) {
            console.error("Error:", error);
            jobFilter.innerHTML = '<option value="">Error cargando cargos</option>';
        }
    };

    const loadWorkers = async () => {
        try {

            const response = await fetch(`http://localhost:3000/user/consult/workers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem('token');
                window.location.href = '/frontend/views/login.html';
                return;
            }
             const trabajadores = await response.json();
             updateTable(trabajadores);

        } catch (error){
            console.error("Error:", error);
            tableBody.innerHTML = `<tr><td colspan="5">Error cargando datos</td></tr>`;
        }
    };

    // Event listener para cambio de departamento
    departamentoFilter.addEventListener('change', async (e) => {
        const idDepartamento = e.target.value;
        jobFilter.disabled = !idDepartamento; // Habilitar solo si hay departamento
        
        if (idDepartamento) {
            await loadCargos(idDepartamento);
        } else {
            jobFilter.innerHTML = '<option value="">Todos los cargos</option>';
            jobFilter.disabled = true;
        }
        
        // Actualizar tabla
        await updateFilters();
    });

    jobFilter.addEventListener('change', async () => {
        await updateFilters();
    });

    let searchTimeout;
    const updateFilters = async () => {
        const search = searchInput.value;
        const idDepartamento = departamentoFilter.value;
        const idCargo = jobFilter.value;
        
        const url = new URL('http://localhost:3000/user/consult/worker');
        url.searchParams.append('search', search);
        if (idDepartamento) url.searchParams.append('departamento', idDepartamento);
        if (idCargo) url.searchParams.append('cargo', idCargo);
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const trabajadores = await response.json();
        updateTable(trabajadores);
    };


    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            await updateFilters()
        }, 1000);
    });
    departamentoFilter.addEventListener('input', updateFilters)

    document.getElementById('data-table').addEventListener('click', (e) => {
        const fila = e.target.closest('tr');
        if (!fila || fila.parentNode.tagName !== 'TBODY') return;

        const cedula = fila.cells[2].textContent.trim();
        
        // Guardar la cédula en localStorage
        localStorage.setItem('cedulaActual', cedula);
        
        // Redirigir sin parámetros en la URL
        window.location.href = 'perfil.html'; 
    });
    const updateTable = (trabajadores) => {
        tableBody.innerHTML = trabajadores.map(t => `
            <tr>
                <td>${t.nombre}</td>
                <td>${t.apellido}</td>
                <td>${t.t_cedula}</td>
                <td>${t.departamento}</td>
                <td>${t.cargo}</td>
            </tr>`
        )
    }

    await loadDepartment();
    await loadWorkers();

})