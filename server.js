const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const MONGO_URI = "mongodb+srv://Leos_Yessenia:ainessey13@vitaeyessenialeos.liulyir.mongodb.net/VITAE?appName=VITAEYesseniaLeos";

mongoose.connect(MONGO_URI)
    .then(() => console.log("¡Conectado exitosamente a MongoDB Atlas!"))
    .catch(err => console.error("Error al conectar a MongoDB:", err));


const PacientesSchema = new mongoose.Schema({
    ID_Paciente: String,
    Nombre_Completo: String,
    Fecha_nacimiento: String,
    Direccion: String,
    Correo_electronico: String,
    Genero: String,
    Telefono_personal: String,
    Telefono_emergencia: String,
    RFC: String,
    Seguro: String
});
const Pacientes = mongoose.model('Pacientes', PacientesSchema);

// --- Schema de Personal Clínico ---
const PersonalSchema = new mongoose.Schema({
    ID_Medico: String,
    Nombre_Completo: String,
    Especialidad: String,
    Cedula_Profesional: String,
    Telefono_Personal: String,
    Cargo: String,
    Turno: String,
    RFC: String
});
const Personal = mongoose.model('Personal', PersonalSchema);

// --- Schema de Consultas ---
const ConsultasSchema = new mongoose.Schema({
    ID_Cita: String,
    Fecha_Consulta: String,
    Hora_Consulta: String,
    Motivo: String,
    Estado: String
});
const Consultas = mongoose.model('Consultas', ConsultasSchema);


// ==========================================
// 2. RUTAS CRUD: PACIENTES
// ==========================================

app.get('/api/pacientes', async (req, res) => {
    try {
        const todosLosPacientes = await Pacientes.find();
        res.json(todosLosPacientes);
    } catch (error) {
        res.status(500).json({ error: "Error al recuperar los pacientes" });
    }
});

app.get('/api/pacientes/:id', async (req, res) => {
    try {
        const idBuscado = req.params.id;
        const pacienteEncontrado = await Pacientes.findOne({ ID_Paciente: idBuscado });
        if (!pacienteEncontrado) return res.status(404).json({ error: "Paciente no encontrado" });
        res.json(pacienteEncontrado);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar el paciente" });
    }
});

app.post('/api/pacientes', async (req, res) => {
    try {
        const totalPacientes = await Pacientes.countDocuments();
        const siguienteNumero = totalPacientes + 1;
        const idTresDigitos = String(siguienteNumero).padStart(3, '0');

        const nuevoPacientes = new Pacientes();
        nuevoPacientes.ID_Paciente = idTresDigitos;
        nuevoPacientes.Nombre_Completo = req.body.Nombre_Completo;
        nuevoPacientes.Fecha_nacimiento = req.body.Fecha_nacimiento;
        nuevoPacientes.Direccion = req.body.Direccion;
        nuevoPacientes.Correo_electronico = req.body.Correo_electronico;
        nuevoPacientes.Genero = req.body.Genero;
        nuevoPacientes.Telefono_personal = req.body.Telefono_personal;
        nuevoPacientes.Telefono_emergencia = req.body.Telefono_emergencia;
        nuevoPacientes.RFC = req.body.RFC;
        nuevoPacientes.Seguro = req.body.Seguro;

        await nuevoPacientes.save();
        res.json({ mensaje: "Paciente registrado correctamente con el ID: " + idTresDigitos });
    } catch (error) {
        res.status(500).json({ error: "No se pudo registrar en la base de datos" });
    }
});

app.put('/api/pacientes/:id', async (req, res) => {
    try {
        const idActualizar = req.params.id;
        const pacienteActualizado = await Pacientes.findOneAndUpdate({ ID_Paciente: idActualizar }, req.body, { new: true });
        if (!pacienteActualizado) return res.status(404).json({ error: "No se encontró el paciente" });
        res.json({ mensaje: "Datos del paciente actualizados con éxito", paciente: pacienteActualizado });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el paciente" });
    }
});

app.delete('/api/pacientes/:id', async (req, res) => {
    try {
        const idEliminar = req.params.id;
        const pacienteEliminado = await Pacientes.findOneAndDelete({ ID_Paciente: idEliminar });
        if (!pacienteEliminado) return res.status(404).json({ error: "No se encontró el paciente" });
        res.json({ mensaje: "Paciente eliminado de la base de datos correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el paciente" });
    }
});


// ==========================================
// 3. RUTAS CRUD: PERSONAL CLÍNICO
// ==========================================

app.get('/api/personal', async (req, res) => {
    try {
        const todoElPersonal = await Personal.find();
        res.json(todoElPersonal);
    } catch (error) {
        res.status(500).json({ error: "Error al recuperar el personal clínico" });
    }
});

