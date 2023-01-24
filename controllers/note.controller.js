const db = require('../models');
const Note = db.note;
const op = db.Sequelize.Op;

const findAll = async  (req, res, next) =>{
    const notes = await Note.findAll();
    res.status(200).send(notes)
}

const create = async (req, res, next) => {
    const { mention, parcours, level, subject, session, numbers, sending,
            univ_year, operation_date, user_id
    } = req.body;

    const note = {
        mention:mention,
        parcours:parcours,
        level:level,
        subject:subject,
        session:session,
        numbers:numbers,
        sending:sending,
        univ_year:univ_year,
        operation_date:operation_date,
        userId: user_id
    }

    Note.create(note).then(data => {
        console.log("Checked 1")
        res.status(200).send(data);
    }).catch(error => {
        res.status(500).send({
            message : error.message || "Internal server operation error"
        })
    })
};

module.exports = { create, findAll }