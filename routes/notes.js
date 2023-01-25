const express = require('express');
const router = express.Router();

const note = require('../controllers/note.controller')

router.get('/(:id)?', note.findNote );
router.post('/create', note.create );
router.put('/update/:id', note.update );
router.delete('/delete/:id', note.destroy );

module.exports = router;
