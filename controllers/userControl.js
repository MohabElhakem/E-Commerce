const path = require('path');
const user = require(path.join(__dirname,'..','database','user.js'));
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
const { execFileSync } = require('child_process');
const token = require(path.join(__dirname,'..','middleware','tokens.js'));


const signup = async(req , res)=>{
    try {
        const {username , email , password , role ,address} = req.body;
        // chick if he have all the sata needed to proceed
        if(!username || !email || !password || !role ){
            return res.status(400).json({message:"❌ Missing required field"})
        }
        //hash the password dont send it raw 
        const hashedPassword = await bcrypt.hash(password,10);

        //Buyer Role Signup
        if (role === "Buyer") {
            const BUYER =  await user.buyer.create({
                username,
                password : hashedPassword,
                email,
                address,
            });
        
            //create a token for the user and then send it for the front end
            const authToken = token.createBuyerToken(BUYER);
        
            console.log("✔︎token generated successfully\n",authToken);
            return res.status(201).json({
                message: "Welcom to our store 🏬 ",
                token: authToken,
            });

        //Store role signup
        }else if (role === "store"){
            //create a token to make him go for the steup of the store
            const Info = {
                username,
                hashedPassword,
                email,
            }
            const setupToken = token.createTempToken(Info);
            console.log("Temp token :\n",setupToken);
            return res.status(200).json({
                message: "May you read our conditions and procssed with setting up your store",
                token: setupToken
            })


        }
    } catch (error) {

        if (error.code === 11000){
            const field = Object.keys(error.keyValue)[0];
            return res.status(400),json({error :`${field} already exists`});
        }else if (error.name === 'ValidationError'){
            return res.status(400).json({ error: error.message });
        }else{
            return res.status(500).json({error: error.message});
        }

    }

}

const login = async (req ,res)=> {
    //take the data to log in 
    const data = req.body;
    //make sure u have both fields
    if(!data.email_or_username || !data.password){
        return res.status(400).json({error: "incomplete credentials"})
    }
    //search for the user to see if he is in the database
    const DBuser = await user.findOne({
        $or : [
            {username : data.email_or_username},
            {email: data.email_or_username}
        ]
    })
    //if he is not in the DataBase
    if (!DBuser){
        return res.status(404).json({message: "User not found signup first ..."});
    }
    //he is there check if he is banned
    if(DBuser.isBanned === true ){
        return res.status(403).json({message : "🚫 You are Banned, Reach customer services for more informations"});
    }
    //chick ban status
    if(DBuser.banEx && DBuser.banEx > Date.now()) {
        const minleft = Math.ceil((DBuser.banEx - Date.now()) / 60000);
        return res.status(403).json({message: `❌ account locked try again in ${minleft}`});
    }
    //now check his password
    const proceed = await bcrypt.compare(data.password,DBuser.password);

    // wrong password condetions
    if(!proceed){

        
        DBuser.attempts += 1;
        //if the attempts are now 3 set the banEx
        if(DBuser.attempts === 3 ){
            DBuser.banEx = Date.now() + 1 * 60 *1000; 
            DBuser.attempts = 0;
            await DBuser.save();
            return res.status(403).json({ message: "🚫 Too many failed attempts. You are banned for 1 minutes." });
        }
        //not the 3rd attempt so save the new user values
        await DBuser.save();
        return res.status(400).json({message: "Invalid Password ..."});
        
    }


    //the correct password
    DBuser.attempts = 0;
    DBuser.banEx = null;
    await DBuser.save();

    //next step creating the tokens basied on roles and condetions 
    //still in progress 

}