const User = require('../Models/userModel');
const bcrypt = require("bcryptjs");


exports.user_create = function(req, res) {
    // ------------------ Validate Request ----------------- //
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.username) {
        return res.status(400).send({
            success: false,
            message: "Porfavor rellene todos los campos solicitados"
        });
    }


    // Create a user
    let user = new User(
        ({ name, username, email, password } = req.body)
    );

    // ------------- save user in the database -----------
    user
        .save()
        .then(data => {
            res.send({
                success: true,
                message: "Su registro se ha guardado exitosamente",
                data: data
            });
        })
        .catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Ocurrio un error al crear el registro",
            });
            console.log(err);
        })
}

// ------------- retrieve and return all users ------------------
exports.all_users = (req, res) => {
    User.find()
        .then(data => {
            var message = "";
            if (data === undefined || data.length == 0) message = "Personas no encontradas!";
            else message = "Publico recibido";
            res.send({
                success: true,
                message: message,
                data: data
            });
        })
        .catch(err => {
            res.status(500).send({
                success: false,
                message: err.message || "Ocurrio un error al traer los registros"
            });

        });
};


// --------- find a user by id -------------
exports.user_details = (req, res) => {
    User.findById(req.params.id)
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: "Persona no encontrada con el id" + req.params.id
                });
            }
            res.send({
                success: true,
                message: "Persona encontrada",
                data: data
            });
        })
        .catch(err => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    success: false,
                    message: "Persona no encontrada con el id " + req.params.id
                });
            }
            return res.status(500).send({
                success: false,
                message: "Error al traer la persona con el id " + req.params.id
            });
        });
};

// --------- Find user and update ----------
exports.user_update = async(req, res) => {
    const { name, email, password, sede } = req.body;
    // console.log(name, price);
    // validate request
    if (!name || !email) {
        return res.status(400).send({
            success: false,
            message: "Por favor ingrese el nombre y el email del usuario para editar"
        });
    }

    //......Get the hashed password.......
    const hsdpassword = await bcrypt.hash(password, 12);


    User.findOneAndUpdate({ name }, {
            $set: { name: name, email: email, password: hsdpassword, sede: sede }
        }, { new: true })
        .then(data => {
            if (!data) {
                return res.status(400).send({
                    success: false,
                    message: "Usuario no encontrado con el nombre " + req.body.name
                });
            }
            res.send({
                success: true,
                message: "¡Usuario actualizado exitosamente!"
            });
        })
        .catch(err => {
            if (err.kind === "ObjectId") {
                return res.status(404).send({
                    success: false,
                    message: "Usuario no encontrada con el nombre " + req.body.name
                });
            }

            return res.status(500).send({
                success: false,
                message: "Error actualizando la usuario con el nombre " + req.body.name
            });
        });
}

// delete a user with the specified id.
exports.user_delete = (req, res) => {
    const { name } = req.body
    User.findOneAndDelete({ name })
        .then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    message: "Persona no encontrada con el nombre " + name
                });
            }
            res.send({
                success: true,
                message: "Persona eliminada exitosamente"
            });
        })
        .catch(err => {
            if (err.kind === "ObjectId" || err.name === "NotFound") {
                return res.status(404).send({
                    success: false,
                    message: "Persona no encontrada con el nombre " + name
                });
            }
            return res.status(500).send({
                success: false,
                message: "No se puede eliminar el usuario con el nombre " + name
            });
        });
};