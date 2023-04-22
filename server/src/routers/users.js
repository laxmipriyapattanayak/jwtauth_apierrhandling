const userRouter = require("express").Router();

const { registerUser } = require("../controllers/users");
const upload = require("../middlewares/fileUpload");

userRouter.post("/", upload.single('image'), registerUser);

userRouter.get('*' , (req, res) => {
    req.status(404).json({
        message: '404 not found',
    });
});

module.exports = userRouter;