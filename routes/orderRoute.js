import express from 'express';
import {placeOrder, placeOrderStripe,placeOrderRazorpay,allOrders,userOrders,updateStatus, verifyStripe, verifyRazorpay, cancelOrder,  } from  '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'



const orderRouter = express.Router();

//Admin Features
orderRouter.post('/list',allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.delete("/cancel/:orderId", cancelOrder);

//Payments Features
orderRouter.post('/place',authUser, placeOrder);
orderRouter.post('/stripe',authUser,placeOrderStripe);
orderRouter.post('/razorpay',authUser,placeOrderRazorpay);

//User Features
orderRouter.post('/userorders',authUser,userOrders);

//verify payment
orderRouter.post('/verifyStripe',authUser,verifyStripe)
orderRouter.post('/verifyRazorpay',authUser,verifyRazorpay)


export default orderRouter;





