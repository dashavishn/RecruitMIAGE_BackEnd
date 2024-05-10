const express = require('express');
const router = express.Router();

// Route de connexion
router.post('/login', (req, res) => {
    const userData = {
        username: req.body.nomuser,
        password: req.body.mdp
    };

    // Vérifier les informations d'identification
    if (username === 'utilisateur' && password === 'motdepasse') {
        // Connexion réussie
        res.json({ success: true });
    } else {
        // Identifiants incorrects
        res.status(401).json({ success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' });
    }
});

module.exports = router;
