module.exports = app => {
  const users = require("../controllers/user.controller");

  var router = require('express').Router();

  router.post("/signup", users.create);

  router.get("/:id", users.findOne);

  app.use("/users",router);
}