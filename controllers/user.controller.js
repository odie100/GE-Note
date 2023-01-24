const db = require('../models');
const User = db.user;
const op = db.Sequelize.Op;

exports.create = (req, res) => {

    if(!req.body.password){
        res.status(400).send({
            message:"Information must not be empty"
        });
        return;
    }

    const user = {
        matricule : req.body.matricule,
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        email : req.body.email,
        phone : req.body.phone,
        status : false,
        role : req.body.role,
        password : req.body.password,
        avatar : req.body.avatar
    }

    User.create(user).then(data => {
        console.log("Checked 1")
        res.status(200).send(data);
    }).catch(error => {
        res.status(500).send({
            message : error.message || "Internal server operation error"
        })
    })

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
                message: "User updated successfully"})
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