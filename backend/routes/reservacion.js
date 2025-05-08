const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Crear reservación
router.post('/reservaciones', async (req, res) => {
    const { idSala, idUsuario, estado } = req.body;
    const sql = "INSERT INTO reservaciones (idSala, idUsuario, estado) VALUES (?, ?, ?)";
    try {
        await db.execute(sql, [idSala, idUsuario, estado]);
        res.status(201).json({ message: "Reservación creada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al crear reservación", error });
    }
});

// Obtener reservaciones
router.get('/reservaciones', async (req, res) => {
    const sql = "SELECT * FROM reservaciones";
    try {
        const [rows] = await db.execute(sql);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reservaciones", error });
    }
});

// Actualizar estado de reservación
router.put('/reservaciones/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const sql = "UPDATE reservaciones SET estado = ? WHERE id = ?";
    try {
        await db.execute(sql, [estado, id]);
        res.status(200).json({ message: "Estado de reservación actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar estado de reservación", error });
    }
});

module.exports = router;