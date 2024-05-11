const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username: username } });
        if (!user) {
            return res.status(404).send({ message: "Utilisateur non trouvé!" });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Identifiants invalides!" });
        }

        res.status(200).send({ message: "Connexion réussie!" });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send({ message: "Erreur interne du serveur", error: error.toString() });
    }
});

module.exports = router;
