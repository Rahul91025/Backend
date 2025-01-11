import userModel from "../models/userModel.js";

 

 //add product to user cart
 const addToCart = async (req,res)=>{
    try{
        const {userId, itemId, size } = req.body;

        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;

        if(cartData[itemId]){
            if(cartData[itemId][size]){
                cartData[itemId][size] += 1;
            }
            else{
                cartData[itemId][size] = 1;
            }

        }
        else{
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, {cartData} );

        res.json({success:true ,message: "Product added to cart successfully"});
         
    }catch(error){
      console.error(error);
      res.status(500).json({success:false ,message: error.message});
   

 }
  
}

 //update user cart
 const updateCart = async (req,res)=>{
    try{
        const {userId, itemId, size, quantity } = req.body;
        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;

        cartData[itemId][size] = quantity

        await userModel.findByIdAndUpdate(userId, {cartData} );

        res.json({success:true ,message: "Cart updated successfully"});
        
        
    }
    catch(error){
      console.error(error);
      res.status(500).json({success:false ,message: error.message});
    }


 }

 //get user cart data
 // Get user cart data
// Get user cart data
const getUserCart = async (req, res) => {
    try {
      const { userId } = req.query; // Get userId from query params
  
      // Validate required fields
      if (!userId) {
        return res.status(400).json({ success: false, message: "Missing userId" });
      }
  
      const userData = await userModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const cartData = userData.cartData || {}; // Ensure cartData exists
  
      res.json({ success: true, cartData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  

 export {addToCart, updateCart, getUserCart};