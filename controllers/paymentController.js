// const axios = require('axios');
// const db = require('../config/db');
// exports.createOrderAndGetAccessKey = async (req, res) => {
//   const { full_name, email, phone, shipping_address, amount, productinfo } = req.body;
//   try {
//     // Step 1: Save order in MySQL
//     const [orderResult] = await db.query(
//       'INSERT INTO order_billing_details (full_name, email, phone, shipping_address, payment_status) VALUES (?, ?, ?, ?, ?)',
//       [full_name, email, phone, shipping_address, 'pending']
//     );
//     const orderId = orderResult.insertId;
//     // Step 2: Create order on Easebuzz
//     const easebuzzPayload = {
//       amount,
//       txnid: 'ORDER_' + orderId, // Using your order ID as transaction ID
//       productinfo,
//       firstname: full_name,
//       email,
//       phone
//     };
//     const response = await axios.post('https://testpay.easebuzz.in/payment/initiateLink', easebuzzPayload, {
//       headers: {
//         Authorization: 'BVK2USG0F', // Replace with your actual API key
//         'Content-Type': 'application/json'
//       }
//     });
//     if (response.data.status === 1) {
//       const accessKey = response.data.data.access_key;
//       // Step 3: Save access_key in the correct table
//       await db.promise().query(
//         'UPDATE order_billing_details SET access_key = ? WHERE id = ?',
//         [accessKey, orderId]
//       );
//       return res.json({ order_id: orderId, access_key: accessKey });
//     } else {
//       return res.status(400).json({ message: 'Easebuzz order creation failed', details: response.data });
//     }
//   } catch (error) {
//     console.error('Server Error:', error);
//     return res.status(500).json({ message: 'Server error', error });
//   }
// };
