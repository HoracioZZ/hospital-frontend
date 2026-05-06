// 1. Configura la URL de tu API en Render
// OJO: Asegúrate de poner la ruta exacta de un endpoint GET que devuelva una lista (ej. /api/Especialidades/lista)
const API_URL = 'https://especialidades-medicas-api.onrender.com/api/Especialidades/lista';

// 2. Referencias a los elementos del HTML
const btnCargar = document.getElementById('btnCargarDatos');
const tablaCuerpo = document.getElementById('tablaCuerpo');

// 3. Evento al hacer clic en el botón
btnCargar.addEventListener('click', async () => {
    // Mostramos un mensaje de carga mientras Render responde
    tablaCuerpo.innerHTML = `<tr><td colspan="3" class="text-center text-primary fw-bold">Cargando datos desde la nube... ⏳</td></tr>`;

    try {
        // Consumir la API
        const respuesta = await fetch(API_URL);
        
        // Verificar si hubo error
        if (!respuesta.ok) {
            throw new Error(`Error en el servidor: ${respuesta.status}`);
        }

        // Convertir la respuesta a JSON
        const datos = await respuesta.json();

        // Limpiar la tabla
        tablaCuerpo.innerHTML = '';

        // Si la lista está vacía
        if (datos.length === 0) {
            tablaCuerpo.innerHTML = `<tr><td colspan="3" class="text-center text-warning">No hay datos registrados.</td></tr>`;
            return;
        }

        // Iterar sobre los datos y crear las filas
datos.forEach(item => {
    const fila = document.createElement('tr');
    
    // Esta lógica busca todas las formas posibles en que puede llegar el nombre
    const codigo = item.codigo || item.Codigo || "S/C";
    const nombre = item.nombre || item.Nombre || item.nombre_especialidad || "Sin Nombre";
    const estado = item.estado || item.Estado || "Activo";
    
    fila.innerHTML = `
        <td class="fw-bold">${codigo}</td>
        <td>${nombre}</td>
        <td>
            <span class="badge ${estado.toString().toLowerCase() === 'activo' ? 'bg-success' : 'bg-secondary'}">
                ${estado}
            </span>
        </td>
    `;
    
    tablaCuerpo.appendChild(fila);
});

    } catch (error) {
        // Manejo de errores de conexión (CORS, servidor caído, etc.)
        console.error("Error al consumir la API:", error);
        tablaCuerpo.innerHTML = `<tr><td colspan="3" class="text-center text-danger"><b>Error:</b> No se pudo conectar con la API. Revisa la consola o tu servidor Render.</td></tr>`;
    }
});
