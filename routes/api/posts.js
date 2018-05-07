const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const isEmpty = require('../../validation/is-empty');

// Models
const Post = require('../../models/Post');

// Validation
const validatePostInput = require('../../validation/post');


/**
 * @route GET /api/posts/test
 * @desc Test Posts route
 * @access Public
 */
router.get('/test', (req, res) => res.json({msg: "Posts api test endpoint"}));


/**
 * @route GET /api/posts
 * @desc Get posts
 * @access Public
 */
router.get('/', (req,res) => {
    Post.find()
        .sort({ date: -1 }) // Sorts by date
        .then(posts => {
            res.json(posts);
        })
        .catch(err => res.status(404).json({ noposts: 'No posts found' }));
});


/**
 * @route GET /api/posts/:id
 * @desc Get single post
 * @access Public
 */
router.get('/:id', (req,res) => {
    Post.findById( req.params.id )
        .then(post => {
                return res.json(post);
        })
        .catch(err => res.status(404).json({ noposts: 'No post found with that ID'}));
});




/**
 * @route POST /api/posts
 * @desc Create post
 * @access Private
 */
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(newPost));

    Post.create()
});



/**
 * @route POST /api/posts/like/:id
 * @desc Like a post
 * @access Private
 */
router.post('/like/:id', passport.authenticate('jwt', {session:false}), (req,res) => {
    Post.findById(req.params.id)
        .then(post => {
            // Check if user has already liked this post
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                return res.status(400).json({ alreadyliked: 'User has already liked this post'})
            }

            // Add user to likes array
            post.likes.push({ user: req.user.id });

            post.save()
                .then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ noposts: 'Post not found with that Id'}));

});


/**
 * @route POST /api/posts/unlike/:id
 * @desc Unlike a post
 * @access Private
 */
router.post('/unlike/:id', passport.authenticate('jwt', {session:false}), (req,res) => {
    Post.findById(req.params.id)
        .then(post => {
            // Check that user has previously liked this post
            if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                // User not there
                return res.status(400).json({ notliked: 'User has not liked this post yet'})
            }

            // Add user to likes array
            const removeIndex = post.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);

            post.likes.splice(removeIndex, 1);

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ noposts: 'Post not found with that Id'}));

});


/**
 * @route DELETE /api/posts/:id
 * @desc Delete post
 * @access Private
 */
router.delete('/:id', passport.authenticate('jwt', {session:false}), (req,res) => {
    Post.findById(req.params.id)
        .then(post => {
            // Check for the post owner
            if(post.user.toString() !== req.user.id ){
                return res.status(401).json({ notauthorized: 'User not authorized'});
            }else{
                // User authorized
                post.remove()
                    .then(() => {
                        res.json({ success: true })
                    })
                    .catch(err => res.status(404).json({ noposts: 'Post not found with that Id'}));
            }
        })
});




/**
 * @route POST /api/posts/comment/:id
 * @desc Make a comment on a post
 * @access Private
 */
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    Post.findById( req.params.id )
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id // The logged in user
            };

            // add to posts comment array
            post.comments.unshift(newComment);

            post.save()
                .then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ noposts: 'No post found with that ID'}));
});



/**
 * @route DELETE /api/posts/comment/:id/:comment_id
 * @desc Delete a comment on a post
 * @access Private
 */
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Post.findById( req.params.id )
        .then(post => {
            // Check that comment exists on this post
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0){
                // Comment not there
                return res.status(404).json({ nocomment: 'Comment does not exist'})
            }

            // Add user to likes array
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);

            // Remove from posts' comments array
            post.comments.splice(removeIndex, 1);

            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ noposts: 'No post found with that ID'}));
});
module.exports = router;