const User = require('../models/Users');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');


const login = asyncHandler(async (req, res) => {
    const {username, password} = req.body;
    if(!username || !password){
        return res.status(400).json({message: 'Invalid data'});
    }
    const userFound = await User.findOne({username}).exec();
    if(!userFound){
        return res.status(400).json({message: 'User not found'});
    }
    const match = await bcrypt.compare(password, userFound.password);
    if(!match){
        return res.status(400).json({message: 'Invalid credentials'});
    }
    const accessToken = jwt.sign({"UserInfo":{"username": userFound.username, "position": userFound.position}}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});   
    const refreshToken = jwt.sign({"username": userFound.username}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1d'});
    res.cookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 24*60*60*1000});
    res.json({accessToken})
});

const refresh = (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt){
        return res.status(401).json({message: 'Unauthorized'});
    }
    const refreshToken = cookies.jwt;
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async(err, decoded) => {
            if(err){
                return res.status(403).json({message: 'Invalid token'});
            }
            const userFound = await User.findOne({username: decoded.username}).exec();
            if(!userFound){
                return res.status(400).json({message: 'User not found'});
            }
            const accessToken = jwt.sign({username: userFound.username, position: userFound.position}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '15m'});
            res.json({accessToken})
        })
    )
};

const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if(!cookies?.jwt){
        return res.status(401).json({message: 'Unauthorized'});
    }
    res.clearCookie(
        'jwt',
        {httpOnly: true, sameSite: 'None', secure: true}
    );
    res.json({message: 'Logged out'});
});

module.exports = {login, refresh, logout}