const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// ✅ Sirve solo los archivos .html, .css y .js del frontend
app.use(express.static(__dirname, {
    extensions: ['html']
}));

// Configura conexión MySQL
const db = mysql.createConnection({
   // host: 'localhost',  //  local
    //user: 'root',        // Usuario 
    //password: '',        // Sin contraseña
    //database: 'agencia_autos'
    host: 'caboose.proxy.rlwy.net',
    user: 'root',
    password: 'wvBaOnfBvOArgqVmEIBudbOWakaSvndF',
    database: 'railway',
    port: 20893
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a MySQL:', err);
        process.exit(1);
    }
    console.log('Conectado a Railway!');//('Conectado a la base de datos MySQL');
});

// Obtener todos los clientes
app.get('/clientes', (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) {
            console.error('Error al obtener clientes:', err);
            return res.status(500).json({ error: 'Error en servidor' });
        }
        res.json(results);
    });
});

// Registrar nuevo cliente
app.post('/clientes', (req, res) => {
    console.log('Datos recibidos:', req.body); // <-- agrega esto
    const { nombre, email, telefono, direccion } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }

    db.query('SELECT * FROM clientes WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error al buscar cliente:', err);
            return res.status(500).json({ error: 'Error en servidor' });
        }
        if (results.length > 0) {
            return res.status(409).json({ mensaje: 'Cliente ya registrado', cliente: results[0] });
        }

        db.query('INSERT INTO clientes (nombre, email, telefono, direccion) VALUES (?, ?, ?, ?)', 
            [nombre, email, telefono || '', direccion || ''], 
            (err, result) => {
                if (err) {
                    console.error('Error al insertar cliente:', err);
                    return res.status(500).json({ error: 'Error en servidor' });
                }
                res.json({ mensaje: 'Cliente registrado correctamente', id: result.insertId });
            });
    });
});

// Eliminar cliente
app.delete('/clientes/:id', (req, res) => {
    db.query('DELETE FROM clientes WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.error('Error al eliminar cliente:', err);
            return res.status(500).json({ error: 'Error en servidor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ mensaje: 'Cliente eliminado correctamente' });
    });
});

// Actualizar cliente (PUT)
app.put('/clientes/:id', (req, res) => {
    const { nombre, email, telefono, direccion } = req.body;
    db.query('UPDATE clientes SET nombre=?, email=?, telefono=?, direccion=? WHERE id=?',
        [nombre, email, telefono, direccion, req.params.id], (err, result) => {
            if (err) {
                console.error('Error al actualizar cliente:', err);
                return res.status(500).json({ error: 'Error en servidor' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            res.json({ mensaje: 'Cliente actualizado correctamente' });
        });
});

// Actualización parcial (PATCH)
app.patch('/clientes/:id', (req, res) => {
    const campos = req.body;
    db.query('UPDATE clientes SET ? WHERE id = ?', [campos, req.params.id], (err, result) => {
        if (err) {
            console.error('Error al actualizar parcialmente:', err);
            return res.status(500).json({ error: 'Error en servidor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        res.json({ mensaje: 'Cliente actualizado parcialmente' });
    });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
