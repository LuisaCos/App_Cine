const db = require('../config/db');

exports.createSala = async (req, res) => {
  const { nombre, capacidad_filas, capacidad_col, pelicula_id } = req.body;

  if (!nombre || !capacidad_filas || !capacidad_col || !pelicula_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar película
    const [peliculaExiste] = await db.execute(
      'SELECT * FROM Peliculas WHERE idpelicula = ?',
      [pelicula_id]
    );
    if (peliculaExiste.length === 0) {
      return res.status(404).json({ message: 'La película no existe' });
    }

    const capacidad_total = capacidad_filas * capacidad_col;
    const [result] = await db.execute(
      'INSERT INTO Salas (nombre, capacidad_filas, capacidad_col, capacidad_t) VALUES (?, ?, ?, ?)',
      [nombre, capacidad_filas, capacidad_col, capacidad_total]
    );

    res.status(201).json({
      message: 'Sala creada correctamente',
      sala: {
        id: result.insertId,
        nombre,
        capacidad_filas,
        capacidad_col,
        capacidad_total,
        pelicula_id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la sala' });
  }
};

exports.getAllSalas = async (req, res) => {
  try {
    const [salas] = await db.execute(`
      SELECT s.*, p.titulo, p.poster FROM Salas s
      LEFT JOIN Peliculas p ON p.idpelicula = (
        SELECT peliculas_idpelicula FROM Funcion f WHERE f.salas_idsalas = s.idsalas LIMIT 1
      )
    `);
    res.status(200).json(salas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las salas' });
  }
};

exports.updateSala = async (req, res) => {
  const { id } = req.params;
  const { nombre, pelicula_id } = req.body;

  if (!nombre || !pelicula_id) {
    return res.status(400).json({ message: 'Nombre y pelicula_id son obligatorios' });
  }

  try {
    // Verificar sala y película existe
    const [salaExiste] = await db.execute('SELECT * FROM Salas WHERE idsalas = ?', [id]);
    if (salaExiste.length === 0) return res.status(404).json({ message: 'Sala no encontrada' });

    const [peliculaExiste] = await db.execute('SELECT * FROM Peliculas WHERE idpelicula = ?', [pelicula_id]);
    if (peliculaExiste.length === 0) return res.status(404).json({ message: 'Película no encontrada' });

    await db.execute('UPDATE Salas SET nombre = ? WHERE idsalas = ?', [nombre, id]);
    await db.execute(
      'UPDATE Funcion SET peliculas_idpelicula = ? WHERE salas_idsalas = ?',
      [pelicula_id, id]
    );

    res.status(200).json({ message: 'Sala y película actualizadas exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la sala' });
  }
};

exports.updateCapacidad = async (req, res) => {
  const { id } = req.params;
  const { capacidad_filas, capacidad_col } = req.body;

  if (!capacidad_filas || !capacidad_col) {
    return res.status(400).json({ message: 'Filas y columnas son obligatorios' });
  }

  try {
    const [salaExiste] = await db.execute('SELECT * FROM Salas WHERE idsalas = ?', [id]);
    if (salaExiste.length === 0) return res.status(404).json({ message: 'Sala no encontrada' });

    const [reservas] = await db.execute(`
      SELECT COUNT(*) AS total FROM Asientos a
      JOIN Funcion f ON a.funciones_idfunciones = f.idfunciones
      WHERE f.salas_idsalas = ? AND a.estado IN ('reservado', 'ocupado')
    `, [id]);

    if (reservas[0].total > 0) {
      return res.status(403).json({ message: 'No se puede modificar la capacidad, hay asientos reservados u ocupados' });
    }

    const capacidad_total = capacidad_filas * capacidad_col;

    await db.execute(
      'UPDATE Salas SET capacidad_filas = ?, capacidad_col = ?, capacidad_t = ? WHERE idsalas = ?',
      [capacidad_filas, capacidad_col, capacidad_total, id]
    );

    // Eliminar asientos antiguos y crear nuevos para funciones de esta sala
    const [funciones] = await db.execute('SELECT idfunciones FROM Funcion WHERE salas_idsalas = ?', [id]);

    for (const funcion of funciones) {
      await db.execute('DELETE FROM Asientos WHERE funciones_idfunciones = ?', [funcion.idfunciones]);
      for (let fila = 1; fila <= capacidad_filas; fila++) {
        for (let col = 1; col <= capacidad_col; col++) {
          await db.execute(
            'INSERT INTO Asientos (fila, columna, estado, funciones_idfunciones) VALUES (?, ?, ?, ?)',
            [fila, col, 'Disponible', funcion.idfunciones]
          );
        }
      }
    }

    res.status(200).json({ message: 'Capacidad actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al modificar la capacidad' });
  }
};

exports.deleteSala = async (req, res) => {
  const { id } = req.params;

  try {
    const [salaExiste] = await db.execute('SELECT * FROM Salas WHERE idsalas = ?', [id]);
    if (salaExiste.length === 0) return res.status(404).json({ message: 'Sala no encontrada' });

    await db.execute('DELETE FROM Salas WHERE idsalas = ?', [id]);
    res.status(200).json({ message: 'Sala eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la sala' });
  }
};