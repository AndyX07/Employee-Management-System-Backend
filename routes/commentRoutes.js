const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const verifyJwt = require('../middleware/verifyJwt');

router.use(verifyJwt);

router.route('/')
    .get(commentController.getAllComments)
    .post(commentController.createComment)
    .patch(commentController.updateComment)
    .delete(commentController.deleteComment)
    
module.exports = router;