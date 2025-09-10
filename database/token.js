const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    holder_id :{ 
        type : mongoose.Types.ObjectId,
        required : true ,
        index: true,
    },
    status: {
        type: String,
        enum: ["expired","panned","active"],
        default: "active"
    },
    Type:{
        type : String,
        enum :["store","buyer","admin"],
        required: true,
    },
    subType:{
        type: String,
        enum: ['BA' , 'BR','SA', 'SR'],
        required: true,
    },
    expiresAt:{
        type: Date,
        index: {expires:0} // <-- TTL ndex
    },
    token:{
        type:String,
        required: true,
        unique : true,
        index : true,
    }

})

const token = mongoose.Model('token',tokenSchema);
module.exports = token;