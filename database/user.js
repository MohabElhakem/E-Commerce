const mongoose = require('mongoose');

// Base schema shared by all the users
const options = {discriminatorKey : "role" , collection : "users"};
const userSchema = mongoose.Schema({

    username:{
        type : String,
        unique : true,
        required : true,
        minlength : 4,
        index : true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password:{
        type: String,
        required: true
    },
    isBanned:{
        type : Boolean,
        default: false
    },
    attempts:{
        type : Number,
        default : 0
    },
    banEx:{
        type : Date,
        defult : null
    }

}, options);
// Base model
const user = mongoose.model("user",userSchema);




//Now start on the specialized schemas Here ▼

// ► Buyer Schema 
const buyerSchema = mongoose.Schema({
    cart : [
        {
            productId: {type: mongoose.Schema.Types.ObjectId, ref : "product"},
            quantity : {type: Number, default : 1}
        }
    ],
    wishlist : [{type:mongoose.Schema.Types.ObjectId, ref : "product" }],
    address :[{
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String, required: true },
        phoneNumber: { type: String },
        isDefault: { type: Boolean, default: false }
    }]
});

const buyer = user.discriminator("buyer",buyerSchema);



// ► Store Schema 
const storeSchema = mongoose.Schema({

    products : [
        { type: mongoose.Schema.Types.ObjectId, ref: "Product" }
    ],
    balance : {
        type : Number,
         default : 0
    },// seller wallet in teh platform 
    totalRevenue:{
        type : Number,
        default : 0 
    },
    rating : {
        type : Number,
        default : 0
    },
    customerServices:{
        type: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    isVerified:{
        type: Boolean,
        default : false
    }

});

const store = user.discriminator("store",sellerSchema);

module.exports = {buyer , store};