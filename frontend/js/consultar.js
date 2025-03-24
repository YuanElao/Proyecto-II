document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('searchInput');
    const departamentoFilter = document.getElementById('departamentoFilter');
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

    document.getElementById('data-table').addEventListener('click', (e) => {
        const fila = e.target.closest('tr');
        if (!fila || fila.parentNode.tagName !== 'TBODY') return;

        const cedula = fila.cells[2].textContent.trim();
        
        // Guardar la cédula en localStorage
        localStorage.setItem('cedulaActual', cedula);
        
        // Redirigir sin parámetros en la URL
        window.location.href = 'perfil.html'; 
    });



    searchInput.addEventListener('input', async (e) => {
        const search = e.target.value;
        const idDepartamento = departamentoFilter.value;
        const response = await fetch(`http://localhost:3000/user/consult/worker?search=${search}&departamento=${idDepartamento}`);
        const trabajadores = await response.json();
        updateTable(trabajadores);
    });

    departamentoFilter.addEventListener('change', async (e) => {
        const search = searchInput.value;
        const idDepartamento = e.target.value;
        const response = await fetch(`http://localhost:3000/user/consult/worker?search=${search}&departamento=${idDepartamento}`);
        const trabajadores = await response.json();
        updateTable(trabajadores);
    });

    const updateTable = (trabajadores) => {
        tableBody.innerHTML = trabajadores.map(t => `
            <tr>
                <td>${t.nombre}</td>
                <td>${t.apellido}</td>
                <td>${t.t_cedula}</td>
                <td>${t.departamento }</td>
                <td>${t.cargo}</td>`)
    }

    await loadDepartment();
    await loadWorkers();

})