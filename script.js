document.addEventListener("DOMContentLoaded", () => {
    obtenerPacientes();
});

function renderizarTabla(listaPacientes) {
    const cuerpoTabla = document.getElementById("tablaPacientesCuerpo");
    cuerpoTabla.innerHTML = ""; 

    if (!listaPacientes || listaPacientes.length === 0 || listaPacientes[0] === null) {
        cuerpoTabla.innerHTML = `<tr><td colspan="11" style="text-align:center; color:red; font-weight:bold;">No hay registros disponibles.</td></tr>`;
        return;
    }

    listaPacientes.forEach(paciente => {
        if (!paciente) return;

        const idMostrar = paciente.ID_Paciente || paciente.id_paciente || paciente.id || 'N/A';

        cuerpoTabla.innerHTML += `
            <tr>
                <td>${idMostrar}</td>
                <td>${paciente.Nombre_Completo || ''}</td>
                <td>${paciente.Fecha_nacimiento || ''}</td>
                <td>${paciente.Direccion || ''}</td>
                <td>${paciente.Correo_electronico || ''}</td>
                <td>${paciente.Genero || ''}</td>
                <td>${paciente.Telefono_personal || ''}</td>
                <td>${paciente.Telefono_emergencia || ''}</td>
                <td>${paciente.RFC || ''}</td>
                <td>${paciente.Seguro || ''}</td>
                <td style="text-align: center;">
                    <button onclick="eliminarDirecto('${idMostrar}')" style="background-color: #dc3545; color: white; border: none; padding: 6px 10px; cursor: pointer; border-radius: 4px; font-weight: bold;">🗑️ Borrar</button>
                </td>
            </tr>
        `;
    });
}

async function obtenerPacientes() {
    try {
        const respuesta = await fetch('/api/pacientes');
        const pacientes = await respuesta.json();
        renderizarTabla(pacientes);
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
    }
}

function cambiarModo(modo) {
    const secciones = {
        registrar: document.getElementById("seccionRegistrar"),
        buscar: document.getElementById("seccionBuscar"),
        actualizar: document.getElementById("seccionActualizar"),
        eliminar: document.getElementById("seccionEliminar")
    };

    const botones = {
        registrar: document.getElementById("btnModoRegistrar"),
        buscar: document.getElementById("btnModoBuscar"),
        actualizar: document.getElementById("btnModoActualizar"),
        eliminar: document.getElementById("btnModoEliminar")
    };

    for (let key in secciones) {
        if (secciones[key]) secciones[key].style.display = "none";
        if (botones[key]) {
            botones[key].style.backgroundColor = "#f4f4f4";
            botones[key].style.color = "#333";
            botones[key].style.border = "1px solid #ddd";
        }
    }

    if (secciones[modo]) secciones[modo].style.display = "block";
    if (botones[modo]) {
        botones[modo].style.backgroundColor = modo === 'eliminar' ? '#dc3545' : modo === 'actualizar' ? '#ffc107' : '#067F8F';
        botones[modo].style.color = modo === 'actualizar' ? 'black' : 'white';
        botones[modo].style.border = "none";
    }
}

async function agregarPacientes(){
    document.getElementById('id_paciente').value = "Generando...";

    let nombreCompleto = document.getElementById("nombre_completo").value;
    let fechaNacimiento = document.getElementById("fecha_nacimiento").value;
    let direccion = document.getElementById("direccion").value;
    let correoElectronico = document.getElementById("correo_electronico").value;
    let genero = document.getElementById("genero").value;
    let telefonoPersonal = document.getElementById("telefono_personal").value;
    let telefonoEmergencia = document.getElementById("telefono_emergencia").value;
    let rfc = document.getElementById("rfc").value;
    let seguro = document.getElementById("seguro").value;

    if(!nombreCompleto || !fechaNacimiento || !direccion || !correoElectronico || !genero || !telefonoPersonal || !telefonoEmergencia || !rfc || !seguro){
        alert("Completa todos los campos obligatorios");
        document.getElementById('id_paciente').value = ""; 
        return;
    }

    const datosPacientes = {
        ID_Paciente: "", 
        Nombre_Completo: nombreCompleto,
        Fecha_nacimiento: fechaNacimiento,
        Direccion: direccion,
        Correo_electronico: correoElectronico,
        Genero: genero,
        Telefono_personal: telefonoPersonal,
        Telefono_emergencia: telefonoEmergencia,
        RFC: rfc,
        Seguro: seguro
    };

    try {
        const respuesta = await fetch('https://proyectoformulario.onrender.com/api/personal');
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPacientes)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            // Limpia los campos de texto del formulario
            document.querySelectorAll("#seccionRegistrar input").forEach(input => input.value = "");
            alert(resultado.mensaje);
            obtenerPacientes(); 
        } else {
            alert("Error al guardar en el servidor: " + resultado.error);
            document.getElementById('id_paciente').value = "";
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("No se pudo conectar con el servidor backend.");
        document.getElementById('id_paciente').value = "";
    }
}

