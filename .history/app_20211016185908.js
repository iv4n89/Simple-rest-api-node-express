const sqlite3 = require('sqlite3');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

const HTTP_PORT = 3000;
app.listen(HTTP_PORT, () => {
    console.log('Server is listening in port ' + HTTP_PORT);
});

const db = new sqlite3.Database('./emp_database.db', (err) => {
    if (err) {
        console.log('Error opening database ' + err.message);
    } else {
        db.run(`CREATE TABLE employees(
            employee_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            last_name NVARCHAR(20) NOT NULL,
            first_name NVARCHAR(20) NOT NULL,
            title NVARCHAR(20),
            address NVARCHAR(100),
            country_code INTEGER
        )`, (err) => {
            if (err) {
                console.log('Table already exists');
            }
            let insert = 'INSERT INTO employees (last_name, first_name, title, address, country_code) VALUES (?,?,?,?,?)';
            // db.run(insert, ['Papa', 'Pikillo', 'SE', 'Calle 1', 1]);
            // db.run(insert, ['Oreja', 'Caida', 'SSE', 'Calle 2', 1]);
            // db.run(insert, ['Gandalfo', 'Estriado', 'TL', 'Calle 22', 1]);
        });
    }
});

app.get('/employees/:id', (req, res, next) => {
    const params = [req.params.id];
    db.get(`SELECT * FROM employees where employee_id = ?`, [req.params.id], (err, row) => {
        if (err) {
            return res.status(400).json({ 'error': err.message });
        }
        res.status(200).json(row);
    });
});

app.get('/employees', (req, res, next) => {
    db.all('SELECT * FROM employees', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ 'error': err.message });
        }
        res.status(200).json({ rows });
    });
});

app.post('/employees/', (req, res, next) => {
    const { last_name, first_name, title, address, country_code } = req.body;
    db.run(`INSERT INTO employees (last_name, first_name, title, address, country_code) VALUES (?,?,?,?,?)`, [last_name, first_name, title, address, country_code], function (err, result) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ 'employee_id': this.lastID });
    });
});

app.patch('/employees/', (req, res, next) => {
    const { last_name, fist_name, title, address, country_code, employee_id } = req.body;
    db.run(`UPDATE employees SET last_name = ?, first_name = ?, title = ?, address = ?, country_code = ? WHERE employee_id = ?`, [last_name, fist_name, title, address, country_code, employee_id], function (err, result) {
        if (err) {
            return res.status(400).json({ 'error': err.message });
        }
        res.status(200).json({ updateID: this.changes });
    });
});

app.delete('/employees/:id', (req, res, next) => {
    db.run(`DELETE FROM employees WHERE employee_id = ?`, req.params.id, function (err, result) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(200).json({ deletedID: this.changes });
    });
});