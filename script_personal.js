document.addEventListener("DOMContentLoaded", () => {
    obtenerPersonal();
});

function renderizarTablaPersonal(listaPersonal) {
    const cuerpoTabla = document.getElementById("tablaPersonalCuerpo");
    cuerpoTabla.innerHTML = ""; 

    if (!listaPersonal || listaPersonal.length === 0 || listaPersonal[0] === null) {
        cuerpoTabla.innerHTML = `<tr><td colspan="9" style="text-align:center; color:red; font-weight:bold;">No hay personal registrado disponible.</td></tr>`;
        return;
    }

    listaPersonal.forEach(empleado => {
        if (!empleado) return;

        const idMostrar = empleado.ID_Medico || empleado.id_medico || empleado.id || 'N/A';

        cuerpoTabla.innerHTML += `
            <tr>
                <td>${idMostrar}</td>
                <td>${empleado.Nombre_Completo || ''}</td>
                <td>${empleado.Especialidad || ''}</td>
                <td>${empleado.Cedula_Profesional || ''}</td>
                <td>${empleado.Telefono_Personal || ''}</td>
                <td>${empleado.Cargo || ''}</td>
                <td>${empleado.Turno || ''}</td>
                <td>${empleado.RFC || ''}</td>
                <td style="text-align: center;">
                    <button onclick="eliminarPersonalDirecto('${idMostrar}')" style="background-color: #dc3545; color: white; border: none; padding: 6px 10px; cursor: pointer; border-radius: 4px; font-weight: bold;">🗑️ Borrar</button>
                </td>
            </tr>
        `;
    });
}

async function obtenerPersonal() {
    try {
        const respuesta = await fetch('/api/personal');
        const personal = await respuesta.json();
        renderizarTablaPersonal(personal);
    } catch (error) {
        console.error("Error al cargar la tabla de personal:", error);
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

async function agregarPersonal(){
    document.getElementById('id_medico').value = "Generando...";

    let nombreCompleto = document.getElementById("nombre_completo").value;
    let especialidad = document.getElementById("especialidad").value;
    let cedula = document.getElementById("cedula").value;
    let telefonoPersonal = document.getElementById("telefono_personal").value;
    let cargo = document.getElementById("cargo").value;
    let turno = document.getElementById("turno").value;
    let rfc = document.getElementById("rfc").value;

    if(!nombreCompleto || !especialidad || !cedula || !telefonoPersonal || !cargo || !turno || !rfc){
        alert("Completa todos los campos obligatorios");
        document.getElementById('id_medico').value = ""; 
        return;
    }

    const datosPersonal = {
        Nombre_Completo: nombreCompleto,
        Especialidad: especialidad,
        Cedula_Profesional: cedula,
        Telefono_Personal: telefonoPersonal,
        Cargo: cargo,
        Turno: turno,
        RFC: rfc
    };

    try {
        const respuesta = await fetch('https://proyectoformulario.onrender.com/api/personal');
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPersonal)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            document.querySelectorAll("#seccionRegistrar input").forEach(input => input.value = "");
            alert(resultado.mensaje);
            obtenerPersonal(); 
        } else {
            alert("Error al guardar en el servidor: " + resultado.error);
            document.getElementById('id_medico').value = "";
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("No se pudo conectar con el servidor backend.");
        document.getElementById('id_medico').value = "";
    }
}

async function buscarPersonalPorId() {
    let idBuscar = document.getElementById("id_buscar").value.trim();
    if (idBuscar == "") { alert("Por favor, escribe un ID para buscar."); return; }

    try {
        const respuesta = await fetch(`/api/personal/${idBuscar}`);

        if (respuesta.status === 404) {
            alert("Ese miembro del personal no existe.");
            return;
        }

        const empleado = await respuesta.json();
        renderizarTablaPersonal([empleado]);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        alert("Hubo un problema de conexión con el servidor.");
    }
}

async function cargarPersonalParaEditar() {
    let idBuscar = document.getElementById("id_actualizar_buscar").value.trim();
    if (idBuscar == "") { alert("Escribe un ID primero."); return; }

    try {
        const respuesta = await fetch(`/api/personal/${idBuscar}`);
        if (respuesta.status === 404) {
            document.getElementById("formularioEdicion").style.display = "none";
            alert("Personal no localizado.");
            return;
        }
        const empleado = await respuesta.json();
        
        document.getElementById("act_nombre").value = empleado.Nombre_Completo || empleado.nombre_completo || '';
        document.getElementById("act_especialidad").value = empleado.Especialidad || empleado.especialidad || '';
        document.getElementById("act_cedula").value = empleado.Cedula_Profesional || empleado.cedula_profesional || '';
        document.getElementById("act_telef_per").value = empleado.Telefono_Personal || empleado.telefono_personal || '';
        document.getElementById("act_cargo").value = empleado.Cargo || empleado.cargo || '';
        document.getElementById("act_turno").value = empleado.Turno || empleado.turno || '';
        document.getElementById("act_rfc").value = empleado.RFC || empleado.rfc || '';

        document.getElementById("formularioEdicion").style.display = "block";
    } catch (error) {
        alert("Error al cargar los datos del personal.");
    }
}

async function actualizarPersonal() {
    let idBuscar = document.getElementById("id_actualizar_buscar").value.trim();
   
    const datosActualizados = {
        Nombre_Completo: document.getElementById("act_nombre").value,
        Especialidad: document.getElementById("act_especialidad").value,
        Cedula_Profesional: document.getElementById("act_cedula").value,
        Telefono_Personal: document.getElementById("act_telef_per").value,
        Cargo: document.getElementById("act_cargo").value,
        Turno: document.getElementById("act_turno").value,
        RFC: document.getElementById("act_rfc").value
    };

    try {
        const respuesta = await fetch(`/api/personal/${idBuscar}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        const resultado = await respuesta.json();
        if (respuesta.ok) {
            alert(resultado.mensaje);
            document.getElementById("formularioEdicion").style.display = "none";
            document.getElementById("id_actualizar_buscar").value = "";
            obtenerPersonal();
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (error) {
        alert("Error de red al actualizar.");
    }
}

async function eliminarPersonal() {
    let idEliminar = document.getElementById("id_eliminar").value.trim();
    if (idEliminar == "") { alert("Por favor ingresa un ID."); return; }
    await ejecutarEliminacionPersonal(idEliminar);
    document.getElementById("id_eliminar").value = "";
}

async function eliminarPersonalDirecto(id) {
    await ejecutarEliminacionPersonal(id);
}

async function ejecutarEliminacionPersonal(id) {
    if (!confirm(`¿Estás completamente segura de eliminar al miembro del personal con ID ${id}?`)) return;

    try {
        const respuesta = await fetch(`/api/personal/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        
        if (respuesta.ok) {
            alert(resultado.mensaje);
            obtenerPersonal(); 
        } else {
            alert("No se pudo eliminar: " + resultado.error);
        }
    } catch (error) {
        alert("Error al intentar conectar para eliminar.");
    }
}
