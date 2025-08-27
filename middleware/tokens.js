const path = require ('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();


function createToken (user_from_DB,condetion){

    const payload = {

        username : user_from_DB.username,
        email : user_from_DB.email,
        _id : user_from_DB._id,
        role: user_from_DB.role
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET , condetion);
    return token ;
} 


module.exports = {createToken,};