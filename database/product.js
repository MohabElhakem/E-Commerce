const mongoose = require('mongoose');

const categories = {

    "Electronics" :["Phones","Laptops","Cameras"],
    "Fashion":["Men","Women","kids"],
    "Health & Beauty":["Skin care", "Hair care","Makeup","Fragrance","Personal care","Health"],
    "Home & Furniture":["Rooms","Office","Storage","Decor","Kitchen"],
    "Grocery & Food":["Meat","Seafood","Dariy","Pantry","Frozen","Snacks","Beverages","Breakfast","Organic","Baby","Essentials"],
    "Fitness & Outdoors":["Exercises","Sportswear","Adventure","Team","Cycling","Water","Winter","Hunting"],
    "Books & entertainment" :["Books","Magazines","Movies","Music","Games","Art","Educational"],
    "Jewelry & Luxury":["Jewelry","Accessories","Fashion"],
    "Automobiles":["Vehicles","Parts","Electronics","Maintenance","Interior","Exterior","Equipment"],
    
}

const productSchema = mongoose.Schema({

    name: {
        type: String,
        required : true,
        index: true
    },
    storeName:{
        type: String,
        required: true,
        index: true
    },
    sellerId:{
        type: mongoose.Types.ObjectId,
        required: false,
        index:true
    },
    price:{
        type:Number,
        required:true,
        default:0
    },
    description:{
        type: String
    },
    category:{
        type:String,
        enum:Object.keys(categories),
        required: true
    },
    subcategory:{
        type:String,
        validate:{
            validator: function(value){
              return  categories[this.category].includes(value)
            },
            message : props=> `${props.value} is not a valid subcategory of ${props.instance.category}`
        }
    },
    inStock:{
        type: Boolean,
        required: true,
        default : true,
    }
    //#region 
    //key concepts▼
    // if you have an object of keys and value then object[key] means The Value
    //in the categories object if i said categories["Fashion"].include("books") is the same as
    // ["men","women","kids"].include(books)
    //and its false 
    //this.category means to but the category name of this instance of the document
    //validate in an option that every field could have in mongo
})
const product = mongoose.model('product',productSchema);
module.exports= product;