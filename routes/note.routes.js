const express = require('express');
const router = express.Router();

const note = require('../controllers/note.controller')

router.get('/(:id)?', note.findNote );
router.post('/send', note.create );
router.put('/receive/:id', note.update ); // update with receiver id
router.put('/update/:id', note.update ); // simple update
router.delete('/delete/:id', note.destroy );
router.post('/filters', note.filters );

module.exports = router;
