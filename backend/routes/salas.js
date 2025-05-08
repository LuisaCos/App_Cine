const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// Crear sala
router.post('/salas', async (req, res) => {
    const { nombre, capacidad } = req.body;
    const sql = "INSERT INTO salas (nombre, capacidad) VALUES (?, ?)";
    try {
        await db.execute(sql, [nombre, capacidad]);
        res.status(201).json({ message: "Sala creada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al crear sala", error });
    }
});

// Obtener todas las salas
router.get('/salas', async (req, res) => {
    const sql = "SELECT * FROM salas";
    try {
        const [rows] = await db.execute(sql);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener salas", error });
    }
});

// Actualizar sala
router.put('/salas/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, capacidad } = req.body;
    const sql = "UPDATE salas SET nombre = ?, capacidad = ? WHERE id = ?";
    try {
        await db.execute(sql, [nombre, capacidad, id]);
        res.status(200).json({ message: "Sala actualizada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar sala", error });
    }
});

// Eliminar sala
router.delete('/salas/:id', async (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM salas WHERE id = ?";
    try {
        await db.execute(sql, [id]);
        res.status(200).json({ message: "Sala eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar sala", error });
    }
});

module.exports = router;