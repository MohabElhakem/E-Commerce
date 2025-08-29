const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    holder_id :{ 
        type : mongoose.Types.ObjectId,
        required : true 
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
    expiresAt:{
        type: Date,
        index: {expires:0} // <-- TTL ndex
    },
    token:{
        type:String,
        required: true,
        unique : true
    }

})

const token = mongoose.Model('token',tokenSchema);
module.exports = token;