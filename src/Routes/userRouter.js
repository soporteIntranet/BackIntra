const express = require('express');
const router = express.Router();

// --------- Import the controllers ----------
const user_controller = require('../Controllers/userController');
const { checkRole } = require('../Middlewares/checkRole');
const { userRegister, userLogin, changePassword } = require('../Utils/authUser');


router.route("/list").get(user_controller.all_users);

router.route("/details/:id").get(user_controller.user_details);

router.route("/update").post(user_controller.user_update);

router.route("/delete").post(user_controller.user_delete);

router.post("/register", async(req, res) => {
    await userRegister(req.body, res);
});

router.post("/login", async(req, res) => {
    await userLogin(req.body, res);
});

router.post("/changePassword", async(req, res) => {
    await changePassword(req.body, res);
})

module.exports = router;