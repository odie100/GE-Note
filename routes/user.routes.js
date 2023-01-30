const express = require('express');
const router = express.Router();

const users = require('../controllers/user.controller')

router.post("/signup", users.create);

router.get("/:id", users.findOne);

router.delete("/:id", users.delete);

router.put("/:id", users.update);

router.post("/signin", users.signin);

module.exports = router;