async function buscarPacientePorId() {
    let idBuscar = document.getElementById("id_buscar").value.trim();
    if (idBuscar == "") { alert("Por favor, escribe un ID para buscar."); return; }

    try {
        const respuesta = await fetch(`/api/pacientes/${idBuscar}`);

        if (respuesta.status === 404) {
            alert("Ese paciente no existe.");
            return;
        }

        const paciente = await respuesta.json();
        renderizarTabla([paciente]);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        alert("Hubo un problema de conexión con el servidor.");
    }
}

async function cargarPacienteParaEditar() {
    let idBuscar = document.getElementById("id_actualizar_buscar").value.trim();
    if (idBuscar == "") { alert("Escribe un ID primero."); return; }

    try {
        const respuesta = await fetch(`/api/pacientes/${idBuscar}`);
        if (respuesta.status === 404) {
            document.getElementById("formularioEdicion").style.display = "none";
            alert("Paciente no localizado.");
            return;
        }
        const paciente = await respuesta.json();
        
        document.getElementById("act_nombre").value = paciente.Nombre_Completo;
        document.getElementById("act_fecha").value = paciente.Fecha_nacimiento;
        document.getElementById("act_direccion").value = paciente.Direccion;
        document.getElementById("act_correo").value = paciente.Correo_electronico;
        document.getElementById("act_genero").value = paciente.Genero;
        document.getElementById("act_telef_per").value = paciente.Telefono_personal;
        document.getElementById("act_telef_eme").value = paciente.Telefono_emergencia;
        document.getElementById("act_rfc").value = paciente.RFC;
        document.getElementById("act_seguro").value = paciente.Seguro;

        document.getElementById("formularioEdicion").style.display = "block";
    } catch (error) {
        alert("Error al cargar los datos del paciente.");
    }
}

async function actualizarPaciente() {
    let idBuscar = document.getElementById("id_actualizar_buscar").value.trim();
   
    const datosActualizados = {
        Nombre_Completo: document.getElementById("act_nombre").value,
        Fecha_nacimiento: document.getElementById("act_fecha").value,
        Direccion: document.getElementById("act_direccion").value,
        Correo_electronico: document.getElementById("act_correo").value,
        Genero: document.getElementById("act_genero").value,
        Telefono_personal: document.getElementById("act_telef_per").value,
        Telefono_emergencia: document.getElementById("act_telef_eme").value,
        RFC: document.getElementById("act_rfc").value,
        Seguro: document.getElementById("act_seguro").value
    };

    try {
        const respuesta = await fetch(`/api/pacientes/${idBuscar}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        const resultado = await respuesta.json();
        if (respuesta.ok) {
            alert(resultado.mensaje);
            document.getElementById("formularioEdicion").style.display = "none";
            document.getElementById("id_actualizar_buscar").value = "";
            obtenerPacientes();
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (error) {
        alert("Error de red al actualizar.");
    }
}

async function eliminarPaciente() {
    let idEliminar = document.getElementById("id_eliminar").value.trim();
    if (idEliminar == "") { alert("Por favor ingresa un ID."); return; }
    await ejecutarEliminacion(idEliminar);
    document.getElementById("id_eliminar").value = "";
}

async function eliminarDirecto(id) {
    await ejecutarEliminacion(id);
}

async function ejecutarEliminacion(id) {
    if (!confirm(`¿Estás completamente segura de eliminar al paciente con ID ${id}?`)) return;

    try {
        const respuesta = await fetch(`/api/pacientes/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        
        if (respuesta.ok) {
            alert(resultado.mensaje);
            obtenerPacientes(); 
        } else {
            alert("No se pudo eliminar: " + resultado.error);
        }
    } catch (error) {
        alert("Error al intentar conectar para eliminar.");
    }
}
