var express = require('express');
var router = express.Router();

var note = require('../controllers/note.controller')

router.get('/(:id)?', note.findNote );
router.post('/create', note.create );
router.put('/update/:id', note.update );
router.delete('/delete/:id', note.destroy );

module.exports = router;
