const db = require('../models');
const {check, validationResult} = require("express-validator");

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
    // if token is in the header
    // const token = req.headers.authorization.split(' ')[1];
    const token = req.params.token;
    var role;

    if(token){  
        role = parseJwt(token).role;
    }else{
        res.status(401).send({
            message: "Unauthorized !"
        });
    }

    if(!checkAuth(token, "admin") && !checkAuth(token, "prof") ){
        res.status(401).send({
            message: "Unauthorized !"
        })
    }

    const id = req.params.id
    let note = []
    if (id > 0) {
        note = await Note.findByPk(id)
    } else {
        note = await Note.findAll(USER_OPTION);
    }
    res.status(200).send(note)
}

const create = async (req, res) => {

    const token = req.params.token;
    
    if(token){
        if(!checkAuth(token, "admin") && !checkAuth(token, "prof") ){
            res.status(401).send({
                message: "Unauthorized !"
            })
        }
    }

    const {
        mention, parcours, level, subject, session, numbers, sending,
        univ_year, comment, SenderId
    } = req.body;

    await check('mention').not().isEmpty().isLength({min: 2, max: 50}).run(req)
    await check('parcours').not().isEmpty().isLength({min: 2, max: 15}).run(req)
    await check('level').not().isEmpty().isLength({min: 2, max: 5}).run(req)
    await check('subject').not().isEmpty().isLength({max: 100}).run(req)
    await check('session').not().isEmpty().isLength({min: 5}).run(req)
    await check('numbers').not().isEmpty().run(req)
    await check('sending').not().isEmpty().isLength({min: 2}).run(req)
    await check('univ_year').not().isEmpty().isLength({min: 4, max: 15}).run(req)
    await check('SenderId').not().isEmpty().isNumeric().run(req)

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
        SenderId: SenderId
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

    const token = req.params.token;
    
    if(token){
        if(!checkAuth(token, "admin") && !checkAuth(token, "prof") ){
            res.status(401).send({
                message: "Unauthorized !"
            })
        }
    }

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
    await check('SenderId').not().isEmpty().isNumeric().run(req)

    if (req.originalUrl.includes("receive")) {
        await check('ReceiverId').not().isEmpty().isNumeric().run(req)
        await check('receive_date').not().isEmpty().isDate().run(req)
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
    const id = req.params.id;
    const token = req.params.token;

    if(token){
        if(!checkAuth(token, "admin")){
            res.status(401).send({
                message: "Unauthorized !"
            })
        }
    }

    if(parseJwt(token).role !== 'admin'){
        res.status(403).send({
            message: "You are not allowed to delete this note"
        })
    }

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

const filter = async(req, res)=>{
    const {
         send_date_start, send_date_end, receive_date_start, receive_date_end
    } = req.body;

    let note = []

    if(send_date_start){
        req.body.send_date = {
            [Op.between]: [send_date_start, send_date_end]
        }
        delete req.body.send_date_start
        delete req.body.send_date_end
    }
    if(receive_date_start){
        req.body.receive_date = {
            [Op.between]: [receive_date_start, receive_date_end]
        }
        delete req.body.receive_date_start
        delete req.body.receive_date_end
    }

    try{
        note = await Note.findAll( { where: req.body } );
    }catch (e) {
        res.status(500).send({
            message: e.message || "Internal server operation error"
        })
    }

    res.status(200).send(note)
}

function parseJwt (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function checkAuth(token, role){
    if(token){  
        if(role === parseJwt(token).role){
            return true;
        } 
    }else{
        return false;
    }
}

module.exports = { findNote, create, update, destroy, filter }