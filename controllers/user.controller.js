const db = require('../models');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dbConfig = require("../configuration/db.config.js");

const salt_round = 10;
const User = db.user;
const op = db.Sequelize.Op;

var hashed_password = "";

exports.create = async (req, res) => {

    let created_user;

    if(!req.body.password || !req.body.email || !req.body.password || !req.body.firstname || !req.body.lastname || !req.body.role){
        res.status(400).send({
            message:"Information must not be empty"
        });
        return;
    }

    await bcrypt.hash(req.body.password, salt_round).then(hash => {
        hashed_password = hash;
    }).catch(err => console.log("Can't hash password !"));


    const user = {
        matricule : req.body.matricule,
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        email : req.body.email,
        phone : req.body.phone,
        status : false,
        role : req.body.role,
        password : hashed_password,
        avatar : req.body.avatar
    }

    await User.create(user).then(data => {
        return data;
    }).catch(error => {
        res.status(500).send({
            message : error.message || "Internal server operation error"
        })
    })
}

exports.findOne = (req, res) => {
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

    if(decodedToken.role?.toLowerCase() !== "admin"){
        return res.status(200).json({success: false, message: "User unauthorized to operate."});
    }

    const id = req.params.id;

    User.findByPk(id).then(data => {
        if(data){
            res.send(data);
        }else{
            res.status(404).send({
                message : "Cannot find user with id: "+id
            })
        }
    }).catch(error => {
        res.status(500).send({
            message: "Error retrieving user with id: "+id
        })
    })
}


exports.delete = (req,res) => {
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

    if(decodedToken.role?.toLowerCase() !== "admin"){
        return res.status(200).json({success: false, message: "User unauthorized to operate."});
    }

    const id = req.params.id;

    User.destroy({
        where: {id:id}
    }).then( status => {
        if(status == 1){
            res.send({
                message: "User deleted successfully"
            })
        }else{
            res.send({
                message:"Cannot delete User with id: "+id
            })
        }
    }).catch(err => {
        res.status(500).send({
            message:"Could not delete User with id: "+id
        })
    })
}


exports.update = (req, res) => {
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

    if(decodedToken.role?.toLowerCase() !== "admin"){
        return res.status(200).json({success: false, message: "User unauthorized to operate."});
    }

    const id = req.params.id;

    User.update(req.body, {
        where: {id:id}
    }).then(status => {
        if(status == 1){
            res.send({
                message: "User updated successfully "})
        }else{
            res.send({
                message: "Cannot update User with id: "+id
            })
        }
    }).catch(err => {
        res.status(500).send({
            message: "Cannot perform action, internal server error"
        })
    });
}


exports.signin = async (req, res) => {
    const {email, password} = req.body

    let existed_user;

    existed_user = await User.findOne({where: {email:email}}).then(data => {
        if(data){
            return data;
        }else{
            res.status(404).send({
                message: "User not found"
            })
        }
    }).catch(error => {
        res.status(500).send({
            message: "Internal server error"
        })
    })

    if(existed_user){
        let status = await compare(password, existed_user.password);
        if(status){
            // create user token
            let token;
            try{
                token = jwt.sign(
                    {user_id: existed_user.id, role: existed_user.role},
                    dbConfig.TOKEN_KEY
                );
            }catch(err){
                console.log(err)
                res.status(500).send({
                    message: "Cant generate Token for the user !"
                })
            }

            if(token){
                res.status(201).json({access_token:token})
            }
        }else{
            res.status(401).send({
                message: "Wrong credentials !"
            })
        }
    }
}

async function compare( password, hash){
    const res = bcrypt.compare(password, hash).then(result => {
        console.log("Comparison: "+result);
        return result;
     }).catch(err => console.log(err));
    
    return res;
}