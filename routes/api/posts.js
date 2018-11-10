const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Post model
const Post = require('../../models/Post');
// Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');


// api/posts/test
// Tests post route
router.get('/test', (req, res) => res.json({msg: 'posts route works'}));

// api/posts
// Get posts
// find() no argument will find all
// date: -1 means date descending order, so 1 means ascending
router.get('/', (req, res) => {
    Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));
});

// api/posts/:id
// Get post by id
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: 'No post found with that ID' })
    );
});

// api/posts
// Create post
// avatar and user are pull from react redux state
router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const errors = validatePostInput(req.body).errors;
      const isValid = validatePostInput(req.body).isValid;
  
      // Check Validation
      if (!isValid) {
        // If any errors, send 400 with errors object
        return res.status(400).json(errors);
      }
  
      const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      });
  
      newPost.save().then(post => res.json(post));
    }
);

// api/posts/:id
// Delete post
// only user own this post can delete
// find post by post id from params, check own to current user,
// NOTE: Profile.findOne() might not be necessary!!
router.delete('/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // never use Profile.findOne
    //   Profile.findOne({ user: req.user.id }).then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            // Check for post owner
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notauthorized: 'User not authorized' });
            }
  
            // Delete
            post.remove().then(() => res.json({ success: true }));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    //   });
    }
);

// api/posts/like/:id
// Like post
// again, req.user.id is from token of current login user,
// compare user stored in likes array to current user,
//      use filter if found user, array length > 0,
// if user already like, cannot like again,
// else add user to post's likes array,
// seave post send back post as json
router.post('/like/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    //   Profile.findOne({ user: req.user.id }).then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
              return res.status(400).json({ alreadyliked: 'User already liked this post' });
            }
  
            // Add user id to likes array
            post.likes.unshift({ user: req.user.id });
  
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    //   });
    }
);

// api/posts/unlike/:id
// Unlike post
// find post, compare post's likes array user to current user,
// use filter, if no match array length is 0,
// if has liked, use map, indexOf, splice to remove the like from likes array,
// save post, send back post as json
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
    //   Profile.findOne({ user: req.user.id }).then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
              return res.status(400).json({ notliked: 'You have not yet liked this post' });
            }
  
            // Get remove index
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);
  
            // Splice out of array
            post.likes.splice(removeIndex, 1);
  
            // Save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    //   });
    }
);

// api/posts/comment/:id
// Add comment to post
// find post by post id, create new comment,
// add to post's comments array,
// save post, sand back as json
router.post('/comment/:id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      const errors = validatePostInput(req.body).errors;
      const isValid = validatePostInput(req.body).isValid;
  
      // Check Validation
      if (!isValid) {
        // If any errors, send 400 with errors object
        return res.status(400).json(errors);
      }
  
      Post.findById(req.params.id)
        .then(post => {
          const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
          };
  
          // Add to comments array
          post.comments.unshift(newComment);
  
          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    }
);
  
// api/posts/comment/:id/:comment_id
// Remove comment from post
// :id is the post id, req.params.id,
// :comment_id is the comment id, req.params.comment_id,
// find post by post id,
//      post.comments array, use filter to match each comment with comment id,
// if match, use map, indexOf, splice to remove comment from comments array,
// save post and send back as json
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Post.findById(req.params.id)
        .then(post => {
          // Check to see if comment exists
          if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json({ commentnotexists: 'Comment does not exist' });
          }
  
          // Get remove index
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);
  
          // Splice comment out of array
          post.comments.splice(removeIndex, 1);
  
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    }
);

module.exports = router;