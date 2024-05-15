// Importation des modules nécessaires
const cors = require('cors');
const express = require("express");
const mysql = require("mysql");
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");


// Initialisation d'Express
const app = express();

// Middleware pour parser le JSON et les URL-encoded forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Configuration CORS pour permettre des requêtes de localhost 4200
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true
}));

// Middleware pour configurer les headers CORS sur chaque réponse
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

//Route pour la connexion d'un utilisateur inscrit
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM utilisateur WHERE username = ? and password = ?";

    db.query(query, [username, password], (error, results) => {
        if (error) {
            console.error('Erreur lors de la recherche de l’utilisateur:', error);
            return res.status(500).send({ message: "Erreur interne du serveur", error: error.toString() });
        }

        if (results.length === 0) {
            return res.status(404).send({ message: "Utilisateur ou mot de passe invalide" });
        }
        return res.status(200).send({ message: "Connexion réussie!" });
    });
});

// Route pour ajouter un membre à un projet
app.post('/projects/:projectId/members', async (req, res) => {
    const iduser = req.body.userId;
    const role = req.body.role;
    const projectId = req.params.projectId;

    try {
        const project = db.query('SELECT nbparticipants FROM projets WHERE idprojets = ?', projectId);
        const members = db.query('SELECT current_participants FROM projets WHERE idprojets = ?', [projectId]);

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


app.post('/:projetId/members', (req, res) => {
    const { iduser, role } = req.body;
    const idprojets = req.params.idprojets;

    const query = `INSERT INTO membre (iduser, idprojets, role) VALUES (?, ?, ?)`;
    db.query(query, [iduser, idprojets, role], (err, result) => {
        if (err) {
            res.status(500).send({ message: "Error adding member to the project", error: err });
            return;
        }
        res.status(201).send({ message: "Member added successfully", data: result });
    });
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

// Route pour obtenir les projets auxquels un utilisateur participe
app.get('/user-projects/:userId', async (req, res) => {
    const userId = req.params.userId;

    const query = `
        SELECT p.* FROM projets p
        JOIN membre m ON p.idprojets = m.idprojets
        WHERE m.iduser = ?
    `;

    db.query(query, [userId], (error, results) => {
        if (error) {
            console.error('Erreur lors de la récupération des projets participant:', error);
            res.status(500).send({ message: 'Erreur lors de la récupération des projets participant', error: error.toString() });
        } else {
            res.status(200).json(results);
        }
    });
});



// Route pour inscrire un utilisateur
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

// Route pour créer un projet
app.post('/create-project', (req, res) => {
    // Récupération des données du projet depuis le corps de la requête
    const projectData = {
        titre: req.body.titre,
        theme: req.body.theme,
        description: req.body.description,
        nbparticipants: req.body.nbparticipants
    };

    // Requête SQL pour insérer le nouveau projet dans la base de données
    const query = 'INSERT INTO projets SET ?';
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

//Route pour afficher l'ensemble des projets
app.get('/projects', (req, res) => {
    db.query('SELECT * FROM projets', (error, results) => {
        if (error) {
            res.status(500).send({ message: 'Error fetching projects', error: error.toString() });
        } else {
            res.status(200).json(results);
        }
    });
});

// Route pour obtenir les détails d'un projet et ses membres
app.get('/project-details/:id', async (req, res) => {
    const projectId = req.params.id;
    const projectQuery = `SELECT * FROM projets WHERE idprojets = ?`;
    const membersQuery = `SELECT u.username, m.role FROM membre m JOIN utilisateur u ON m.iduser = u.iduser WHERE m.idprojets = ?`;

    db.query(projectQuery, [projectId], (projError, projResults) => {
        if (projError || projResults.length === 0) {
            console.error('Erreur lors de la récupération du projet :', projError);
            return res.status(404).send({ message: 'Projet non trouvé.' });
        }

        const project = projResults[0];

        db.query(membersQuery, [projectId], (memError, memResults) => {
            if (memError) {
                console.error('Erreur lors de la récupération des membres du projet :', memError);
                return res.status(500).send({ message: 'Erreur lors de la récupération des membres', error: memError });
            }

            res.status(200).send({ project: project, members: memResults });
        });
    });
});


app.post('/projects', (req, res) => {
    const { titre, theme, description, nbparticipants } = req.body;
    // Logique pour insérer les données du projet dans la base de données
    const query = 'INSERT INTO projets (titre, theme, description, nbparticipants) VALUES (?, ?, ?, ?)';
    db.query(query, [titre, theme, description, nbparticipants], (error, results) => {
        if (error) {
            console.error('Erreur lors de l\'insertion du projet :', error);
            res.status(500).send({ message: 'Erreur lors de la création du projet', error: error.toString() });
            return;
        }
        res.status(201).send({ message: 'Projet créé avec succès', projectId: results.insertId });
    });
});



// Route pour obtenir les détails d'un projet et ses membres
app.get('/project-details/:id', async (req, res) => {
    const projectId = req.params.id;

    // Utilisez une transaction ou des requêtes séparées pour gérer les opérations de base de données
    db.query(`SELECT * FROM projets WHERE idprojets = ?`, [projectId], (projError, projResults) => {
        if (projError) {
            console.error('Erreur lors de la récupération du projet :', projError);
            return res.status(500).send({ message: 'Erreur lors de la récupération des détails du projet', error: projError });
        }

        if (projResults.length === 0) {
            return res.status(404).send({ message: 'Projet non trouvé.' });
        }

        const project = projResults[0];

        // Requête pour obtenir les membres associés au projet
        db.query(`SELECT u.username, m.role FROM membre m JOIN utilisateur u ON m.iduser = u.iduser WHERE m.idprojets = ?`, [projectId], (memError, memResults) => {
            if (memError) {
                console.error('Erreur lors de la récupération des membres du projet :', memError);
                return res.status(500).send({ message: 'Erreur lors de la récupération des membres', error: memError });
            }
            res.status(200).send({
                project: project,
                members: memResults
            });
        });
    });
});



// Démarrage du serveur sur un port spécifié avec affichage d'un message de succès
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port 3000`);
});
