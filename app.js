const cors = require('cors');
const express = require("express");
const mysql = require("mysql");
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require("dotenv");



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());



// Ou configurez CORS pour des origines spécifiques
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));

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

// Route pour ajouter un membre à un projet

app.post('/projects/:projectId/members', async (req, res) => {
    const iduser = req.body.userId;
    const role = req.body.role;
    const projectId = req.params.projectId;

    try {
        const project = db.query('SELECT nbparticipants FROM projects WHERE idprojets = ?', projectId);
        const members = db.query('SELECT COUNT(*) FROM membre WHERE idprojets = ?', [projectId]);

        if (project.length === 0) {
            return res.status(404).send({ message: 'Projet non trouvé.' });
        }

        if (members >= project.nbparticipants) {
            return res.status(400).send({ message: 'Le nombre maximum de participants a été atteint.' });
        }

        await db.query('INSERT INTO membre (iduser, idprojets, role) VALUES (?, ?, ?)', [iduser, projectId, 'Participant']);
        res.status(201).send({ message: 'Inscription réussie.' });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du membre au projet :', error);
        res.status(500).send({ message: 'Erreur lors de l\'ajout du membre au projet', error: error.message });
    }
});


// Route pour récupérer tous les membres d'un projet
app.get('/projects/:projetId/members', (req, res) => {
    const idprojets = req.params.idprojets;

    const selectQuery = `
        SELECT * FROM membre WHERE idprojets = ?
    `;
    db.query(selectQuery, [idprojets], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des membres du projet :', error);
            res.status(500).send({ message: 'Erreur lors de la récupération des membres', error: error.toString() });
            return;
        }

        console.log('Membres récupérés avec succès :', results);
        res.status(200).json(results);
    });
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
app.post('/create-project', (req, res) => {
    // Récupération des données du projet depuis le corps de la requête
    const projectData = {
        titre: req.body.titre,
        theme: req.body.theme,
        description: req.body.description,
        nbparticipants: req.body.nbparticipants
    };

    // Requête SQL pour insérer le nouveau projet dans la base de données
    const query = 'INSERT INTO projects SET ?';
    db.query(query, projectData, (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'insertion du projet :', error);
            res.status(500).send({ message: 'Erreur lors de la création du projet', error: error.toString() });
            return;
        }

        console.log('Projet créé avec succès :', results);
        res.status(201).send({ message: 'Projet créé avec succès', projectId: results.insertId });
    });
});

app.get('/projects', (req, res) => {
    db.query('SELECT * FROM projects', (error, results) => {
        if (error) {
            res.status(500).send({ message: 'Error fetching projects', error: error.toString() });
        } else {
            res.status(200).json(results);
        }
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port 3000`);
});



