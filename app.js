// Importation des modules necessaires
const express = require("express");
const path = require('path');
const mysql = require("mysql");
const dotenv = require("dotenv");

// Chargement des variables d'environnement depuis le fichier .env
dotenv.config({ path: './.env'});

// Création de l'application Express
const app = express();

// Middleware pour gérer les en-têtes CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Configuration de la connexion à la base de données MySQL
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Définition du répertoire des fichiers statiques (CSS, images, etc.)
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

// Middleware pour analyser les corps encodés en URL (envoyés par les formulaires HTML)
app.use(express.urlencoded({extended: false}));
// Middleware pour analyser les corps JSON (envoyés par les clients d'API)
app.use(express.json());

// Configuration du moteur de vue Handlebars
app.set('view engine', 'hbs');

// Connexion à la base de données MySQL
db.connect( (error) => {
    if(error) {
        console.log(error)
    } else {
        console.log("MYSQL Connected...")
    }
})

//Definition Routes
app.use('/', require('./routes/pages')) // Route pour les pages du site
app.use('/auth', require ('./routes/auth')); // Route pour les fonctionnalites d'authentification

// Démarrage du serveur sur le port 5000
app.listen(5000, () => {
    console.log("Server started on Port 5000");// Affiche un message lorsque le serveur démarre avec succès
})
