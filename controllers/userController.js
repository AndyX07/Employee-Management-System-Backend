const User = require('../models/Users');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if(!users?.length){
        return res.status(400).json({message: 'No users found'});
    }
    res.json(users);
});

const createUser = asyncHandler(async (req, res) => {
    const {username, password, position} = req.body;
    if(!username || !password || !Array.isArray(position)){
        return res.status(400).json({message: 'Invalid data'});
    }
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate){
        return res.status(400).json({message: 'Username already exists'});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userObj = {
        username,
        password: hashedPassword,
        position
    };
    const user = await User.create(userObj);
    if(user){
        return res.status(201).json({message: 'User created'});
    }
    else{
        return res.status(400).json({message: 'Invalid data'});
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const {id, username, password, position, active} = req.body;
    if(!id||!username||!Array.isArray(position)){
        return res.status(400).json(req.body);
    }
    const user = await User.findById(id).exec();
    if(!user){
        return res.status(400).json({message: 'User not found'});
    }
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate && duplicate._id.toString() !== id){
        return res.status(400).json({message: 'Username already exists'});
    }
    user.username = username;
    user.position = position;
    user.active = active;
    
    if(password){
        user.password = await bcrypt.hash(password, 10);
    }

    const updateUser = await user.save();
    res.status(200).json({message: 'User updated'});
});

const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body;
    if(!id){
        return res.status(400).send('Invalid data');
    }
    const userToDelete = await User.findById(id).exec();
    const result = userToDelete.deleteOne();
    res.json({message: `${result.username} ${result._id} deleted`});
});

module.exports = {getAllUsers, createUser, updateUser, deleteUser};