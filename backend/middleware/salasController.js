const db = require('../config/db');

// Crear sala de cine (usuario administrador)
exports.createSala = async (req, res) => {
  try {
    const { nombre, capacidad_filas, capacidad_col } = req.body;
    
    // Validaciones
    if (!nombre || !capacidad_filas || !capacidad_col) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos: nombre, capacidad_filas, capacidad_col' 
      });
    }
    
    // Calcular capacidad total
    const capacidad_t = capacidad_filas * capacidad_col;
    
    // Insertar la sala en la base de datos
    const [result] = await db.execute(
      'INSERT INTO salas (nombre, capacidad_filas, capacidad_col, capacidad_t) VALUES (?, ?, ?, ?)',
      [nombre, capacidad_filas, capacidad_col, capacidad_t]
    );
    
    const salaId = result.insertId;
    
    res.status(201).json({
      success: true,
      message: 'Sala creada exitosamente',
      data: {
        idsalas: salaId,
        nombre,
        capacidad_filas,
        capacidad_col,
        capacidad_t
      }
    });
  } catch (error) {
    console.error('Error al crear sala:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la sala',
      error: error.message
    });
  }
};

// Modificar capacidad de sala (usuario administrador)
exports.updateCapacitySala = async (req, res) => {
  try {
    const { idsalas } = req.params;
    const { capacidad_filas, capacidad_col } = req.body;
    
    // Validaciones
    if (!capacidad_filas || !capacidad_col) {
      return res.status(400).json({ 
        success: false, 
        message: 'Faltan datos requeridos: capacidad_filas, capacidad_col' 
      });
    }
    
    // Verificar que la sala exista
    const [salas] = await db.execute(
      'SELECT * FROM salas WHERE idsalas = ?',
      [idsalas]
    );
    
    if (salas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La sala especificada no existe'
      });
    }
    
    // Verificar que no haya asientos reservados para esta sala
    const [funciones] = await db.execute(
      'SELECT idfunciones FROM funcion WHERE salas_idsalas = ?',
      [idsalas]
    );
    
    if (funciones.length > 0) {
      // Obtener los IDs de las funciones
      const funcionesIds = funciones.map(funcion => funcion.idfunciones);
      
      // Verificar si hay reservaciones para estas funciones
      const [reservas] = await db.execute(
        `SELECT r.idreservaciones 
         FROM reserva r
         WHERE r.funciones_idfunciones IN (${funcionesIds.join(',')})
         AND r.estado != 'Finalizado'`
      );
      
      if (reservas.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede modificar la capacidad de la sala porque tiene asientos reservados'
        });
      }
    }
    
    // Calcular nueva capacidad total
    const capacidad_t = capacidad_filas * capacidad_col;
    
    // Actualizar la sala en la base de datos
    await db.execute(
      'UPDATE salas SET capacidad_filas = ?, capacidad_col = ?, capacidad_t = ? WHERE idsalas = ?',
      [capacidad_filas, capacidad_col, capacidad_t, idsalas]
    );
    
    res.status(200).json({
      success: true,
      message: 'Capacidad de la sala actualizada exitosamente',
      data: {
        idsalas,
        capacidad_filas,
        capacidad_col,
        capacidad_t
      }
    });
  } catch (error) {
    console.error('Error al modificar capacidad de sala:', error);
    res.status(500).json({
      success: false,
      message: 'Error al modificar la capacidad de la sala',
      error: error.message
    });
  }
};