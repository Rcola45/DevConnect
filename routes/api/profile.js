const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load validators
const validateProfileInput = require('../../validation/profile');

// Load models
const Profile = require('../../models/Profile');
const User = require('../../models/User');


/**
 * @route GET /api/profile/test
 * @desc Test Profile route
 * @access Public
 */
router.get('/test', (req, res) => res.json({msg: "Profile api test endpoint"}));


/**
 * @route GET /api/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/', passport.authenticate('jwt', { session: false }), (req,res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar']) // Gets users name and avatar info and populates profile
        .then(profile => {
            if(!profile){
                errors.noprofile = 'No profile found for this user';
                return res.status(404).json(errors);
            }
            // res.json automatically sends a 200 status
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


/**
 * @route GET /api/profile/all
 * @desc Get all profiles
 * @access Public
 */
router.get('/all', (req,res) => {
    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles){
                errors.noprofile = 'No profiles found';
                return res.status(404).json(errors);
            }

            res.json(profiles);
        })
        .catch(err => res.status(404).json({noprofile: 'No profiles found'}));
});

/**
 * @route GET /api/profile/handle/:handle
 * @desc Get profile from handle
 * @access Public
 */
router.get('/handle/:handle', (req,res) => {
    const errors = {};

    Profile.findOne({ handle: req.params.handle }) // req.params.handle are in url params
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'No profile with that handle';
                return res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});


/**
 * @route GET /api/profile/user/:user_id
 * @desc Get profile from user id
 * @access Public
 */
router.get('/user/:user_id', (req,res) => {
    const errors = {};

    Profile.findOne({ user: req.params.user_id }) // req.params.user_id are in url params
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile){
                errors.noprofile = 'No profile with that user id';
                return res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json({noprofile: 'No profile found for this user id'}));
});



/**
 * @route POST /api/profile
 * @desc Create or edit user profile
 * @access Private
 */
router.post('/', passport.authenticate('jwt', { session: false }), (req,res) => {
    const {errors, isValid} = validateProfileInput(req.body);

    // Check Validation
    if(!isValid){
        // Return the errors
        return res.status(400).json(errors);
    }

    // Get the profile fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // Skills: Split into array (currently csv)
    if(typeof req.body.skills !== 'undefined'){
        profileFields.skills = req.body.skills.split(',');
    }

    // Social links
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;


    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile){
                // Update profile
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields},
                    { new: true}
                ).then(profile => res.json(profile));
            }else{
                // Create profile

                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile){
                            // Exists already
                            errors.handle = 'DevConnect handle already exists';
                            res.status(400).json(errors);
                        }

                        // Save profile
                        new Profile(profileFields)
                            .save()
                            .then(profile => res.json(profile));

                    })
            }
        })

});


module.exports = router;