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
class BuyerT extends token {

    constructor(){
        //parent constructors 
        super( "4h"  ,  process.env.JWT_BUYER_TOKEN_SECRET  );
    }

//Create Method 
    create(username,email,_id){
        this.payload={
            username,
            email,
            _id,
            name: "buyer token",
            role: "buyer",
            TSTC: this.getSecret()
        };
        
        const token = jwt.sign(this.payload,process.env.JWT_GLOBAL_SECRET ,{expiresIn:this.ex});

        console.log("The Buyer Token Is\n",token);
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
class StoreRefreshT extends token {
    constructor(){
        //parent constructors
        super("180d", process.env.JWT_STORE_REFRESH_SECRET);
    }

//Create Method
    create(username,email,_id,type){
        this.payload={
            username,
            email,
            _id,
            name: "store refresh token",
            role : "store",
            TSTC: this.getSecret(),
            type,
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
class StoreAccessT extends token{
    constructor(){
        super("30m",process.env.JWT_STORE_ACCESS_SECRET);
    }
//Create Method
    create(username,email,_id,type){
        this.payload={
            username,
            email,
            _id,
            name: "store access token",
            role : "store",
            TSTC: this.getSecret(),
            type,
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