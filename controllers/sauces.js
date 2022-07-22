const Sauces = require("../models/sauces");
const fs = require("fs");

/* fonction pour récupérer toutes les sauces */
exports.getAllSauces = (req, res, next) => {
  Sauces.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/* fonction pour créer une sauce */
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  /* suppression de l'id car 'new' en créer un nouveau et suppression de userId venant du frontend */
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauces({
    ...sauceObject,
    /* récupération de l'userId authentifié et création d'une URL pour l'image de la sauce */
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,

    /* initialisation des comtpeurs likes et dislikes, et création de tableaux vides pour les userId */
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Sauce enregistrée !" });
    })
    .catch((error) => {
      res
        .status(403)
        .json({ error, message: "Error 403: unauthorized request" });
    });
};

/* fonction pour obtenir une sauce */
exports.getOneSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }));
};

/* fonction pour modifier une sauce */
exports.modifySauce = (req, res, next) => {
  /* Si la modification comporte une image, on modifie la sauce en chaine de caractère */
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : /* sinon on ne modifie que le corp de la requête */
      { ...req.body };

  delete sauceObject._userId;
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      /* condition pour modifier seulement les sauces que l'utilisateur a lui-même créé */
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Sauces.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Sauces modifiée" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

/* fonction pour supprimer une sauce */
exports.deleteSauce = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(403).json({ message: "Not authorized" });
      } else {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Sauces.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Sauce supprimée !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

/* fonction aimer (ou pas) la sauce */
exports.likeSauce = (req, res, next) => {
  const like = req.body.like;
  const userID = req.body.userId;

  Sauces.findOne({ _id: req.params.id })
    .then((sauce) => {
      const sauceNotation = {
        usersLiked: sauce.usersLiked,
        usersDisliked: sauce.usersDisliked,
        likes: 0,
        dislikes: 0,
      };

      switch (like) {
        /* l'utilisateur aime la sauce */
        case 1:
          sauceNotation.usersLiked.push(userID);
          break;
        /* l'utilisateur change d'avis */
        case 0:
          if (sauceNotation.usersLiked.includes(userID)) {
            const index = sauceNotation.usersLiked.indexOf(userID);
            sauceNotation.usersLiked.splice(index, 1);
          } else {
            const index = sauceNotation.usersDisliked.indexOf(userID);
            sauceNotation.usersDisliked.splice(index, 1);
          }
          break;
        /* l'utilisateur n'aime pas la sauce */
        case -1:
          sauceNotation.usersDisliked.push(userID);
          break;

        default:
          break;
      }
      /* le nombre de like (ou de dislike) est égal au nombre de userId dans le tableau correspondant */
      sauceNotation.likes = sauceNotation.usersLiked.length;
      sauceNotation.dislikes = sauceNotation.usersDisliked.length;

      /* Sauvegarde dans Mongobd Atlas */
      Sauces.updateOne({ _id: req.params.id }, sauceNotation)
        .then(() => res.status(200).json({ message: "Sauce notée !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(404).json({ error }));
};
