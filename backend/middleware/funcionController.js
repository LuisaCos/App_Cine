const db = require('../config/db');

exports.createFunction = async (req, res) => {
  try {
    const { horario, peliculas_idpelicula, salas_idsalas, precio, estado } = req.body;

    if (!horario || !peliculas_idpelicula || !salas_idsalas || !precio) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos: horario, peliculas_idpelicula, salas_idsalas, precio' 
      });
    }

    const [peliculas] = await db.execute('SELECT * FROM peliculas WHERE idpelicula = ?', [peliculas_idpelicula]);
    if (peliculas.length === 0) {
      return res.status(404).json({ success: false, message: 'La película especificada no existe' });
    }

    const [salas] = await db.execute('SELECT * FROM salas WHERE idsalas = ?', [salas_idsalas]);
    if (salas.length === 0) {
      return res.status(404).json({ success: false, message: 'La sala especificada no existe' });
    }

    const fechaHorario = new Date(horario);
    const duracionPelicula = peliculas[0].duracion || 135; //valor por si no se ingresa tiempo
    const finFuncion = new Date(fechaHorario);
    finFuncion.setMinutes(finFuncion.getMinutes() + duracionPelicula);

    const [funcionesExistentes] = await db.execute(
      `SELECT f.idfunciones, f.horario, p.duracion 
       FROM funcion f 
       JOIN peliculas p ON f.peliculas_idpelicula = p.idpelicula
       WHERE f.salas_idsalas = ? 
       AND f.estado != 'finalizado'`,
      [salas_idsalas]
    );

    for (const funcion of funcionesExistentes) {
      const inicioExistente = new Date(funcion.horario);
      const duracionExistente = funcion.duracion || 120;
      const finExistente = new Date(inicioExistente);
      finExistente.setMinutes(finExistente.getMinutes() + duracionExistente);

      if ((fechaHorario >= inicioExistente && fechaHorario < finExistente) || 
          (finFuncion > inicioExistente && finFuncion <= finExistente) ||
          (fechaHorario <= inicioExistente && finFuncion >= finExistente)) {
        return res.status(400).json({ success: false, message: 'La sala ya está reservada para otra función en ese horario' });
      }
    }

    const estadoFuncion = estado || 'programada';

    const [result] = await db.execute(
      'INSERT INTO funcion (horario, peliculas_idpelicula, salas_idsalas, precio, estado) VALUES (?, ?, ?, ?, ?)',
      [fechaHorario, peliculas_idpelicula, salas_idsalas, precio, estadoFuncion]
    );

    res.status(201).json({
      success: true,
      message: 'Función creada exitosamente',
      data: {
        idfunciones: result.insertId,
        horario: fechaHorario,
        peliculas_idpelicula,
        salas_idsalas,
        precio,
        estado: estadoFuncion
      }
    });
  } catch (error) {
    console.error('Error al crear función:', error);
    res.status(500).json({ success: false, message: 'Error al crear la función', error: error.message });
  }
};

exports.updateFunction = async (req, res) => {
  try {
    if (req.usuario.rol !== 'administrador') {
      return res.status(403).json({ success: false, message: 'Acceso denegado. Se requiere rol de administrador' });
    }

    const { idfunciones } = req.params;
    const { horario, peliculas_idpelicula, salas_idsalas, precio, estado } = req.body;

    const [funciones] = await db.execute('SELECT * FROM funcion WHERE idfunciones = ?', [idfunciones]);
    if (funciones.length === 0) {
      return res.status(404).json({ success: false, message: 'La función especificada no existe' });
    }

    const [reservas] = await db.execute('SELECT COUNT(*) as count FROM reserva WHERE funciones_idfunciones = ?', [idfunciones]);
    const tieneReservas = reservas[0].count > 0;

    const datosActualizar = {};
    const parametros = [];

    if (salas_idsalas !== undefined) {
      if (tieneReservas) {
        return res.status(400).json({ success: false, message: 'No se puede cambiar la sala porque la función ya tiene reservas' });
      }

      const [salas] = await db.execute('SELECT * FROM salas WHERE idsalas = ?', [salas_idsalas]);
      if (salas.length === 0) {
        return res.status(404).json({ success: false, message: 'La sala especificada no existe' });
      }

      datosActualizar.salas_idsalas = salas_idsalas;
      parametros.push(salas_idsalas);
    }

    if (peliculas_idpelicula !== undefined) {
      const [peliculas] = await db.execute('SELECT * FROM peliculas WHERE idpelicula = ?', [peliculas_idpelicula]);
      if (peliculas.length === 0) {
        return res.status(404).json({ success: false, message: 'La película especificada no existe' });
      }

      datosActualizar.peliculas_idpelicula = peliculas_idpelicula;
      parametros.push(peliculas_idpelicula);
    }

    if (horario !== undefined) {
      if (new Date(horario).toString() === 'Invalid Date') {
        return res.status(400).json({ success: false, message: 'Formato de horario inválido' });
      }

      datosActualizar.horario = horario;
      parametros.push(horario);
    }

    if (precio !== undefined) {
      datosActualizar.precio = precio;
      parametros.push(precio);
    }

    if (estado !== undefined) {
      if (!['programada', 'en curso', 'finalizado'].includes(estado)) {
        return res.status(400).json({ success: false, message: 'Estado inválido. Valores permitidos: programada, en curso, finalizado' });
      }

      datosActualizar.estado = estado;
      parametros.push(estado);
    }

    if (Object.keys(datosActualizar).length === 0) {
      return res.status(400).json({ success: false, message: 'No se proporcionaron datos para actualizar' });
    }

    const setClauses = Object.keys(datosActualizar).map(key => `${key} = ?`).join(', ');
    parametros.push(idfunciones);

    await db.execute(`UPDATE funcion SET ${setClauses} WHERE idfunciones = ?`, parametros);

    res.status(200).json({ success: true, message: 'Función actualizada exitosamente', data: { idfunciones, ...datosActualizar } });
  } catch (error) {
    console.error('Error al modificar función:', error);
    res.status(500).json({ success: false, message: 'Error al modificar la función', error: error.message });
  }
};

