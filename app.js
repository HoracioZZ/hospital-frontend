// Configuración de URLs
const API_URL = 'https://especialidades-medicas-api.onrender.com/api/Especialidades/lista';
const API_PACIENTES = 'https://gestionpacientes.onrender.com/api/pacientes/';

// Referencias a los elementos del HTML
const btnCargar = document.getElementById('btnCargarDatos');
const tablaCuerpo = document.getElementById('tablaCuerpo');
const btnCargarPacientes = document.getElementById('btnCargarPacientes');
const tablaPacientesCuerpo = document.getElementById('tablaPacientesCuerpo');
const form = document.getElementById('formEspecialidad');

// --- Función Auxiliar para Peticiones (Con reintento automático) ---
async function fetchConReintento(url, opciones = {}, reintentos = 2) {
    try {
        const respuesta = await fetch(url, opciones);
        if (!respuesta.ok) throw new Error(`Status: ${respuesta.status}`);
        return await respuesta.json();
    } catch (error) {
        if (reintentos > 0) {
            console.warn("Reintentando conexión...");
            return fetchConReintento(url, opciones, reintentos - 1);
        }
        throw error;
    }
}

// --- Listar Especialidades ---
btnCargar.addEventListener('click', async () => {
    tablaCuerpo.innerHTML = `<tr><td colspan="3" class="text-center text-primary fw-bold">Despertando servidor en la nube... ⏳</td></tr>`;

    try {
        const datos = await fetchConReintento(API_URL);
        tablaCuerpo.innerHTML = '';

        if (datos.length === 0) {
            tablaCuerpo.innerHTML = `<tr><td colspan="3" class="text-center text-warning">No hay especialidades activas.</td></tr>`;
            return;
        }

        datos.forEach(item => {
            const fila = document.createElement('tr');
            const codigo = item.codigo || item.Codigo || "S/C";
            const nombre = item.nombre || item.Nombre || item.nombre_especialidad || "Sin Nombre";
            const reqRef = item.requiereReferencia || item.requiere_referencia ? '✅ Sí' : '❌ No';
            
            // Renderizamos solo Código, Nombre y si requiere referencia (ocultamos estado)
            fila.innerHTML = `
                <td class="fw-bold">${codigo}</td>
                <td>${nombre}</td>
                <td class="text-center">${reqRef}</td>
            `;
            tablaCuerpo.appendChild(fila);
        });
    } catch (error) {
        console.error("Error:", error);
        tablaCuerpo.innerHTML = `<tr><td colspan="3" class="text-center text-danger"><b>Error:</b> El servidor tarda mucho en responder. Por favor, intenta de nuevo.</td></tr>`;
    }
});

// --- Listar Pacientes ---
btnCargarPacientes.addEventListener('click', async () => {
    tablaPacientesCuerpo.innerHTML = `<tr><td colspan="4" class="text-center text-info fw-bold">Conectando con Gestión Paciente... ⏳</td></tr>`;

    try {
        const pacientes = await fetchConReintento(API_PACIENTES);
        tablaPacientesCuerpo.innerHTML = '';

        pacientes.forEach(p => {
            const fila = document.createElement('tr');
            const codigo = p.codigo_paciente || "S/C";
            const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.trim() || "Sin Nombre";
            const ci = p.ci || "S/CI";
            const telefono = p.telefono || "S/T";
            
            // Ocultamos ID y Estado según instrucción del docente
            fila.innerHTML = `
                <td class="fw-bold text-info">${codigo}</td>
                <td>${nombreCompleto}</td>
                <td>${ci}</td>
                <td>${telefono}</td>
            `;
            tablaPacientesCuerpo.appendChild(fila);
        });
    } catch (error) {
        tablaPacientesCuerpo.innerHTML = `<tr><td colspan="4" class="text-center text-danger">No se pudo obtener la lista de pacientes.</td></tr>`;
    }
});

// --- Crear Especialidad ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnGuardar = form.querySelector('button[type="submit"]');
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = 'Guardando... ⏳';

    const nombre = document.getElementById('postNombre').value;
    const codigo = document.getElementById('postCodigo').value;
    const descripcion = document.getElementById('postDescripcion').value;
    const requiere = document.getElementById('postReferencia').value;

    const urlPost = `https://especialidades-medicas-api.onrender.com/api/Especialidades/crear/${encodeURIComponent(nombre)}/${encodeURIComponent(codigo)}/${encodeURIComponent(descripcion)}/${requiere}`;

    try {
        const respuesta = await fetch(urlPost, { method: 'POST' });
        if (respuesta.ok) {
            alert("✅ Especialidad guardada correctamente.");
            form.reset();
            btnCargar.click(); 
        } else {
            const texto = await respuesta.text();
            alert("❌ Error: " + texto);
        }
    } catch (error) {
        alert("Fallo de conexión. El servidor podría estar reiniciándose.");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '💾 Guardar Especialidad';
    }
});
