const Comment = require('../models/Comments');
const asyncHandler = require('express-async-handler');
const User = require('../models/Users');

const getAllComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find().lean();
    if(!comments?.length){
        return res.status(400).json({message: 'No comments found'});
    }
    const commentsWithUser = await Promise.all(comments.map(async (com) => {
        const user = await User.findById(com.user).lean().exec()
        return { ...com, username: user.username }
    }))

    res.json(commentsWithUser);
});

const createComment = asyncHandler(async (req, res) => {
    const {user, title, text} = req.body;
    if(!user || !title || !text){
        return res.status(400).json({message: 'Invalid data'});
    }
    const comment = await Comment.create({user, title, text});
    if(comment){
        return res.status(201).json({message: 'Comment created'});
    }
    else{
        return res.status(400).json({message: 'Creation failed'});
    }
});

const updateComment = asyncHandler(async (req, res) => {
    const {id, user, title, text} = req.body;
    if(!id || !user || !title || !text){
        return res.status(400).json({message: 'Invalid data'});
    }
    const comment = await Comment.findById(id).exec();
    if(!comment){
        return res.status(400).json({message: 'Comment not found'});
    }
    comment.user = user;
    comment.title = title;
    comment.text = text;
    const updateComment = await comment.save();
    res.status(200).json({message: 'Comment updated'});
});

const deleteComment = asyncHandler(async (req, res) => {
    const {id} = req.body;
    console.log(id);
    if(!id){
        return res.status(400).json({message: 'Invalid data'});
    }
    const comment = await Comment.findById(id).exec();
    if(!comment){
        return res.status(400).json({message: 'Comment not found'});
    }
    await comment.deleteOne()
    res.status(200).json({message: 'Comment deleted'});
});

module.exports = {
    getAllComments,
    createComment,
    updateComment,
    deleteComment
};