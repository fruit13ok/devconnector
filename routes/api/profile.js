const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');

// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');

// api/profile/test
router.get('/test', (req, res) => res.json({msg: 'profile route works'}));

// api/profile
router.get('/', passport.authenticate('jwt', { session: false }), 
    (req, res) => {
        const errors = {};
        // from token req.user.id, if found profile send json, else error
        Profile.findOne({ user: req.user.id })
        // convert from id to user data with only name and avatar
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
    }
);

// Create or edit user profile route
// api/profile
router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const errors = validateProfileInput(req.body).errors;
      const isValid = validateProfileInput(req.body).isValid;
  
      // Check Validation
      if (!isValid) {
        // Return any errors with 400 status
        return res.status(400).json(errors);
      }
  
      // Get fields
      const profileFields = {};
      // again req.user.id is not from form, it is from login user's token
      profileFields.user = req.user.id;
      if (req.body.handle) profileFields.handle = req.body.handle;
      if (req.body.company) profileFields.company = req.body.company;
      if (req.body.website) profileFields.website = req.body.website;
      if (req.body.location) profileFields.location = req.body.location;
      if (req.body.bio) profileFields.bio = req.body.bio;
      if (req.body.status) profileFields.status = req.body.status;
      if (req.body.githubusername)
        profileFields.githubusername = req.body.githubusername;
      // Skills - Spilt into array
      // because form enter as comma separated values
      // in Profile.js model skills is type array
      if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
      }
  
      // Social
      // n Profile.js model social object of objects
      profileFields.social = {};
      if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
      if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
      if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
      if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
      if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
  
      // this route for both create and update profile
      // if found current user profile, the nupdate, else create
      Profile.findOne({ user: req.user.id }).then(profile => {
        if (profile) {
          // found profile, Update
          // profileFields has all the changed fields
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          ).then(profile => res.json(profile));
        } else {
          // no profile, Create
          // Check if handle exists
          Profile.findOne({ handle: profileFields.handle }).then(profile => {
            if (profile) {
              errors.handle = 'That handle already exists';
              res.status(400).json(errors);
            }
  
            // Save Profile
            new Profile(profileFields).save().then(profile => res.json(profile));
          });
        }
      });
    }
);

module.exports = router;
