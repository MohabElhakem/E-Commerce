require('dotenv').config();
const jwt = require('jsonwebtoken');


class token {

        #secret
// Constructor runs when "new token()" is called
    constructor(ex,secret){ 
        this.ex = ex; //for the time it expires in
        this.#secret = secret; //for the secret of each class privte storge
        this.payload= {}; //for the payload of each class
    }

// give children a safe way to *use* the secret without seeing it
    getSecret(){
        return this.#secret;
    }

//Abstract Method For creatiing the token
    create(){
        throw new Error(`${this.name} class must implement create() `);
    }

//Abstract Method For Verify the token
    verify(){
        throw new Error(`${this.name} class must implement verify() `)
    }

}
///
///
///
///
///
//Start With the Child Tokens
class BuyerAccess extends token {

    constructor(){
        //parent constructors 
        super( "4h"  ,  process.env.JWT_BUYER_ACCESS_SECRET  );
    }

//Create Method 
    create(username,email,_id){
        this.payload={
            username,
            email,
            _id,
            name: "BuyerAccess",
            role: "buyer",
            TSTC: this.getSecret(),
            type: "BA"
            
        };
        
        const token = jwt.sign(this.payload,process.env.JWT_GLOBAL_SECRET ,{expiresIn:this.ex});

        console.log("The Buyer access Token Is\n",token);
        return token;
    }

//Verify Method
    verify(DecodedPayLoad){
        return (DecodedPayLoad.TSTC === this.getSecret());
    }
}
///
///
///
///
///
class BuyerRefresh extends token {

    constructor(){
        //parent constructors 
        super( "30d"  ,  process.env.JWT_BUYER_REFRESH_SECRET  );
    }

//Create Method 
    create(username,email,_id){
        this.payload={
            username,
            email,
            _id,
            name: "BuyerRefresh",
            role: "buyer",
            TSTC: this.getSecret(),
            type: "BR"
        };
        
        const token = jwt.sign(this.payload,process.env.JWT_GLOBAL_SECRET ,{expiresIn:this.ex});

        console.log("The Buyer Refresh Token Is\n",token);
        return token;
    }

//Verify Method
    verify(DecodedPayLoad){
        return (DecodedPayLoad.TSTC === this.getSecret());
    }
}

///
///
///
///
///
class StoreRefresh extends token {
    constructor(){
        //parent constructors
        super("180d", process.env.JWT_STORE_REFRESH_SECRET);
    }

//Create Method
    create(username,email,_id){
        this.payload={
            username,
            email,
            _id,
            name: "StoreRefresh",
            role : "store",
            TSTC: this.getSecret(),
            type: "SR"
        };

        const token = jwt.sign(this.payload,process.env.JWT_GLOBAL_SECRET ,{expiresIn:this.ex} );
       
        console.log("The Store Refresh Token Is\n",token);
        return token;

    }

//Verify Method
    verify(DecodedPayLoad){
        return (DecodedPayLoad.TSTC === this.getSecret());
    }

}
///
///
///
///
///
class StoreAccess extends token{
    constructor(){
        super("30m",process.env.JWT_STORE_ACCESS_SECRET);
    }
//Create Method
    create(username,email,_id){
        this.payload={
            username,
            email,
            _id,
            name: "StoreAccess",
            role : "store",
            TSTC: this.getSecret(),
            type: "AC"
        };

        const token = jwt.sign(this.payload,process.env.JWT_GLOBAL_SECRET ,{expiresIn:this.ex} );
       
        console.log("The Store Access Token Is\n",token);
        return token;

    }

//Verify Method
    verify(DecodedPayLoad){
        return (DecodedPayLoad.TSTC === this.getSecret());
    }

}

module.exports={ BuyerAccess , BuyerRefresh , StoreAccess , StoreRefresh };