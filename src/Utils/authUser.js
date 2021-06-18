const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authJWT = require('../Middlewares/passport')
const passport = require("passport");
passport.use(authJWT)
const User = require("../Models/userModel");
const nodemailer = require("nodemailer");



//.......Describe the user registration...........

const userRegister = async(userDets, res) => {
    try {
        //Validate the email
        let emailNotRegistered = await validateEmail(userDets.email);
        if (!emailNotRegistered) {
            return res.status(400).json({
                message: `El email esta actualmente registrado.`,
                success: false
            });
        }

        //......Get the hashed password.......
        const password = await bcrypt.hash(userDets.password, 12);
        //......Create a new user..........
        const newUser = new User({
            ...userDets,
            password,
        });
        await newUser.save();
        return res.status(201).json({
            message: "Registrado con exito. Ahora inicia sesión",
            success: true
        });
    } catch (err) {
        // Implement logger function
        console.log(err);
    }
};

//.......Describe to login user..........

const userLogin = async(userCreds, res, req) => {
    let { email, password } = userCreds;

    if (!email || !password) {
        return res.status(400).send("¡Por favor ingrese un email y una contraseña valida!");
    }

    //First check if the username is in the database
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send("¡Usuario no encontrado, credenciales invalidas para iniciar sesion!");
    }

    //Now check for the password
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        //Sign in the token and issue it to the user
        let token = jwt.sign({
                name: user.name,
                role: user.role,
                username: user.username,
                email: user.email,
            },
            process.env.SECRET, { expiresIn: '6h' }
        );

        let result = {
            token: `${token}`,
        };
        return res.status(200).json({
            ...result
        });
    } else {
        return res.status(403).send("Contraseña incorrecta.");
    }
};


//....... Change Password .......
const changePass = async(userCreds, req, res) => {
    const {email} = userCreds;
    if(!(email)){
        return res.status(400).json({message: "El correo es obligatorio"})
    }

    //First check if the email is in the database
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send("¡Usuario no encontrado, debes crear una cuenta para cambiar la contraseña!");
    }

    try {
        let token = jwt.sign({
            id: user.id,
            email: user.email,
        }, process.env.SECRET, {expiresIn: '10m'})
    
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "soporteintranet@mvv.org.co", // generated ethereal user
              pass: "SupportIntranet2021$#", // generated ethereal password
            },
          });
    
        let info = await transporter.sendMail({
            from: 'supportIntranet@mvv.org.co',
            to: email,
            subject: 'Cambio de contraseña',
            html: `
                <h2>PorFavor ingrese al siguiente link para restablecer la contraseña<h2/>
                <p>${process.env.URL}${process.env.ROUTE}/changePassword/${token}<p/>
            `
        })
    
    
        transporter.sendMail(info);
        console.log("OK");
    } catch (error) {
        console.log("Problema");
    }

}

const changePassword = async (req, res) => {
    const {user, newPassword} = userDets;
    const {resetToken} = req.headers.reset

    if(!(user && resetToken && newPassword)){
        res.status(400).json({message: "All fields are required"})
    }

    //......Get the hashed password.......
    const hsdpassword = await bcrypt.hash(newPassword, 12);


    User.findOneAndUpdate({ user }, {
            $set: { password: hsdpassword }
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

//....... Email validate.............
const validateEmail = async email => {
    let user = await User.findOne({ email });
    return user ? false : true;
};

module.exports = {
    userLogin,
    userRegister,
    changePassword,
    changePass
};