var express = require('express');
var router = express.Router();

var note = require('../controllers/note.controller')
/* GET users listing. */

router.get('/', note.findAll );
router.post('/create', note.create );

module.exports = router;
