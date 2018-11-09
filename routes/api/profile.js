const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

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

// api/profile/handle/:handle
// Get profile by handle, like user name on the url
// so use req.params.handle which is :handle
router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// api/profile/user/:user_id
// Get profile by user ID
router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: 'There is no profile for this user' })
    );
});

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

// api/profile/experience route
// Add experience to profile from form, 
// return the profile with experience
router.post('/experience', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = validateExperienceInput(req.body).errors;
    const isValid = validateExperienceInput(req.body).isValid;

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// api/profile/education
// Add education to profile
// return the profile with education
router.post('/education', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = validateEducationInput(req.body).errors;
    const isValid = validateEducationInput(req.body).isValid;

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// api/profile/experience/:exp_id
// Delete experience from profile
// NOTE: when accessing mongo _id,
// .id return string format, (should use string format)
//    EX: item.id
// ._id return object format,
//    EX: item._id
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // after found profile by user id,
    // find the experience id by :exp_id on url,
    //    by access whole experience array of objects,
    //    use map to change to array of string of experience id,
    //    use indexOf to find which array index that id is in,
    //    use splice to remove that experience object from experience array,
    //    use save to save DB,
    //    then return updated profile as json back
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// api/profile/education/:edu_id
// Delete education from profile
// do the same as delete experience from above
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// api/profile
// Delete profile and user
// findOneAndRemove profile then,
// findOneAndRemove user,
// return true
router.delete('/', passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);

module.exports = router;
