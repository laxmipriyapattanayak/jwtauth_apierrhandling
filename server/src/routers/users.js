const userRouter = require("express").Router();

const { registerUser, verifyUser, findUser, loginUser } = require("../controllers/users");
const isLoggedIn = require("../middlewares/auth");
const upload = require("../middlewares/fileUpload");

userRouter.post("/", upload.single('image'), registerUser);
userRouter.post('/verify-user', verifyUser);
userRouter.get('/:id', isLoggedIn, findUser);
userRouter.post('/login', loginUser);

userRouter.get('*' , (req, res) => {
    req.status(404).json({
        message: '404 not found',
    });
});

module.exports = userRouter;