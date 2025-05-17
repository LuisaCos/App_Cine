require("dotenv").config();
const mysql = require("mysql2");

// Pool de conexión
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, //Usuarios permitidos para estar en simultáneo 
  queueLimit: 0 // Solicitudes en espera sin límite
});

// Exportar el pool
module.exports = pool.promise(); 
