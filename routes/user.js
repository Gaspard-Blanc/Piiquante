const express = require("express");
const userCtrl = require("../controllers/user");
const connexion = require("../middleware/connexion");
const router = express.Router();

router.post("/signup", userCtrl.signup);

router.post("/login", connexion.limiter, userCtrl.login);

module.exports = router;
