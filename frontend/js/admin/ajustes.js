document.addEventListener('DOMContentLoaded', function() {

const token = sessionStorage.getItem("token");

if (!token) {
    alert("Debes iniciar sesión para acceder a la página");
    window.location.href = "/frontend/views/login.html";
    return;
  }
cargarAniosGenerales();
document.getElementById('btn-eliminar').addEventListener('click', confirmarEliminacion);


async function cargarAniosGenerales() {
    try {
        const response = await fetch('http://localhost:3000/admin/report/anios-generales', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar años');
        
        const anios = await response.json();
        const select = document.getElementById('select-anio');
        
        select.innerHTML = '<option value="" disabled selected>Seleccione un año</option>';
        anios.forEach(anio => {
            const option = document.createElement('option');
            option.value = anio;
            option.textContent = anio;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar años disponibles');
    }
}

function confirmarEliminacion() {
    const anio = document.getElementById('select-anio').value;
    
    if (!anio) {
        alert('Por favor seleccione un año');
        return;
    }
    
    const confirmacion = prompt(`¿Está seguro de eliminar TODOS los reportes del ${anio}?\nEscriba "eliminar" para confirmar`);
    
    if (confirmacion === 'eliminar') {
        eliminarReportes(anio);
    } else {
        alert('Eliminación cancelada');
    }
}

async function eliminarReportes(anio) {
    try {
        const response = await fetch(`http://localhost:3000/admin/report/eliminar/${anio}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Error al eliminar');
        
        const data = await response.json();
        alert(data.message);
        
        // Recargar la lista de años
        cargarAniosGenerales();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Error al eliminar reportes');
    }
    
}
});