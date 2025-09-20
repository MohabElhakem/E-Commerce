const path = require('path');
const user = require(path.join(__dirname,'..','database','user.js'));
const product = require(path.join(__dirname,'..','database','product.js'));

const newProduct = async(req,res)=>{

    try {
        //first take the infos of the product and make sure they are all there
        const {name,storeName,price,category,subcategory} = req.body;
        if (!name||!storeName||!price||!category||!subcategory){
            const error = new Error ("the information needed for the produvt is lacking");
            error.code = 400;
            throw error;
        }
    
        //all okay make the new product in the database
        const productDB = await product.create({
            name,
            storeName,
            sellerId : req.userPayload._id,
            price,
            category,
            subcategory
        });
        console.log('✅product in the DB')
        return res.status(201).json({
            message: "new product has been proccessed successfully" ,
            product_infos: productDB
        });
    } catch (error) {
        console.log(error.stack);
        return res.status(error.code || 500).json({
            name: error.name,
            message: error.message,
            code: error.code,
            errors: error.errors || undefined,
            keyValue: error.keyValue
        })
    }
}
///
///
///
///
///
///
///
const deletePoduct = async (req, res)=>{

    try {
        const productId_ToDelete = req.params._id;
        //take the product from the database to check if its his
    
        const productDB = await product.findById(productId_ToDelete);
        if (!productDB) {
            const error = new Error("Product not found");
            error.code = 404;
            throw error;
        }
        if(productDB.sellerId.toString() !== req.userPayload._id){
            const error = new Error('💀 Not your product to delete');
            error.code = 403;
            throw error;
        }
    
        //if its him delte it 
        await product.deleteOne({_id : productId_ToDelete})
        console.log("✅ the product has been deleted from the DB")
        return res.status(200).json({message : "Deleted Successfully"});
    } catch (error) {
        console.log(error.stack);
        return res.status(error.code|| 500 ).json({
            name: error.name,
            message: error.message,
            code:error.code,
            keyValue : error.keyValue,
            errors: error.errors || undefined
        })
    }

}
///
///
///
///
///
///
const updateProduct = async(req , res)=>{
    try {
        const updateList = [ "name", "price" , "description" ,"inStock" ]
        const ID = req.params.product_id;
    
        //see if he have invalied input or none at all
        if(!Object.keys(req.body).every(field=> updateList.includes(field)
            && req.body[field] !== null 
            && req.body[field] !== undefined
            && req.body[field] !== "")){
            const error = new Error("invalid field to update or none at all");
            error.code = 400;
            throw error
        }
    
        //take the product from the DB
        const productDB = await product.findById(ID);
        if(!productDB){
            const error = new Error("you dont have a product with that id");
            error.code = 400;
            throw error
        }
    
        //check if the id in the token is the same in the product holderID
        if(req.userPayload._id !== productDB.sellerId.toString()){
            const error = new Error("its not your Product to change!!!!!!!!!!!!");
            error.code= 403;
            throw error
        }
    
        //update the things you want to update
        Object.keys(req.body).forEach(field=>{
            if (updateList.includes(field)){
                productDB[field]= req.body[field];
            }
        });
        await productDB.save();
    
        return res.status(200).json({message: "✅Proudct have been updated successfully"});
    } catch (error) {
        console.log(error.stack);
        return res.status(error.code || 500).json({
            name : error.name,
            message : error.message,
            code: error.code,
            keyValue: error.keyValue,
            errors: error.errors || undefined
        })
    }

}
///
///
///
///
///
///
///
const HomePage = async (req , res)=>{

    try {
        const {sellerId} = req.params;
        const { page , limit } = req.query; 
        const pageNum = parseInt(page)|| 1;
        const limitNum = parseInt(limit)|| 10;
    
        if(!sellerId){
            const error = new Error("missing information in the url .......");
            error.code = 400;
            throw error
        }
    
        const skip = (pageNum - 1) * limitNum;
    
        const [products , total ] = await Promise.all([
            product.find({sellerId}).skip(skip).limit(limitNum),
            product.countDocuments({sellerId})
        ])
    
        return res.status(200).json({
            page: pageNum,
            totalPages : Math.ceil(total/limitNum),
            totalProducts: total,
            products
            })
    } catch (error) {
        console.log(error.stack);
        return req.status(error.code || 500).json({
            name : error.name,
            message: error.message,
            code: error.code,
            errors: error.errors || undefined,
            keyValue: error.keyValue
        })
    }

}