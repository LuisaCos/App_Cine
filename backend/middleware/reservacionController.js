const db = require('../config/db');
const QRCode = require('qrcode');

// Crear una reservación de asientos
exports.crearReservacion = async (req, res) => {
  try {
    const { funciones_idfunciones, asientos, fecha } = req.body;
    const usuario_id = req.usuario.idusuario;

    // Validar datos
    if (!funciones_idfunciones || !asientos || !Array.isArray(asientos) || asientos.length === 0 || !fecha) {
      return res.status(400).json({
        success: false,
        message: 'Datos de reservación inválidos. Se requiere funciones_idfunciones, un array de asientos y una fecha'
      });
    }

    // Verificar que la fecha esté dentro de los próximos 8 días
    const hoy = new Date();
    const fechaSeleccionada = new Date(fecha);
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(hoy.getDate() + 8);

    if (fechaSeleccionada < hoy || fechaSeleccionada > fechaLimite) {
      return res.status(400).json({
        success: false,
        message: 'La fecha debe estar dentro de los próximos 8 días'
      });
    }

    // Verificar que la función exista
    const [funciones] = await db.execute(
      'SELECT f.*, p.titulo, s.nombre AS sala_nombre, s.capacidad_filas, s.capacidad_col, p.duracion ' +
      'FROM funcion f ' +
      'JOIN películas p ON f.peliculas_idpelicula = p.idpelicula ' +
      'JOIN salas s ON f.salas_idsalas = s.idsalas ' +
      'WHERE f.idfunciones = ?',
      [funciones_idfunciones]
    );

    if (funciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La función especificada no existe'
      });
    }

    const funcion = funciones[0];

    // Verificar que la función no haya finalizado
    if (funcion.estado === 'finalizado') {
      return res.status(400).json({
        success: false,
        message: 'No se pueden reservar asientos para una función finalizada'
      });
    }

    // Verificar que los asientos solicitados sean válidos
    for (const asiento of asientos) {
      const { fila, columna } = asiento;

      // Verificar que la fila y columna sean números válidos
      if (typeof fila !== 'number' || typeof columna !== 'number' ||
          fila < 1 || fila > funcion.capacidad_filas ||
          columna < 1 || columna > funcion.capacidad_col) {
        return res.status(400).json({
          success: false,
          message: `Asiento inválido: fila ${fila}, columna ${columna}`
        });
      }

      // Verificar que el asiento no esté ya reservado en la fecha seleccionada
      const [asientosReservados] = await db.execute(
        'SELECT * FROM asientos ' +
        'WHERE fila = ? AND columna = ? AND funciones_idfunciones = ? AND estado != "Disponible" AND DATE(horario) = ?',
        [fila, columna, funciones_idfunciones, fecha]
      );

      if (asientosReservados.length > 0) {
        return res.status(400).json({
          success: false,
          message: `El asiento en fila ${fila}, columna ${columna} ya está reservado`
        });
      }
    }

    // Calcular precio total (precio de la función * número de asientos)
    const precioTotal = funcion.precio * asientos.length;

    // Crear la reservación
    const [resultReserva] = await db.execute(
      'INSERT INTO reserva (estado, usuario_idusuario, funciones_idfunciones, asientos, precioTotal) VALUES (?, ?, ?, ?, ?)',
      ['en curso', usuario_id, funciones_idfunciones, JSON.stringify(asientos), precioTotal]
    );

    const reservacionId = resultReserva.insertId;

    // Reservar los asientos seleccionados
    for (const asiento of asientos) {
      const { fila, columna } = asiento;

      await db.execute(
        'INSERT INTO asientos (fila, columna, reservaciones_idreservaciones, estado, funciones_idfunciones, horario) VALUES (?, ?, ?, ?, ?, ?)',
        [fila, columna, reservacionId, 'reservado', funciones_idfunciones, fecha]
      );
    }

    // Obtener datos para la respuesta
    const asientosStr = asientos.map(a => `Fila ${a.fila}, Columna ${a.columna}`).join('; ');

    res.status(201).json({
      success: true,
      message: 'Reservación creada exitosamente',
      data: {
        idreservaciones: reservacionId,
        usuario_idusuario: usuario_id,
        funciones_idfunciones,
        pelicula: funcion.titulo,
        sala: funcion.sala_nombre,
        asientos: asientosStr,
        precioTotal,
        estado: 'en curso'
      }
    });
  } catch (error) {
    console.error('Error al crear reservación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la reservación',
      error: error.message
    });
  }
};

