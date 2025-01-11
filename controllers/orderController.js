
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from  'stripe'
import razorpay from 'razorpay';

//global variables
const currency = 'In'
const deliveryCharge = 10;



// gateway Intilizes

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const razorpayInstance = new razorpay({
  key_id: process.env.RAZARPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})



//Placing Order on COD

const placeOrder = async (req, res) => {
    try {
      const { userId, items, amount, address } = req.body;
  
      
      if (!userId || !items || !amount || !address) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
  
      const orderData = {
        userId,
        items,
        address,
        amount,
        paymentMethod: "COD",
        payment: false,
        date: Date.now(),
      };
  
      const newOrder = new orderModel(orderData);
      await newOrder.save();
  
      
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
  
      res.json({ success: true, message: "Order placed successfully" });
    } catch (error) {
      console.error(error); 
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  };

//placing orders using Stripe Methods

const placeOrderStripe = async (req,res)=>{
  try {


    const { userId, items, amount, address } = req.body;
    const {origin} = req.headers;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item)=>({
        price_data: {
          currency: currency,
          product_data: {
            name: item.name
            
            },
            unit_amount: item.price * 100,
        },
        quantity: item.quantity
    }))


    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: 'Delivery Fee'
          
          },
          unit_amount: deliveryCharge * 100,
      },
      quantity: 1 

    })

    const session = await stripe.checkout.sessions.create({ 
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`, 
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: 'payment'

    })


    res.json({ success: true, session_url: session.url });



    
   

    

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
    
  }

}

//verify Stripe
const verifyStripe = async (req,res)=>{
  const {orderId, success, userId} = req.body;

  try {

    if(success === "true"){
      await orderModel.findByIdAndUpdate(orderId,{payment:true});
      await userModel.findByIdAndUpdate(userId,{cartData:{}})
      
      res.json({ success: true, message: "Payment Successful" });


    }
    else{
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Payment Failed" });
    }

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
    
  }

}


// placing orders using Razorpay Method

const placeOrderRazorpay = async (req,res)=>{
  try {

    const { userId, items, amount, address } = req.body;
    

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };
    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount*100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
     
    }

    await razorpayInstance.orders.create(options, (error,order)=>{
      if(error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Failed to create Razorpay Order" });
      }
      res.json({ success: true, order });

    })




    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });

    
  }


}



//verify Razorpay

const verifyRazorpay = async (req,res)=>{
   try {

   const {userId, razorpay_order_id} = req.body;
   const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
   if(orderInfo.status === 'paid'){
    await orderModel.findByIdAndUpdate(orderInfo.receipt, {payment: true});
    await userModel.findByIdAndUpdate(userId, {cartData: {}});
    res.json({ success: true, message: "Payment Successful" });
   }
   else{
    await orderModel.findByIdAndDelete(orderInfo.receipt);
    res.json({ success: false, message: "Payment Failed" });
   }

 
    
   } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Server Error", error: error.message });
    
   }

}







//All Orders data for Admin Panel

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    // Fetch orders from the database
    const orders = await orderModel.find({});
    
    // Filter out cancelled orders and delete them
    for (const order of orders) {
      if (order.status === "Cancelled") {
        await orderModel.findByIdAndDelete(order._id);
      }
    }

    // Fetch the remaining orders after deleting cancelled ones
    const updatedOrders = await orderModel.find({});

    res.json({ success: true, orders: updatedOrders });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


//User Order Data for Frontend

const userOrders = async (req, res) => {
    try {
        // Check if the userId exists and is valid (can be from a JWT token or other secure source)
        const userId = req.body.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        

        // Fetch orders from the database
        const orders = await orderModel.find({ userId });

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: "No orders found for this user" });
        }

        res.json({ success: true, orders });

    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

//update order status from Admin panel
const updateStatus = async(req,res)=>{
  try {
    
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, {status});
    res.json({success: true, message: "Order status updated successfully"});
 
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
    
  }

}



 const cancelOrder = async (req, res) => {
   try {
     const { orderId } = req.params; 
     const order = await orderModel.findById(orderId);

     if (!order) {
       return res
         .status(404)
         .json({ success: false, message: "Order not found" });
     }

     if (order.status === "Cancelled") {
       await orderModel.findByIdAndDelete(orderId);
       return res
         .status(400)
         .json({ success: false, message: "Order already cancelled" });
     }

     // Update order status to "Cancelled"
     order.status = "Cancelled";
     await order.save();

     res.json({ success: true, message: "Order cancelled successfully" });
   } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Server error" });
   }
 };



export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay,
  cancelOrder,
};

