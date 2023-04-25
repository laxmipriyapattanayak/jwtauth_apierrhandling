const dev = require("../config");
const User = require("../models/users");
const { errorResponse, successResponse } = require("../utils/responseHandler");
var createError = require('http-errors');
const { createjsoWebToken } = require("../utils/token");
const { sendEmailWithNodeMailer } = require("../utils/email");
const { securePassword, comparePassword } = require("../utils/password");
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

const registerUser = async(req,res,next) => {
    try{
        const { name, email, password, phone }= req.body;

        if(!name || !email || !password || !phone)
            throw createError(404,'name, email, password or phone is missing');
        
        if(password.length < 6)
            throw createError(400,'length of password should be atleast 6 characters');
        
        const image = req.file;
        if (image && image.size > Math.pow(1024, 1024))
            throw createError(
                400,
                'file too large.file size must be less than 1 mb'
            );

        const user = await User.findOne({ email });
        if (user)
        throw createError(
            400,
            'user with this email already exist.please sign in'
        );

        const hashedPassword = await securePassword(password);

        //create a token for storing data temporarily
        let token;
        if (image) {
            token = createjsoWebToken(
                {
                    ...req.body,
                    password: hashedPassword,
                    image: image.path,
                },
                dev.app.jwtAccountActivationKey,
                '1m'
            );
        } else {
            token = createjsoWebToken(
                {
                    ...req.body,
                    password: hashedPassword,
                },
                dev.app.jwtAccountActivationKey,
                '1m'
            );
        }
        //prepare emaildata using jwt token
        const emailData={
            email,
            subject: "Acount Activation Email",
            html: `
            <h2> Hello ${name}! </h2>
            <p> please click here to <a href="${dev.app.clientUrl}/api/users/activate?token=${token}" target="_blank">activate your account </a></p>
            `,
        };
        sendEmailWithNodeMailer(emailData);

        return successResponse(res, 200, 'email sent,please go to your email', {token})

        //res.status(200).json({ message: 'email was sent' });
    } catch (error) {
        next(error)
    }
};
const verifyUser = async (req, res, next) => {
    try{
        //get token from req body
        const token  = req.body.token;
        if( !token )
            throw createError(404,'token not found');
        //verify token and decode data
        const decoded=jwt.verify(token, String(dev.app.jwtAccountActivationKey));

        //create user
           const newUser = new User({ ...decoded });
        
        //save the user
        const user= await newUser.save();

        //send the response
        if(!user) throw createError(400,'user was not created');

        return successResponse(
            res,
            201,
            'user was created successfully ! please sign in'
        ); 
        
    } catch (error){
        errorResponse(res, 500, error.message)
    }
};
const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if( !email || !password) 
            throw createError(404, 'wrong email or password ')

        if(password.length < 6)
            throw createError(400, 'password must be atleast 6 characters')
        const user = await User.findOne({ email })

        if (!user) 
            throw createError(404, 'user doesnot exist with this email. please register first');

        const isPasswordMatched = await comparePassword(password, user.password);

        if(!isPasswordMatched)
            throw createError(400, 'email/password did not match');

        if(user.isBanned)
            throw createError(403, 'user is banned');

        // create the token
        //generate JWT acces Token

        const token = jwt.sign({ id:user._id }, String(dev.app.jwtAuthorizationKey),{
            expiresIn: '5m'
        });

        //reset the cookie
        if(req.cookies[`${user._id}`]){
            req.cookies[`${user._id}`] = " "
        }

        //token in a response
        res.cookie(String(user._id), token, {
            path: '/',
            expires: new Date(Date.now() + 1000 * 4 * 60),
            httpOnly: true, 
            sameSite: 'none',
            secure: false,
          }); 

        const userData= {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            image: user.image,
        };

        return successResponse(res, 200, 'user was loggedin', {
            user: userData,
            token: token,
        });

    } catch (error) {
        next(error)
    }
};
const findUser = async (req, res, next) => {
    try{
        const id = req.params.id;
        const user = await User.findById(id);
        if(!user) throw createError(404,'user was not found')
        return successResponse(res, 200, 'user returned successfully', {user : user})
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            next(createError(400, 'invalid id'));
            return;
        }
        next(error);
    }
};
module.exports = { registerUser, verifyUser,findUser, loginUser }