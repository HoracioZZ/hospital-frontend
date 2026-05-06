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
// ==========================================
// INTEGRACIÓN: GESTIÓN DE PACIENTES
// ==========================================

// 1. URL de la API de tu compañero
const API_PACIENTES = 'https://gestionpacientes.onrender.com/api/pacientes/';

// 2. Referencias al HTML
const btnCargarPacientes = document.getElementById('btnCargarPacientes');
const tablaPacientesCuerpo = document.getElementById('tablaPacientesCuerpo');

// 3. Evento del botón
btnCargarPacientes.addEventListener('click', async () => {
    // Mensaje de carga
    tablaPacientesCuerpo.innerHTML = `<tr><td colspan="5" class="text-center text-info fw-bold">Cargando datos desde Gestión Paciente... ⏳</td></tr>`;

    try {
        const respuesta = await fetch(API_PACIENTES);
        
        if (!respuesta.ok) {
            throw new Error(`Error en el servidor de pacientes: ${respuesta.status}`);
        }

        const pacientes = await respuesta.json();
        tablaPacientesCuerpo.innerHTML = '';

        if (pacientes.length === 0) {
            tablaPacientesCuerpo.innerHTML = `<tr><td colspan="5" class="text-center text-warning">No hay pacientes registrados.</td></tr>`;
            return;
        }

        pacientes.forEach(p => {
            const fila = document.createElement('tr');
            
            // Leemos los datos tal cual nos pasaste en el JSON
            const codigo = p.codigo_paciente || "S/C";
            // Unimos nombre y apellido
            const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.trim() || "Sin Nombre";
            const ci = p.ci || "S/CI";
            const telefono = p.telefono || "Sin Tel.";
            const estado = p.estado || "Activo";
            
            fila.innerHTML = `
                <td class="fw-bold text-info">${codigo}</td>
                <td>${nombreCompleto}</td>
                <td>${ci}</td>
                <td>${telefono}</td>
                <td>
                    <span class="badge ${estado.toLowerCase() === 'activo' ? 'bg-success' : 'bg-secondary'}">
                        ${estado}
                    </span>
                </td>
            `;
            
            tablaPacientesCuerpo.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al consumir API de Pacientes:", error);
        tablaPacientesCuerpo.innerHTML = `<tr><td colspan="5" class="text-center text-danger"><b>Error de Conexión:</b> No se pudo conectar con el microservicio de Pacientes. (Revisa la consola para más detalles)</td></tr>`;
    }
});
// --- Lógica para CREAR Especialidad ---
const form = document.getElementById('formEspecialidad');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // 1. Capturar datos del formulario
    const nombre = document.getElementById('postNombre').value;
    const codigo = document.getElementById('postCodigo').value;
    const descripcion = document.getElementById('postDescripcion').value;
    const requiere = document.getElementById('postReferencia').value;

    // 2. Armar la URL según tu controlador: crear/{nombre}/{codigo}/{descripcion}/{requiereReferencia}
    // Usamos encodeURIComponent para proteger espacios y caracteres especiales
    const urlPost = `https://especialidades-medicas-api.onrender.com/api/Especialidades/crear/${encodeURIComponent(nombre)}/${encodeURIComponent(codigo)}/${encodeURIComponent(descripcion)}/${requiere}`;

    try {
        const respuesta = await fetch(urlPost, {
            method: 'POST'
        });

        if (respuesta.ok) {
            alert("✅ Especialidad guardada con éxito.");
            form.reset(); // Limpiar formulario
            btnCargar.click(); // Recargar la tabla automáticamente para ver la nueva
        } else {
            const errorTexto = await respuesta.text();
            alert("❌ Error: " + errorTexto);
        }
    } catch (error) {
        console.error("Error al enviar datos:", error);
        alert("Hubo un fallo en la conexión con la nube.");
    }
});
