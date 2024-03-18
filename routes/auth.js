// Importation du module Express
const express = require('express');

// Importation du contrôleur d'authentification
const authController = require('../controllers/auth');

// Création d'un routeur Express
const router = express.Router();

// Définition de la route POST pour l'inscription des utilisateurs
router.post('/register', authController.register);

// Exportation du routeur pour être utilisé ailleurs dans l'application
module.exports = router;
