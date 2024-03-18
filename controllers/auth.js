// Importation des modules nécessaires
const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Configuration de la connexion à la base de données MySQL
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

// Fonction de gestion de l'inscription des utilisateurs
exports.register = (req, res) => {
    console.log(req.body);

    // Extraction des données du formulaire
    const {name, firstname, email, password, username, passwordConfirm} = req.body;

    // Vérification si l'email est déjà utilisé dans la base de données
    db.query('SELECT email FROM utilisateur WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            // Renvoie un message d'erreur si l'email est déjà utilisé
            return res.render('register', {
                message: 'Cet email est déjà utilisé'
            });
        } else if (password !== passwordConfirm) {
            // Renvoie un message d'erreur si les mots de passe ne correspondent pas
            return res.render('register', {
                message: 'Le mot de passe est incorrect'
            });
        }
        // Hachage du mot de passe
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        // Insertion de l'utilisateur dans la base de données
        db.query('INSERT INTO utilisateur SET ?', {name: name, firstname: firstname, email: email, username: username, password: hashedPassword}, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                // Renvoie un message de succès si l'utilisateur est enregistré avec succès
                return res.render('register', {
                    message_sucess: 'Utilisateur enregistré'
                });
            }
        });

    });
}
