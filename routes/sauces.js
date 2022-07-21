const express = require("express");
const saucesCtrl = require("../controllers/sauces");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, saucesCtrl.createSauce);

router.put("/:id", auth, saucesCtrl.modifySauce);

router.delete("/:id", auth, saucesCtrl.deleteSauce);

router.get("/", auth, saucesCtrl.getAllSauces);

router.get("/:id", auth, saucesCtrl.getOneSauce);

module.exports = router;