// Confirmar reservación (simular pago)
exports.confirmarReservacion = async (req, res) => {
  try {
    const { idreservaciones } = req.params;
    const { tarjeta } = req.body; // Datos ficticios de tarjeta

    // Validar datos de tarjeta (simulación)
    if (!tarjeta || !tarjeta.numero || !tarjeta.nombre || !tarjeta.vencimiento || !tarjeta.cvv) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos de la tarjeta de crédito'
      });
    }

    // Verificar que la reservación exista y pertenezca al usuario
    const [reservas] = await db.execute(
      'SELECT r.*, f.horario, p.titulo AS pelicula, s.nombre AS sala ' +
      'FROM reserva r ' +
      'JOIN funcion f ON r.funciones_idfunciones = f.idfunciones ' +
      'JOIN películas p ON f.peliculas_idpelicula = p.idpelicula ' +
      'JOIN salas s ON f.salas_idsalas = s.idsalas ' +
      'WHERE r.idreservaciones = ? AND r.usuario_idusuario = ?',
      [idreservaciones, req.usuario.idusuario]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada o no pertenece al usuario'
      });
    }

    const reserva = reservas[0];

    // Verificar que la reservación esté en estado "en curso"
    if (reserva.estado !== 'en curso') {
      return res.status(400).json({
        success: false,
        message: 'La reservación ya ha sido finalizada o cancelada'
      });
    }


    // Actualizar estado de la reservación
    await db.execute(
      'UPDATE reserva SET estado = ? WHERE idreservaciones = ?',
      ['Finalizado', idreservaciones]
    );

    // Actualizar estado de los asientos
    await db.execute(
      'UPDATE asientos SET estado = ? WHERE reservaciones_idreservaciones = ?',
      ['ocupado', idreservaciones]
    );

    res.status(200).json({
      success: true,
      message: 'Pago procesado exitosamente y reservación confirmada',
      data: {
        idreservaciones,
        pelicula: reserva.pelicula,
        sala: reserva.sala,
        horario: reserva.horario,
        asientos: reserva.asientos,
        precioTotal: reserva.precioTotal,
        estado: 'Finalizado'
      }
    });
  } catch (error) {
    console.error('Error al confirmar reservación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar la reservación',
      error: error.message
    });
  }
};

// Generar código QR para una reservación
exports.generarQR = async (req, res) => {
  try {
    const { idreservaciones } = req.params;

    // Verificar que la reservación exista y pertenezca al usuario
    const [reservas] = await db.execute(
      'SELECT r.*, f.horario, p.titulo AS pelicula, s.nombre AS sala ' +
      'FROM reserva r ' +
      'JOIN funcion f ON r.funciones_idfunciones = f.idfunciones ' +
      'JOIN películas p ON f.peliculas_idpelicula = p.idpelicula ' +
      'JOIN salas s ON f.salas_idsalas = s.idsalas ' +
      'WHERE r.idreservaciones = ? AND r.usuario_idusuario = ? AND r.estado = "Finalizado"',
      [idreservaciones, req.usuario.idusuario]
    );

    if (reservas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Reservación no encontrada, no finalizada o no pertenece al usuario'
      });
    }

    const reserva = reservas[0];

    // Crear datos para el código QR
    const qrData = JSON.stringify({
      reservacion: idreservaciones,
      usuario: req.usuario.nombre,
      pelicula: reserva.pelicula,
      sala: reserva.sala,
      horario: new Date(reserva.horario).toLocaleString(),
      asientos: reserva.asientos,
      precioTotal: reserva.precioTotal
    });

    // Generar código QR como una imagen PNG en base64
    const qrImage = await QRCode.toDataURL(qrData);

    // Enviar la imagen al cliente
    res.status(200).json({
      success: true,
      message: 'Código QR generado exitosamente',
      data: {
        qrImage,
        reservacionInfo: {
          idreservaciones,
          pelicula: reserva.pelicula,
          sala: reserva.sala,
          horario: reserva.horario,
          asientos: reserva.asientos,
          precioTotal: reserva.precioTotal
        }
      }
    });
  } catch (error) {
    console.error('Error al generar código QR:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el código QR',
      error: error.message
    });
  }
};