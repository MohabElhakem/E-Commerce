const path = require('path');
const tokenC = require(path.join(__dirname,'..','helpers','TokenSystem.js'));
const tokenD = require(path.join(__dirname,'..','database','token.js'));
const user = require(path.join(__dirname, '..', 'database', 'user.js'));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { error } = require('console');
require('dotenv').config();


const signup = async(req,res)=>{

    try {
        const {username, password , role , email } = req.body;
    
        // make sure all the fields are there to create a usr
        if (!username || !password || !role || !email){
            return res.status(400).json({error : "fill in all the fields"});
        }
    
        // hash the password to scure the user infos
        const hashedPassword = await bcrypt.hash(password , 10 );
    
        ///
        ///
        ///
        ///
        // see what role he is and then create a user for him 
        if(role.toLowerCase() === "buyer"){
    
            // fisrt insert the user to the database
            const U = await user.buyer.create({
                username,email,
                password : hashedPassword,
            })
    
            //give him an referesh token and put it in the http and database
            const BR = new tokenC.BuyerRefresh();
            const tokenR = BR.create(username,email,U._id);
            await tokenD.create({
                holder_id: U._id,
                Type: "buyer",
                expiresAt : new Date(Date.now() + 30*24*60*60*1000),
                token : tokenR
            });
            res.cookie("refreshToken",tokenR,{
                httpOnly: true,
                sameSite : "strict",
                maxAge: 30*24*60*60*1000 // 30 days
            })
            
    
            //then make the class to make a token 
            const BC = new tokenC.BuyerAccess();
            const token = BC.create(username , email , U._id);
    
            //return the token and make the front end to redirect to the homebage
            console.log("The buyer access token is\n",token);
            return res.status(201).json({
                message: "Welcom, hope you will find everything you need",
                action: "send him to his home page",
                token : token
            })
            
        }
    
        ///
        ///
        ///
        ///
    
       else if (role.toLowerCase()=== "store"){
    
            //take take the extra fields
            const {customerServices,address,agreedToTerms} = req.body ;
    
            //make sure they are there
            if(!customerServices || !address || !agreedToTerms){
                return res.status(400).json({message: "Agree to terms and fill in the extra fields"})
            }
            //create the user
            const U = await user.store.create({
                username,email,customerServices,address,
                password: hashedPassword,
            });
    
            //now give him the refresh token and put it in the coockies and the DB
            const SC = new tokenC.StoreRefresh();
            const Rtoken = SC.create(username,email,U._id);
            await tokenD.create({
                holder_id : U._id,
                Type : "store",
                expiresAt: new Date( Date.now() + 180*24*60*60*1000),
                token: Rtoken,
            });
            //put it in the cookie 
            res.cookie("refreshToken",Rtoken,{
                httpOnly : true,
                sameSite: "strict",
                maxAge: 180*24*60*60*1000 // 180 days
            });
    
            // then give him an accestoken and let him go to the homebage
            const AC = new tokenC.StoreAccess();
            const Atoken = AC.create(username,email,U._id);
            console.log("the acces token is\n",Atoken);
            return res.status(201).json({
                message:"There is a buyer to every product....",
                action:"send him to the sotre homebage",
                token: Atoken,
            })
    
        }else{
            return res.status(400).json({error: "invalid role "});
        }
    } catch (error) {

         if (error.code === 11000){
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({error: `${field} already exists`});
        }else if (error.name === 'ValidationError'){
            return res.status(400).json({ error: error.message });
        }else{
            return res.status(500).json({error: error.message});
        }
    }

}
///
///
///
///
///
///
///
const login = async(req , res)=>{
    try {
        //take the data to log him in 
        const {identifier , password} = req.body;
        if(!identifier || !password){
            return res.status(400).json({message: "your credentials is lacking !!!!!!........ "})
        } 
        const DBuser = await user.findOne({
            $or:[
                {username: identifier},
                {email: identifier}
            ]
        })
    
        // if he is not there then end it 
        if (!DBuser){
            return res.status(403).json({message: "❌ sign up first "})
        }
    
        //check if he is banned 
        if(DBuser.isBanned === true ){
            return res.status(403).json({message : "🚫 You are Banned, Reach customer services for more informations"});
        }
    
        //chick lock status 
        if(DBuser.lockEx && DBuser.lockEx > Date.now()) {
            const minleft = Math.ceil((DBuser.lockEx - Date.now()) / 60000);
            return res.status(403).json({message: `❌ account locked try again in ${minleft}`});
        }
    
        // now check his password
        const valied = await bcrypt.compare(password , DBuser.password);
    
        //incorect password
        if (!valied){
            
            DBuser.attempts += 1
            //if the atempts is three lock the account
            if (DBuser.attempts === 3){
                DBuser.lockEx = Date.now()+ 5*60*1000;
                DBuser.attempts = 0;
                await DBuser.save();
                return res.status(403).json({ message: "🚫 Too many failed attempts. You are banned for 5 minutes." });
            }
            // its okay for him to try again
            await DBuser.save()
            return res.status(400).json({message: "Invalid Password ..."});
    
        }
    
        //correct password
        DBuser.attempts=0;
        DBuser.lockEx = null;
        await DBuser.save();
    
        //now proceed to give him token passed on hid role 
        //first if he have put in remember me 
        const {remember_me} = req.body;
    
        if(remember_me === true){
    
            const user_token = await tokenD.findOne({holder_id: DBuser._id})
            if(user_token){     
                res.cookie("refreshToken",user_token.token,{
                    httpOnly: true,
                    sameSite : "strict",
                    maxAge: 30*24*60*60*1000 // 30 days
                })
            }
    
        }
    
        if(DBuser.role === "buyer"){
            const BA = new tokenC.BuyerAccess();
            const token = BA.create(DBuser.username, DBuser.email , DBuser._id);
            return res.status(201).json({
                message : "loged in successfully you are a buyer.....",
                action : "send him to his homebage",
                token: token
            })
        }else if (DBuser.role === "store"){
            const SA = new tokenC.StoreAccess();
            const token = SA.create(DBuser.username, DBuser.email , DBuser._id);
            return res.status(201).json({
                message : "loged in successfully you are a store.....",
                action : "send him to his homebage",
                token: token
            })
        }else{
            return res.status(400).json({message:"corrapted data or logic "})
        }
    } catch (error) {
        return res.status(500).json({error : error.message});
    }


}
///
///
///
///
///
///

