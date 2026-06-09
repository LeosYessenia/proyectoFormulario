document.addEventListener("DOMContentLoaded", () => {
    obtenerConsultas();
});

function renderizarTablaConsultas(listaConsultas) {
    const cuerpoTabla = document.getElementById("tablaConsultasCuerpo");
    cuerpoTabla.innerHTML = ""; 

    if (!listaConsultas || listaConsultas.length === 0 || listaConsultas[0] === null) {
        cuerpoTabla.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red; font-weight:bold;">No hay consultas agendadas disponibles.</td></tr>`;
        return;
    }

    listaConsultas.forEach(consulta => {
        if (!consulta) return;

        // CORRECCIÓN: Mapeo inteligente e infalible para evitar campos vacíos (undefined)
        const idMostrar = consulta.ID_Cita || consulta.id_cita || consulta.id || 'N/A';
        const fechaMostrar = consulta.Fecha_Consulta || consulta.fecha_consulta || '';
        const horaMostrar = consulta.Hora_Consulta || consulta.hora_consulta || '';
        const motivoMostrar = consulta.Motivo || consulta.motivo || '';
        const estadoMostrar = consulta.Estado || consulta.estado || '';

        cuerpoTabla.innerHTML += `
            <tr>
                <td>${idMostrar}</td>
                <td>${fechaMostrar}</td>
                <td>${horaMostrar}</td>
                <td>${motivoMostrar}</td>
                <td>${estadoMostrar}</td>
                <td style="text-align: center;">
                    <button onclick="eliminarConsultaDirecto('${idMostrar}')" style="background-color: #dc3545; color: white; border: none; padding: 6px 10px; cursor: pointer; border-radius: 4px; font-weight: bold;">🗑️ Borrar</button>
                </td>
            </tr>
        `;
    });
}

async function obtenerConsultas() {
    try {
        const respuesta = await fetch('/api/consultas');
        const consultas = await respuesta.json();
        renderizarTablaConsultas(consultas);
    } catch (error) {
        console.error("Error al cargar la tabla de consultas:", error);
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

async function agregarConsulta(){
    document.getElementById('id_cita').value = "Generando...";

    let fechaConsulta = document.getElementById("fecha_consulta").value;
    let horaConsulta = document.getElementById("hora_consulta").value;
    let motivo = document.getElementById("motivo").value;
    let estado = document.getElementById("estado").value;

    if(!fechaConsulta || !horaConsulta || !motivo || !estado){
        alert("Completa todos los campos obligatorios");
        document.getElementById('id_cita').value = ""; 
        return;
    }

    const datosConsulta = {
        Fecha_Consulta: fechaConsulta,
        Hora_Consulta: horaConsulta,
        Motivo: motivo,
        Estado: estado
    };

    try {
        const respuesta = await fetch('/api/consultas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosConsulta)
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            document.querySelectorAll("#seccionRegistrar input").forEach(input => input.value = "");
            alert(resultado.mensaje);
            obtenerConsultas(); 
        } else {
            alert("Error al agendar en el servidor: " + resultado.error);
            document.getElementById('id_cita').value = "";
        }
    } catch (error) {
        console.error("Error en la petición:", error);
        alert("No se pudo conectar con el servidor backend.");
        document.getElementById('id_cita').value = "";
    }
}

async function buscarConsultaPorId() {
    let idBuscar = document.getElementById("id_buscar").value.trim();
    if (idBuscar == "") { alert("Por favor, escribe un ID para buscar."); return; }

    try {
        const respuesta = await fetch(`/api/consultas/${idBuscar}`);

        if (respuesta.status === 404) {
            alert("Esa cita/consulta no existe.");
            return;
        }

        const consulta = await respuesta.json();
        renderizarTablaConsultas([consulta]);
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        alert("Hubo un problema de conexión con el servidor.");
    }
}

async function cargarConsultaParaEditar() {
    let idBuscar = document.getElementById("id_actualizar_buscar").value.trim();
    if (idBuscar == "") { alert("Escribe un ID primero."); return; }

    try {
        const respuesta = await fetch(`/api/consultas/${idBuscar}`);
        if (respuesta.status === 404) {
            document.getElementById("formularioEdicion").style.display = "none";
            alert("Consulta no localizada.");
            return;
        }
        const consulta = await respuesta.json();
        
        document.getElementById("act_fecha").value = consulta.Fecha_Consulta || consulta.fecha_consulta || '';
        document.getElementById("act_hora").value = consulta.Hora_Consulta || consulta.hora_consulta || '';
        document.getElementById("act_motivo").value = consulta.Motivo || consulta.motivo || '';
        document.getElementById("act_estado").value = consulta.Estado || consulta.estado || '';

        document.getElementById("formularioEdicion").style.display = "block";
    } catch (error) {
        alert("Error al cargar los datos de la consulta.");
    }
}

async function actualizarConsulta() {
    let idBuscar = document.getElementById("id_actualizar_buscar").value.trim();
   
    const datosActualizados = {
        Fecha_Consulta: document.getElementById("act_fecha").value,
        Hora_Consulta: document.getElementById("act_hora").value,
        Motivo: document.getElementById("act_motivo").value,
        Estado: document.getElementById("act_estado").value
    };

    try {
        const respuesta = await fetch(`/api/consultas/${idBuscar}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        const resultado = await respuesta.json();
        if (respuesta.ok) {
            alert(resultado.mensaje);
            document.getElementById("formularioEdicion").style.display = "none";
            document.getElementById("id_actualizar_buscar").value = "";
            obtenerConsultas();
        } else {
            alert("Error: " + resultado.error);
        }
    } catch (error) {
        alert("Error de red al actualizar.");
    }
}

async function eliminarConsulta() {
    let idEliminar = document.getElementById("id_eliminar").value.trim();
    if (idEliminar == "") { alert("Por favor ingresa un ID."); return; }
    await ejecutarEliminacionConsulta(idEliminar);
    document.getElementById("id_eliminar").value = "";
}

async function eliminarConsultaDirecto(id) {
    await ejecutarEliminacionConsulta(id);
}

async function ejecutarEliminacionConsulta(id) {
    if (!confirm(`¿Estás completamente segura de eliminar/cancelar la cita con ID ${id}?`)) return;

    try {
        const respuesta = await fetch(`/api/consultas/${id}`, { method: 'DELETE' });
        const resultado = await respuesta.json();
        
        if (respuesta.ok) {
            alert(resultado.mensaje);
            obtenerConsultas(); 
        } else {
            alert("No se pudo eliminar: " + resultado.error);
        }
    } catch (error) {
        alert("Error al intentar conectar para eliminar.");
    }
}
