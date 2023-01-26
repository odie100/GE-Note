const db = require('../models');
const {check, validationResult} = require("express-validator");

const Note = db.note;
const op = db.Sequelize.Op;

const findNote = async (req, res) => {
    const id = req.params.id
    let note = []
    if (id > 0) {
        note = await Note.findByPk(id)
    } else {
        note = await Note.findAll();
    }
    res.status(200).send(note)
}

const create = async (req, res) => {
    const {
        mention, parcours, level, subject, session, numbers, sending,
        univ_year, comment, user_id
    } = req.body;

    await check('mention').not().isEmpty().isLength({min: 2, max: 50}).run(req)
    await check('parcours').not().isEmpty().isLength({min: 2, max: 15}).run(req)
    await check('level').not().isEmpty().isLength({min: 2, max: 5}).run(req)
    await check('subject').not().isEmpty().isLength({max: 100}).run(req)
    await check('session').not().isEmpty().isLength({min: 5}).run(req)
    await check('numbers').not().isEmpty().run(req)
    await check('sending').not().isEmpty().isLength({min: 2}).run(req)
    await check('univ_year').not().isEmpty().isLength({min: 4, max: 15}).run(req)
    // await check('user_id').not().isEmpty().run(req)

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({message: result.array()});
    }

    const note = {
        mention: mention,
        parcours: parcours,
        level: level,
        subject: subject,
        session: session,
        numbers: numbers,
        sending: sending,
        univ_year: univ_year,
        comment: comment,
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

const update = async (req, res) => {
    const id = req.params.id
    const data = req.body

    await check('mention').not().isEmpty().isLength({min: 2, max: 50}).run(req)
    await check('parcours').not().isEmpty().isLength({min: 2, max: 15}).run(req)
    await check('level').not().isEmpty().isLength({min: 2, max: 5}).run(req)
    await check('subject').not().isEmpty().isLength({max: 100}).run(req)
    await check('session').not().isEmpty().isLength({min: 5}).run(req)
    await check('numbers').not().isEmpty().run(req)
    await check('sending').not().isEmpty().isLength({min: 2}).run(req)
    await check('univ_year').not().isEmpty().isLength({min: 4, max: 15}).run(req)
    await check('user_id').not().isEmpty().run(req)

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({message: result.array()});
    }

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

const filters = async (req, res) => {
    let to_find = {}
    const {
        mention, parcours, level, subject, session, univ_year, valid, user_id
    } = req.body;
    console.log('REQ ', req.body)

    if(subject){
        await check('subject').not().isEmpty().isLength({max: 100}).run(req)
        to_find = {subject : subject}
    }
    else if(level){
        await check('level').not().isEmpty().isLength({min: 2, max: 5}).run(req)
        to_find = {level : level}
    }
    else if(mention){
        await check('mention').not().isEmpty().isLength({min: 2, max: 50}).run(req)
        to_find = {mention : mention}
    }
    else if(parcours){
        await check('parcours').not().isEmpty().isLength({min: 2, max: 15}).run(req)
        to_find = {parcours : parcours}
    }
    else if(session){
        await check('session').not().isEmpty().isLength({min: 5}).run(req)
        to_find = {session : session}
    }
    else if(univ_year){
        await check('univ_year').not().isEmpty().isLength({min: 4, max: 15}).run(req)
        to_find = {univ_year : univ_year}
    }
    else if(user_id){
        await check('user_id').not().isEmpty().run(req)
        to_find = {userId : user_id}
    }
    else if(valid === true || valid === false){
        await check('valid').not().isEmpty().run(req)
        to_find = {valid : valid}
    }
    else{
        return res.status(400).json({message: "Incomplete information"});
    }

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({message: result.array()});
    }


    const note = await Note.findAll({where: to_find});
    res.status(200).send(note)
}
module.exports = {findNote, create, update, destroy, filters}