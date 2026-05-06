// Configuración de Endpoints
const API_BASE = 'https://especialidades-medicas-api.onrender.com/api';
const API_URL = `${API_BASE}/Especialidades/lista`;
const API_CARACT = `${API_BASE}/Caracteristicas`;
const API_ASIGNAR = `${API_BASE}/Especialidad_Caracteristica`;
const API_PACIENTES = 'https://gestionpacientes.onrender.com/api/pacientes/';

// Referencias de UI
const btnCargar = document.getElementById('btnCargarDatos');
const tablaCuerpo = document.getElementById('tablaCuerpo');
const btnCargarPacientes = document.getElementById('btnCargarPacientes');
const tablaPacientesCuerpo = document.getElementById('tablaPacientesCuerpo');
const formEsp = document.getElementById('formEspecialidad');

// --- Función de Petición con Gestión de Errores ---
async function fetchConReintento(url, opciones = {}, reintentos = 2) {
    try {
        const respuesta = await fetch(url, opciones);
        if (!respuesta.ok) throw new Error(`Error de Servidor: ${respuesta.status}`);
        return await respuesta.json();
    } catch (error) {
        if (reintentos > 0) return fetchConReintento(url, opciones, reintentos - 1);
        throw error;
    }
}

// --- Listado de Especialidades ---
btnCargar.addEventListener('click', async () => {
    tablaCuerpo.innerHTML = `<tr><td colspan="3" class="text-center text-primary">Estableciendo conexión con el servidor...</td></tr>`;
    try {
        const datos = await fetchConReintento(API_URL);
        tablaCuerpo.innerHTML = datos.length === 0 ? 
            `<tr><td colspan="3" class="text-center">No se encontraron registros activos.</td></tr>` : '';

        datos.forEach(item => {
            const fila = document.createElement('tr');
            const reqRef = (item.requiereReferencia || item.requiere_referencia) ? 'Sí' : 'No';
            fila.innerHTML = `
                <td class="fw-bold">${item.codigo || "N/A"}</td>
                <td>${item.nombre || item.nombre_especialidad}</td>
                <td class="text-center">${reqRef}</td>
            `;
            tablaCuerpo.appendChild(fila);
        });
    } catch (error) {
        tablaCuerpo.innerHTML = `<tr><td colspan="3" class="text-center text-danger">Error: El servidor no responde. Verifique la conexión.</td></tr>`;
    }
});

// --- Gestión de Características ---

// Cargar Selectores Dinámicos
async function cargarSelectores() {
    try {
        const [especialidades, caracteristicas] = await Promise.all([
            fetchConReintento(API_URL),
            fetchConReintento(`${API_CARACT}/lista`)
        ]);

        document.getElementById('selectEspecialidad').innerHTML = especialidades.map(e => 
            `<option value="${e.codigo}">${e.nombre || e.nombre_especialidad}</option>`).join('');
        
        document.getElementById('selectCaracteristica').innerHTML = caracteristicas.map(c => 
            `<option value="${c.codigo}">${c.nombre_caracteristica}</option>`).join('');
    } catch (e) {
        console.error("Error al poblar selectores");
    }
}

// Escuchar cambio de pestaña para cargar selects
document.getElementById('tab-caracteristicas').addEventListener('shown.bs.tab', cargarSelectores);

// Crear Característica (POST)
document.getElementById('formCrearCaracteristica').addEventListener('submit', async (e) => {
    e.preventDefault();
    const c = document.getElementById('charCodigo').value;
    const n = document.getElementById('charNombre').value;
    const t = document.getElementById('charTipo').value;
    
    try {
        const res = await fetch(`${API_CARACT}/crear/${c}/${encodeURIComponent(n)}/${t}`, { method: 'POST' });
        if (res.ok) {
            alert("Operación exitosa: Característica registrada.");
            e.target.reset();
            cargarSelectores();
        }
    } catch (err) { alert("Error en el registro."); }
});

// Asignar Característica a Especialidad (POST)
document.getElementById('formAsignar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const esp = document.getElementById('selectEspecialidad').value;
    const cha = document.getElementById('selectCaracteristica').value;
    const rel = document.getElementById('relacionCodigo').value;

    try {
        const res = await fetch(`${API_ASIGNAR}/asignar/${esp}/${cha}/${rel}`, { method: 'POST' });
        if (res.ok) {
            alert("Operación exitosa: Vinculación procesada.");
            document.getElementById('btnCargarReporte').click();
        } else {
            const msg = await res.text();
            alert("Error: " + msg);
        }
    } catch (err) { alert("Fallo de comunicación con el servidor."); }
});

// Reporte de Consolidación (Inner Join)
document.getElementById('btnCargarReporte').addEventListener('click', async () => {
    const tabla = document.getElementById('tablaReporte');
    tabla.innerHTML = '<tr><td colspan="3" class="text-center">Consultando registros...</td></tr>';
    try {
        const datos = await fetchConReintento(`${API_ASIGNAR}/reporte-completo-inner`);
        tabla.innerHTML = datos.map(d => `
            <tr>
                <td class="ps-3 fw-bold">${d.especialidad}</td>
                <td>${d.caracteristica}</td>
                <td><span class="badge bg-secondary">${d.tipo}</span></td>
            </tr>
        `).join('');
    } catch (e) { tabla.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error al recuperar el reporte.</td></tr>'; }
});

// --- Integración de Pacientes ---
btnCargarPacientes.addEventListener('click', async () => {
    tablaPacientesCuerpo.innerHTML = `<tr><td colspan="4" class="text-center">Sincronizando con Microservicio de Pacientes...</td></tr>`;
    try {
        const pacientes = await fetchConReintento(API_PACIENTES);
        tablaPacientesCuerpo.innerHTML = '';
        pacientes.forEach(p => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td class="fw-bold text-info">${p.codigo_paciente || "S/C"}</td>
                <td>${(p.nombre + ' ' + p.apellido).trim()}</td>
                <td>${p.ci}</td>
                <td>${p.telefono}</td>
            `;
            tablaPacientesCuerpo.appendChild(fila);
        });
    } catch (error) {
        tablaPacientesCuerpo.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Servicio externo no disponible.</td></tr>`;
    }
});

// --- Registro de Especialidad ---
formEsp.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = formEsp.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Procesando...';

    const n = document.getElementById('postNombre').value;
    const c = document.getElementById('postCodigo').value;
    const d = document.getElementById('postDescripcion').value;
    const r = document.getElementById('postReferencia').value;

    try {
        const res = await fetch(`${API_BASE}/Especialidades/crear/${encodeURIComponent(n)}/${encodeURIComponent(c)}/${encodeURIComponent(d)}/${r}`, { method: 'POST' });
        if (res.ok) {
            alert("Registro completado con éxito.");
            formEsp.reset();
            btnCargar.click();
        } else {
            const errorText = await res.text();
            alert("Error de validación: " + errorText);
        }
    } catch (error) {
        alert("Error crítico de conexión.");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Guardar en Base de Datos';
    }
});