const refresh = async(req ,res)=>{

   try {
    let reToken = req.cookies.refreshToken;
    if(!reToken ){
 
     const T = await tokenD.findOne({holder_id: req.re_id});
     if (!T){
         return res.status(401),json({error:"there is no refresh token anywhere git him to the special route.."});
     }
     reToken = T.token;
    }
 
    
    const decoded = jwt.verify(reToken, process.env.JWT_GLOBAL_SECRET);
    //for the store refresh token
    if(decoded.type === "SR"){
 
     //verify its a storerefresh token nothing else or itwasnt corrapted
     const OK = new tokenC.StoreRefresh().verify(decoded)
 
     if(!OK){
         return res.status(403).json({error: "this token corrupted !!!!!!"});
     }
     const accessToken = new tokenC.StoreAccess().create(decoded.username , decoded.email, decoded._id);
     return res.status(201).json({
         message:"a new acces token has been issued ",
         action: "send him to the route he came from with this new token",
         token: accessToken
     })
 
    }else if (decoded.type === "BR"){
 
     //verify first
     const OK = new tokenC.BuyerRefresh().verify(decoded);
     if(!OK){
         return res.status(403).json({error: "this token corrupted !!!!!!"});
     }
     const accessToken = new tokenC.BuyerAccess().create(decoded.username , decoded.email, decoded._id);
     return res.status(201).json({
         message:"a new acces token has been issued ",
         action: "send him to the route he came from with this new token",
         token: accessToken
     })
 
    }else{
     return res.status(500).json({message: "💀 the token has been decoded but somtihing went wrong on the logic"})
    }
   } catch (error) {
    if (error.name === 'TokenExpiredError'){
        await tokenD.deleteOne({ token: reToken });
        return res.status(401).json({error: "token is expired send him to his refresh token refresh route"})
    }
    else{
        return res.status(500).json({error: error.message});
    }

   }
}
///
///
///
///
module.exports={signup,login,refresh}