app.get('/api/personal/:id', async (req, res) => {
    try {
        const empleadoEncontrado = await Personal.findOne({ ID_Medico: req.params.id });
        if (!empleadoEncontrado) return res.status(404).json({ error: "Miembro del personal no encontrado" });
        res.json(empleadoEncontrado);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar el personal" });
    }
});

app.post('/api/personal', async (req, res) => {
    try {
        const totalPersonal = await Personal.countDocuments();
        const idFormateado = "EMP-" + String(totalPersonal + 1).padStart(3, '0');

        const nuevoEmpleado = new Personal();
        nuevoEmpleado.ID_Medico = idFormateado;
        nuevoEmpleado.Nombre_Completo = req.body.Nombre_Completo;
        nuevoEmpleado.Especialidad = req.body.Especialidad;
        nuevoEmpleado.Cedula_Profesional = req.body.Cedula_Profesional;
        nuevoEmpleado.Telefono_Personal = req.body.Telefono_Personal;
        nuevoEmpleado.Cargo = req.body.Cargo;
        nuevoEmpleado.Turno = req.body.Turno;
        nuevoEmpleado.RFC = req.body.RFC;

        await nuevoEmpleado.save();
        res.json({ mensaje: "Miembro del personal registrado con éxito. ID: " + idFormateado });
    } catch (error) {
        res.status(500).json({ error: "Error al registrar personal en la base de datos" });
    }
});

app.put('/api/personal/:id', async (req, res) => {
    try {
        const personalActualizado = await Personal.findOneAndUpdate({ ID_Medico: req.params.id }, req.body, { new: true });
        if (!personalActualizado) return res.status(404).json({ error: "No se localizó el registro" });
        res.json({ mensaje: "Personal actualizado de forma correcta" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});

app.delete('/api/personal/:id', async (req, res) => {
    try {
        const eliminado = await Personal.findOneAndDelete({ ID_Medico: req.params.id });
        if (!eliminado) return res.status(404).json({ error: "No se encontró el registro a remover" });
        res.json({ mensaje: "Personal clínico removido exitosamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});


// ==========================================
// 4. RUTAS CRUD: CONSULTAS
// ==========================================

app.get('/api/consultas', async (req, res) => {
    try {
        const todasLasConsultas = await Consultas.find();
        res.json(todasLasConsultas);
    } catch (error) {
        res.status(500).json({ error: "Error al recuperar las consultas" });
    }
});

app.get('/api/consultas/:id', async (req, res) => {
    try {
        const consultaEncontrada = await Consultas.findOne({ ID_Cita: req.params.id });
        if (!consultaEncontrada) return res.status(404).json({ error: "Consulta no encontrada" });
        res.json(consultaEncontrada);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar la consulta" });
    }
});

app.post('/api/consultas', async (req, res) => {
    try {
        const totalConsultas = await Consultas.countDocuments();
        const idFormateado = "C-" + String(totalConsultas + 1).padStart(3, '0');

        const nuevaConsulta = new Consultas();
        nuevaConsulta.ID_Cita = idFormateado;
        nuevaConsulta.Fecha_Consulta = req.body.Fecha_Consulta;
        nuevaConsulta.Hora_Consulta = req.body.Hora_Consulta;
        nuevaConsulta.Motivo = req.body.Motivo;
        nuevaConsulta.Estado = req.body.Estado;

        await nuevaConsulta.save();
        res.json({ mensaje: "Consulta agendada con éxito. ID: " + idFormateado });
    } catch (error) {
        res.status(500).json({ error: "Error al guardar la consulta" });
    }
});

app.put('/api/consultas/:id', async (req, res) => {
    try {
        const consultaActualizada = await Consultas.findOneAndUpdate({ ID_Cita: req.params.id }, req.body, { new: true });
        if (!consultaActualizada) return res.status(404).json({ error: "Cita no encontrada" });
        res.json({ mensaje: "Consulta modificada con éxito" });
    } catch (error) {
        res.status(500).json({ error: "Error al modificar la consulta" });
    }
});

app.delete('/api/consultas/:id', async (req, res) => {
    try {
        const eliminada = await Consultas.findOneAndDelete({ ID_Cita: req.params.id });
        if (!eliminada) return res.status(404).json({ error: "No se localizó la cita para eliminar" });
        res.json({ mensaje: "Consulta cancelada y eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la consulta" });
    }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`==================================================`);
    console.log(`🚀 Servidor VITAE Encendido.`);
   
    if (process.env.IDX_WORKSPACE_ID) {
        const workspaceId = process.env.IDX_WORKSPACE_ID;
        console.log(`🌍 HAZ CLIC EN ESTE ENLACE PARA ABRIR TU PÁGINA:`);
        console.log(`https://5000-${workspaceId}.cloudworkstations.dev/pacientesformulario.html`);
    } else {
        console.log(`🔗 URL Local: http://localhost:${PORT}/pacientesformulario.html`);
    }
    console.log(`==================================================`);
});
