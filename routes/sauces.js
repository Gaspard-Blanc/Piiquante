const express = require("express");
const saucesCtrl = require("../controllers/sauces");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const router = express.Router();

router.get("/", auth, saucesCtrl.getAllSauces);

router.post("/", auth, multer, saucesCtrl.createSauce);

router.get("/:id", auth, saucesCtrl.getOneSauce);

router.put("/:id", auth, multer, saucesCtrl.modifySauce);

router.delete("/:id", auth, saucesCtrl.deleteSauce);

module.exports = router;
