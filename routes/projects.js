const express = require('express');
const router = express.Router();


// Ajouter un membre à un projet
router.post('/:projetId/members', (req, res) => {
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

module.exports = router;
