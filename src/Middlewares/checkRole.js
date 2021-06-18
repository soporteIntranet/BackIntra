exports.checkRole = (req, res, next) => {
    try {
        const { token } = req.headers;
        dataToken = jwt.verify(token, process.env.SECRET);
        const { role } = dataToken;

        if (role !== 'admin') {
            return res.status(401).json({
                message: "¡Acceso no autorizado!",
                success: false
            });
        }
        next();
    } catch (error) {
        // console.log(error);
        res.status(401).send('Token no valido')
    }
};