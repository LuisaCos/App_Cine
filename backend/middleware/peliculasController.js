const db = require('../config/db');

exports.obtainAll = async (req, res) => {
  try {
    const [peliculas] = await db.execute('SELECT * FROM peliculas');
    res.status(200).json(peliculas);
  } catch (error) {
    console.error('Error al obtener películas:', error);
    res.status(500).json({ message: 'Error al obtener las películas' });
  }
};

exports.obtainMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const [pelicula] = await db.execute('SELECT * FROM peliculas WHERE idpelicula = ?', [id]);

    if (pelicula.length === 0) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    res.status(200).json(pelicula[0]);
  } catch (error) {
    console.error('Error al obtener película:', error);
    res.status(500).json({ message: 'Error al obtener la película' });
  }
};

exports.createMovie = async (req, res) => {
  const { titulo, poster, duracion, descripcion, clasificacion, genero } = req.body;

  if (!titulo || !duracion) {
    return res.status(400).json({ message: 'El título y duración son obligatorios' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO peliculas (titulo, poster, duracion, descripcion, clasificacion, genero) VALUES (?, ?, ?, ?, ?, ?)',
      [titulo, poster || null, duracion, descripcion, clasificacion, genero]
    );

    res.status(201).json({
      message: 'Película creada con éxito',
      pelicula: {
        id: result.insertId,
        titulo,
        poster: poster || null,
        duracion,
        descripcion,
        clasificacion,
        genero
      }
    });
  } catch (error) {
    console.error('Error al crear película:', error);
    res.status(500).json({ message: 'Error al crear la película' });
  }
};

exports.updateMovie = async (req, res) => {
  const { id } = req.params;
  const { titulo, poster, duracion, descripcion, clasificacion, genero } = req.body;

  try {
    const idInt = parseInt(id, 10); 
    const [peliculaExiste] = await db.execute('SELECT * FROM peliculas WHERE idpelicula = ?', [idInt]);

    if (peliculaExiste.length === 0) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    await db.execute(
      'UPDATE peliculas SET titulo = ?, poster = ?, duracion = ?, descripcion = ?, clasificacion = ?, genero = ? WHERE idpelicula = ?',
      [
        titulo || peliculaExiste[0].titulo,
        poster || peliculaExiste[0].poster,
        duracion || peliculaExiste[0].duracion,
        descripcion || peliculaExiste[0].descripcion,
        clasificacion || peliculaExiste[0].clasificacion,
        genero || peliculaExiste[0].genero,
        id
      ]
    );

    res.status(200).json({ message: 'Película actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar película:', error);
    res.status(500).json({ message: 'Error al actualizar la película' });
  }
};

exports.deleteMovie = async (req, res) => {
  const { id } = req.params;

  try {
    const [peliculaExiste] = await db.execute('SELECT * FROM peliculas WHERE idpelicula = ?', [id]);

    if (peliculaExiste.length === 0) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    await db.execute('DELETE FROM peliculas WHERE idpelicula = ?', [id]);
    res.status(200).json({ message: 'Película eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar película:', error);
    res.status(500).json({ message: 'Error al eliminar la película' });
  }
};
