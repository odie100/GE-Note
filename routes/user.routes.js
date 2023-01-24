const { user } = require("../models");

module.exports = app => {
  const users = require("../controllers/user.controller");

  var router = require('express').Router();

  router.post("/signup", users.create);

  router.get("/:id", users.findOne);

  router.delete("/:id", users.delete);

  router.put("/:id", users.update);

  router.post("/signin", users.signin);

  app.use("/users",router);
}