const db = require('../models');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const salt_round = 10;
const User = db.user;
const op = db.Sequelize.Op;

var hashed_password = "";

exports.create = async (req, res) => {

    let created_user;

    if(!req.body.password){
        res.status(400).send({
            message:"Information must not be empty"
        });
        return;
    }

    await bcrypt.hash(req.body.password, salt_round).then(hash => {
        hashed_password = hash;
    }).catch(err => console.log("Can't hash password !"));


    console.log("hashed: "+hashed_password);

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

    created_user = await User.create(user).then(data => {
        return data;
    }).catch(error => {
        res.status(500).send({
            message : error.message || "Internal server operation error"
        })
    })

    let token;
    try{
        token = jwt.sign(
            {user_id: created_user.id, role: created_user.role},
            "emitech_secret_token_twenty",
            {expiresIn: '1h'}
        );
    }catch(err){
        res.status(500).send({
            message: "Cant generate Token for the user !"
        })
    }
    res.status(201).json({user_id:created_user.id, token:token})
}

exports.findOne = (req, res) => {
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
    const email = req.body.email;
    const password = req.body.password;

    let existing_user = User.findOne({where: {email:email}}).then(data => {
        if(data){
            return data;
        }
    }).catch(error => {
        res.status(500).send({
            message: "Internal server error"
        })
    })

    if(!existing_user){
        res.status(400).send({
            message:"User not found !"
        })
    }

    try{
        valid_password = await bcrypt.compare(password, hashed_password);
    }catch(err){
        console.log(err);
    }

    if(!valid_password){
        res.status(400).send({
            message:"Password Invalid !"
        })
    }

    let token;
    try{
        token = jwt.sign({
            user_id: existing_user.id,
            role: existing_user.role
        },
        "emitech_secret_token_twenty",
        {
            expiresIn: '1h'
        });
        res.status(200).json({user_id:existing_user.id, token:token})
    }catch(err){
        res.status(500).send({
            message: "Can't Generate token for user"
        })
    }
    
}

async function compare( password, hash){
     bcrypt.compare(password, hash).then(result => {
        console.log("Password comparison: ", result);
        return result;
     }).catch(err => console.log(err));
}