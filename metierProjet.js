//liste de users

var liste = [];
var idprojet = 0;

function Projet(idprojet, titre, description, nbparticipant){
    this.idprojet=idprojet;
    this.titre=titre;
    this.description=description;
    this.nbparticipant=nbparticipant;
    this.datemaj=new Date();
}

function Projet(projet){
    this.idprojet=projet.idprojet;
    this.titre=projet.titre;
    this.description=projet.description;
    this.nbparticipant=projet.nbparticipant;
    this.datemaj=new Date();
}

//Créer un projet
var ajouter = function(projet){
    projet.idprojet= idprojet;
    liste[idprojet]= new Projet(projet);
    idprojet++;
}

//Lister les projets
var lister = function(){
    return Object.values(liste);
}

exports.ajouter = ajouter;
exports.lister = lister;

