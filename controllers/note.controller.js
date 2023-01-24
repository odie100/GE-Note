const db = require('../models');
const Note = db.note;
const op = db.Sequelize.Op;

const findNote = async (req, res)=>{
    const id = req.params.id
    let note = []
    if(id > 0 ){
        note = await Note.findByPk(id)
    }
    else{
        note = await Note.findAll();
    }
    res.status(200).send(note)
}

const create = (req, res) => {
    const {
        mention, parcours, level, subject, session, numbers, sending,
        univ_year, operation_date, user_id
    } = req.body;

    const note = {
        mention: mention,
        parcours: parcours,
        level: level,
        subject: subject,
        session: session,
        numbers: numbers,
        sending: sending,
        univ_year: univ_year,
        operation_date: operation_date,
        userId: user_id
    }

    Note.create(note)
        .then(async () => {
            const notes = await Note.findAll();
            res.status(200).send(notes)
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "Internal server operation error"
            })
        })
};

const update = (req, res) => {
    const id = req.params.id
    const data = req.body
    Note.update(data, {
        where: {id}
    })
    .then(async () => {
        const notes = await Note.findAll();
        res.status(200).send(notes)
    })
    .catch(error => {
        res.status(500).send({
            message: error.message || "Internal server operation error"
        })
    })
}

const destroy = async (req, res) => {
    const id = req.params.id
    Note.destroy({
        where: {id}
    })
    .then(async () => {
        const notes = await Note.findAll();
        res.status(200).send(notes)
    })
    .catch(error => {
        res.status(500).send({
            message: error.message || "Internal server operation error"
        })
    })
}

module.exports = { findNote, create, update, destroy }