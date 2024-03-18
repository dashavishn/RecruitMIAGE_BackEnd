// Importation du module Express
const express = require('express');

// Création d'un routeur Express
const router = express.Router();

// Définition de la route GET pour la page d'accueil
router.get('/', (req, res) => {
    res.render('index'); // Rendu de la vue index.hbs
});

// Définition de la route GET pour la page d'inscription
router.get('/register', (req, res) => {
    res.render('register'); // Rendu de la vue register.hbs
});

// Exportation du routeur pour être utilisé ailleurs dans l'application
module.exports = router;
