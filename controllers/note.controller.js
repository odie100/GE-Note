const db = require('../models');
const {check, validationResult} = require("express-validator");
const jwt = require('jsonwebtoken');
const dbConfig = require("../configuration/db.config.js");

const Note = db.note;
const User = db.user;
const Op = db.Sequelize.Op;

const USER_OPTION = {
    include: [
        {
            model: User, as: 'Sender',
            attributes: ['matricule', 'firstname', 'lastname', 'email', 'phone', 'role']
        },
        {
            model: User, as: 'Receiver',
            attributes: ['matricule', 'firstname', 'lastname', 'email', 'phone', 'role']
        }
    ]
}

const findNote = async (req, res) => {

    const token = req.headers.authorization?.split(' ')[1];
    //Authorization: 'Bearer TOKEN'
    if (!token) {
        return res.status(200).json({success: false, message: "Error! Token was not provided."});
    }
    //Decoding the token
    let decodedToken
    try{
        decodedToken = jwt.verify(token, dbConfig.TOKEN_KEY);
    }catch (e) {}

    if(!decodedToken.role){
        return res.status(201).json({success: false, message: "User non authorized to operate ! "});
    }

    const id = req.params.id
    let note = []
    if (id > 0) {
        note = await Note.findByPk(id)
    } else {
        if(decodedToken.role?.toLowerCase() === "professeur"){
            USER_OPTION["where"] = {SenderId:decodedToken.id}
        }
        else if(decodedToken.role?.toLowerCase() === "responsable"){
            USER_OPTION["where"] = {ReceiverId:decodedToken.id}
        }
        else{
        }
        note = await Note.findAll(USER_OPTION);
    }
    return res.status(200).send(note)
}

const create = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    //Authorization: 'Bearer TOKEN'
    if (!token) {
        return res.status(200).json({success: false, message: "Error! Token was not provided."});
    }
    //Decoding the token
    let decodedToken
    try{
        decodedToken = jwt.verify(token, dbConfig.TOKEN_KEY);
    }catch (e) {}

    if(decodedToken.role?.toLowerCase() !== "professeur"){
        return res.status(200).json({success: false, message: "User unauthorized to operate."});
    }

    const {
        mention, parcours, level, subject, session, numbers, sending,
        univ_year, comment
    } = req.body;

    await check('mention').not().isEmpty().isLength({min: 2, max: 50}).run(req)
    await check('parcours').not().isEmpty().isLength({min: 2, max: 15}).run(req)
    await check('level').not().isEmpty().isLength({min: 2, max: 5}).run(req)
    await check('subject').not().isEmpty().isLength({max: 100}).run(req)
    await check('session').not().isEmpty().isLength({min: 5}).run(req)
    await check('numbers').not().isEmpty().run(req)
    await check('sending').not().isEmpty().isLength({min: 2}).run(req)
    await check('univ_year').not().isEmpty().isLength({min: 4, max: 15}).run(req)

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
        SenderId: decodedToken.id
    }

    Note.create(note)
        .then(async () => {
            const notes = await Note.findAll(USER_OPTION);
            res.status(200).send(notes)
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "Internal server operation error"
            })
        })
};

const update = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    //Authorization: 'Bearer TOKEN'
    if (!token) {
        return res.status(200).json({success: false, message: "Error! Token was not provided."});
    }
    //Decoding the token
    let decodedToken
    try{
        decodedToken = jwt.verify(token, dbConfig.TOKEN_KEY);
    }
    catch (e) {}

    const id = req.params.id // id of note
    let data = req.body

    await check('mention').not().isEmpty().isLength({min: 2, max: 50}).run(req)
    await check('parcours').not().isEmpty().isLength({min: 2, max: 15}).run(req)
    await check('level').not().isEmpty().isLength({min: 2, max: 5}).run(req)
    await check('subject').not().isEmpty().isLength({max: 100}).run(req)
    await check('session').not().isEmpty().isLength({min: 5}).run(req)
    await check('numbers').not().isEmpty().run(req)
    await check('sending').not().isEmpty().isLength({min: 2}).run(req)
    await check('univ_year').not().isEmpty().isLength({min: 4, max: 15}).run(req)

    if (decodedToken.role?.toLowerCase() === "professeur") {
        data["SenderId"] = decodedToken.id
    } else if (decodedToken.role?.toLowerCase() === "responsable") {
        data["ReceiverId"] = decodedToken.id
        await check('receive_date').not().isEmpty().isDate().run(req)
    } else {
        return res.status(200).json({success: false, message: "User non authorized to change note ! "});
    }

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({message: result.array()});
    }

    Note.update(data, {
        where: {id}
    })
        .then(async () => {
            const notes = await Note.findAll(USER_OPTION);
            res.status(200).send(notes)
        })
        .catch(error => {
            res.status(500).send({
                message: error.message || "Internal server operation error"
            })
        })
}

const destroy = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    //Authorization: 'Bearer TOKEN'
    if (!token) {
        return res.status(200).json({success: false, message: "Error! Token was not provided."});
    }
    //Decoding the token
    let decodedToken
    try{
        decodedToken = jwt.verify(token, dbConfig.TOKEN_KEY);
    }
    catch (e) {}

    // deleting
    if (decodedToken.role?.toLowerCase() === "admin") {
        const id = req.params.id // id of note
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
    return res.status(201).json({success: false, message: "User non authorized to delete note ! "});

}

const filter = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    //Authorization: 'Bearer TOKEN'
    if (!token) {
        return res.status(200).json({success: false, message: "Error! Token was not provided."});
    }
    //Decoding the token
    let decodedToken
    try{
        decodedToken = jwt.verify(token, dbConfig.TOKEN_KEY);
    }catch (e) {}

    if(!decodedToken.role){
        return res.status(201).json({success: false, message: "User non authorized to operate ! "});
    }

    if(decodedToken.role.toLowerCase() === "professeur"){
        req.body["SenderId"] = decodedToken.id
    }
    else if(decodedToken.role.toLowerCase() === "responsable"){
        req.body["ReceiverId"] = decodedToken.id
    }

    const {
        send_date_start, send_date_end, receive_date_start, receive_date_end
    } = req.body;

    let note = []

    if (send_date_start) {
        req.body.send_date = {
            [Op.between]: [send_date_start, send_date_end]
        }
        delete req.body.send_date_start
        delete req.body.send_date_end
    }
    if (receive_date_start) {
        req.body.receive_date = {
            [Op.between]: [receive_date_start, receive_date_end]
        }
        delete req.body.receive_date_start
        delete req.body.receive_date_end
    }

    try {
        note = await Note.findAll({where: req.body});
    } catch (e) {
        //
    }

    return res.status(200).send(note)
}

module.exports = {findNote, create, update, destroy, filter}