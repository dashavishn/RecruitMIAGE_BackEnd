const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require("mysql");
const dotenv = require("dotenv");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
});

// Chargement des variables d'environnement depuis le fichier .env
dotenv.config({ path: './.env' });

// Configuration de la connexion à la base de données MySQL
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Connexion à la base de données MySQL
db.connect((error) => {
    if (error) {
        console.error('Erreur de connexion à la base de données :', error);
        return;
    }
    console.log("Connexion à la base de données MySQL réussie...");
});

// Définition du répertoire des fichiers statiques (CSS, images, etc.)
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.get('/', (req, res) => {
    res.send('ça marche !');
});

app.post('/register', (req, res) => {
    // Insertion de l'utilisateur dans la base de données
    const userData = {
        name: req.body.nom,
        firstname: req.body.prenom,
        email: req.body.email,
        username: req.body.nomuser,
        password: req.body.mdp
    };

    db.query('INSERT INTO utilisateur SET ?', userData, (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'insertion de l\'utilisateur :', error);
            res.status(500).json({ message: 'Erreur lors de l\'inscription de l\'utilisateur' });
            return;
        }

        console.log('Utilisateur enregistré avec succès :', results);
        res.status(200).json({ message: 'Utilisateur enregistré avec succès' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port 3000`);
});