exports.obtainFunction = async (req, res) => {
  try {
    const [funciones] = await db.execute(
      `SELECT f.idfunciones, f.horario, f.precio, f.estado,
              p.idpelicula, p.titulo, p.poster, p.duracion, p.descripcion,
              s.idsalas, s.nombre as sala_nombre, s.capacidad_t
       FROM funcion f
       JOIN peliculas p ON f.peliculas_idpelicula = p.idpelicula
       JOIN salas s ON f.salas_idsalas = s.idsalas
       WHERE f.estado IN ('programada', 'en curso')
       ORDER BY f.horario ASC`
    );

    for (let i = 0; i < funciones.length; i++) {
      const [ocupados] = await db.execute(
        'SELECT COUNT(*) as count FROM asientos WHERE funciones_idfunciones = ? AND estado != "Disponible"',
        [funciones[i].idfunciones]
      );

      funciones[i].asientos_disponibles = funciones[i].capacidad_t - ocupados[0].count;
    }

    res.status(200).json({ success: true, count: funciones.length, data: funciones });
  } catch (error) {
    console.error('Error al listar funciones disponibles:', error);
    res.status(500).json({ success: false, message: 'Error al listar las funciones disponibles', error: error.message });
  }
};

// Obtener detalles de una función específica
exports.obtenerDetallesFuncion = async (req, res) => {
  try {
    const { idfunciones } = req.params;

    const [funciones] = await db.execute(
      `SELECT f.idfunciones, f.horario, f.precio, f.estado,
              p.idpelicula, p.titulo, p.poster, p.duracion, p.descripcion, p.genero, p.clasificacion,
              s.idsalas, s.nombre as sala_nombre, s.capacidad_filas, s.capacidad_col, s.capacidad_t
       FROM funcion f
       JOIN peliculas p ON f.peliculas_idpelicula = p.idpelicula
       JOIN salas s ON f.salas_idsalas = s.idsalas
       WHERE f.idfunciones = ?`,
      [idfunciones]
    );

    if (funciones.length === 0) {
      return res.status(404).json({ success: false, message: 'Función no encontrada' });
    }

    const funcion = funciones[0];

    const [ocupados] = await db.execute(
      'SELECT COUNT(*) as count FROM asientos WHERE funciones_idfunciones = ? AND estado != "Disponible"',
      [idfunciones]
    );

    funcion.asientos_disponibles = funcion.capacidad_t - ocupados[0].count;

    const fechasDisponibles = [];
    const hoy = new Date();

    for (let i = 1; i <= 8; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + i);

      fechasDisponibles.push({
        fecha: fecha.toISOString().split('T')[0],
        etiqueta: fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
      });
    }

    funcion.fechas_disponibles = fechasDisponibles;

    res.status(200).json({ success: true, data: funcion });
  } catch (error) {
    console.error('Error al obtener detalles de función:', error);
    res.status(500).json({ success: false, message: 'Error al obtener detalles de la función', error: error.message });
  }
};

// Obtener estado de asientos para una función en una fecha específica
exports.obtenerAsientosFuncion = async (req, res) => {
  try {
    const { idfunciones } = req.params;
    const { fecha } = req.query;

    if (!fecha || new Date(fecha).toString() === 'Invalid Date') {
      return res.status(400).json({ success: false, message: 'Fecha inválida o no especificada' });
    }

    const [salas] = await db.execute(
      `SELECT s.idsalas, s.nombre, s.capacidad_filas, s.capacidad_col
       FROM funcion f
       JOIN salas s ON f.salas_idsalas = s.idsalas
       WHERE f.idfunciones = ?`,
      [idfunciones]
    );

    if (salas.length === 0) {
      return res.status(404).json({ success: false, message: 'Función no encontrada' });
    }

    const sala = salas[0];

    const [asientosOcupados] = await db.execute(
      `SELECT a.fila, a.columna, a.estado
       FROM asientos a
       JOIN reserva r ON a.reservaciones_idreservaciones = r.idreservaciones
       JOIN funcion f ON r.funciones_idfunciones = f.idfunciones
       WHERE f.idfunciones = ? AND DATE(f.horario) = ?`,
      [idfunciones, fecha]
    );

    const asientos = [];

    for (let fila = 1; fila <= sala.capacidad_filas; fila++) {
      const filasAsientos = [];

      for (let columna = 1; columna <= sala.capacidad_col; columna++) {
        const asientoOcupado = asientosOcupados.find(a => a.fila === fila && a.columna === columna);

        filasAsientos.push({
          fila,
          columna,
          estado: asientoOcupado ? asientoOcupado.estado : 'Disponible'
        });
      }

      asientos.push(filasAsientos);
    }

    res.status(200).json({
      success: true,
      data: {
        sala: sala.nombre,
        capacidad_filas: sala.capacidad_filas,
        capacidad_col: sala.capacidad_col,
        fecha,
        asientos
      }
    });
  } catch (error) {
    console.error('Error al obtener asientos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el estado de los asientos', error: error.message });
  }
};