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
const updateProduct = async()=>{}