const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const mysql = require("mysql");

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});


router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM utilisateur WHERE username = ?";

    db.query(query, [username], (error, results) => {
        if (error) {
            console.error('Erreur lors de la recherche de l’utilisateur:', error);
            return res.status(500).send({ message: "Erreur interne du serveur", error: error.toString() });
        }

        if (results.length === 0) {
            return res.status(404).send({ message: "Utilisateur non trouvé!" });
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ message: "Identifiants invalides!" });
        }

        res.status(200).send({ message: "Connexion réussie!" });
    });
});

module.exports = router;
