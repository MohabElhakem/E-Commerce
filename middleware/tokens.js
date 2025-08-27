const path = require ('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();


function createBuyerToken (user_from_DB){

    const payload = {

        username : user_from_DB.username,
        email : user_from_DB.email,
        _id : user_from_DB._id,
        role: user_from_DB.role,
    }

    const token = jwt.sign(payload, process.env.JWT_BUYER_TOKEN_SECRET , {expiresIn: "5h"});
    return token ;
} 


function createTempToken (Basic_info){

    const payload = {

        username: Basic_info.username,
        email: Basic_info.email,
        hashedPassword : Basic_info.hashedPassword

    }
    const token = jwt.sign(payload, process.env.JWT_TEMP_TOKEN_SECRET,{expiresIn: '15m'});
    return token;
}
function createAccesStoreToken(store_from_DB){
        const payload= {
        username : store_from_DB.username,
        email: store_from_DB.email,
        isVerified: store_from_DB.isVerified,
        _id:store_from_DB._id

    }
    const token = jwt.sign(payload, process.env.JWT_STORE_ACCESS_SECRET,{expiresIn: "1h"});
    return token
}

function createStoreRrfrshToken(store_from_DB){
    const payload= {
        username : store_from_DB.username,
        email: store_from_DB.email,
        isVerified: store_from_DB.isVerified,
        _id:store_from_DB._id

    }
    const token = jwt.sign(payload, process.env.JWT_STORE_REFRESH_SECRET,{expiresIn: "180d"});
    return token
}
module.exports = {createBuyerToken,createTempToken,createStoreRrfrshToken,createAccesStoreToken};