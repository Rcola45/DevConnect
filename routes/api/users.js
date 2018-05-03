const express = require('express');
const router = express.Router();
const gravatar = require('gravatar'); // For getting user avatar
const bcrypt = require('bcryptjs'); // For encrypting password
const jwt = require('jsonwebtoken'); // To return a web token
const keys = require('../../config/keys'); // to get the secret key
const passport = require('passport');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load user model
const User = require('../../models/User');

/**
 * @route GET /api/users/test
 * @desc Test Users route
 * @access Public
 */
router.get('/test', (req, res) => res.json({msg: "Users api test endpoint"}));

/**
 * @route POST /api/users/register
 * @desc Register a user route
 * @access Public
 */
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    // Check if email already exists (with bodyParser package)
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                // Email already exists
                errors.email = 'Email already exists';
                return res.status(400).json(errors);
            } else {
                // Make new user
                const avatar = gravatar.url(req.body.email, {
                    s: '200', //size
                    r: 'pg', //rating
                    d: 'mm' //default (mm = unknown user image)
                });

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                // Generate a salt for password and set password to hash
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err){
                            throw err;
                        }
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })

});

/**
 * @route POST /api/users/login
 * @desc Login user / return JWT Token
 * @access Public
 */
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email })
        .then(user => {
            // Check if user is not found
            if(!user){
                return res.status(404).json({email: 'User not found'});
            }

            // Check password
            bcrypt.compare(password, user.password) // password = plaintext, user.password = hashed
                .then(match => {
                    if(match){
                        // User is valid, send auth token + payload

                        // Creating a JWT payload
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar,
                        };


                        // Sign token
                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            {
                                expiresIn: 3600 /* One hour */
                            },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token,
                                })
                            }
                        );
                    }else{
                        // Bad password
                        return res.status(400).json({password: "Incorrect Password"});
                    }

                })
        })
});



/**
 * @route GET /api/users/current
 * @desc Get current user
 * @access Private
 */
router.get('/current', passport.authenticate('jwt', {session: false}), (req,res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

module.exports = router;