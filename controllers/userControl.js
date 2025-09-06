const path = require('path');
const tokenC = require(path.join(__dirname,'..','helpers','TokenSystem.js'));
const tokenD = require(path.join(__dirname,'..','database','token.js'));
const user = require(path.join(__dirname, '..', 'database', 'user.js'));
const bcrypt = require('bcrypt');


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