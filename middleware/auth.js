const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const tokenC = require(path.join(__dirname , '..','helpers','TokenSystem.js'));
const tokenDB = require(path.join(__dirname , '..','database','token.js'));

const auth = async (req , res , next )=>{
    
   try {

        const T =  req.headers.authorization ;
        // first problem if there is no token 
    
        if(!T || !T.startsWith('Bearer  ')){
            throw new Error ("Wrong type of authorization or a none at all");
        }
        
        const token = T.split(" ")[1];
        // if is a condetion for the blocked token it will be here  //
        const blocked = await tokenDB.findOne({token});
        if(blocked) {throw new Error ("the token is blocked")};
        
        const decoded = jwt.verify(token,process.env.JWT_GLOBAL_SECRET);
        
        //Make the map for making the class to do the seconed varification token type ??
        const classMap = {
            BuyerAccess: tokenC.BuyerAccess ,
            BuyerRefresh: tokenC.BuyerRefresh,
            StoreRefresh: tokenC.StoreRefresh,
            StoreAccess: tokenC.StoreAccess
        }
    
        const selectedtoken = classMap[decoded.name]
        if(!selectedtoken){throw new Error ('Unkowen class in token it been corrupted')}
    
        const SecCheck = new selectedtoken().verify(decoded);
        if (!SecCheck){
    
            await tokenDB.create({
                holder_id : decoded._id,
                status : "panned",
                Type: decoded.role,
                subType : decoded.type,
                expiresAt:new Date(Date.now() + 1 * 24 * 60 *60 *1000 ),
                token,
            }) ;
    
            throw new Error ("Not the same role it have been corrapted and blacklisted")
        }
    
        req.token = token;
        req.userPayload = decoded;
        return next();

    } catch (error) {

        if(error.name === 'TokenExpiredError'){
            const decoded = jwt.verify(token, process.env.JWT_GLOBAL_SECRET, { ignoreExpiration: true });
            req.re_id = decoded._id;
            return res.status(401).json({error: 'Token is expired go to auto refresh'});
        }
        
        return res.status(403).json({error: error.message});

    }
}

module.exports = {auth};