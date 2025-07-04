const db = require('../config/db');
const axios = require('axios');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Easebuzz Configuration
const MERCHANT_KEY = 'BVK2USG0F';
const SALT = '1VQG8FZKL';
const BASE_URL = 'https://testpay.easebuzz.in';

// Razorpay Configuration
const razorpayInstance = new Razorpay({
    key_id: 'rzp_test_uEJqigl3qciRzl',
    key_secret: 'AQuAu2XheFj6JHLQrozGiRbg' 
});

// Function to generate hash for Easebuzz
function generateHash({ txnid, amount, productinfo, firstname, email }) {
    const hashString = `${MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${SALT}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
}

exports.createOrder = async (req, res) => {
    const { userId, billingDetails, cartItems, paymentMethod, totalAmount } = req.body;

    const txnId = 'TXN' + Date.now();
    const productinfo = 'Product Name';

    const surl = `http://localhost:4200/paysucess?txnid=${txnId}&totalAmount=${totalAmount}&status=success`;
    const furl = `http://localhost:4200/payfail?txnid=${txnId}&totalAmount=${totalAmount}&status=failure`;

    try {
        // Step 1: Insert order
        const [orderResult] = await db.query(
            'INSERT INTO orders (user_id, total_amount, payment_method, payment_status) VALUES (?, ?, ?, ?)',
            [userId, totalAmount, paymentMethod, 'Pending']
        );
        const orderId = orderResult.insertId;

        // Step 2: Insert billing details
        await db.query(
            'INSERT INTO order_billing_details (order_id, full_name, email, phone, shipping_address) VALUES (?, ?, ?, ?, ?)',
            [
                orderId,
                billingDetails.fullName,
                billingDetails.email,
                billingDetails.phone,
                billingDetails.shippingAddress
            ]
        );

        // Step 3: Insert order items
        for (let item of cartItems) {
            await db.query(
                'INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.title, item.quantity, item.price]
            );
        }

        // Step 4: Handle Payment Gateway Based on Selected Method
        const payment = paymentMethod.toLowerCase();

        if (payment === 'easebuzz') {
            const paymentParams = {
                key: MERCHANT_KEY,
                txnid: txnId,
                amount: totalAmount,
                firstname: billingDetails.fullName,
                email: billingDetails.email,
                phone: billingDetails.phone,
                productinfo: productinfo,
                surl: surl,
                furl: furl,
                udf1: '',
                udf2: '',
                udf3: '',
                udf4: '',
                udf5: ''
            };

            const hash = generateHash({
                txnid: txnId,
                amount: totalAmount,
                productinfo,
                firstname: billingDetails.fullName,
                email: billingDetails.email
            });

            const formData = new URLSearchParams();
            Object.entries({ ...paymentParams, hash }).forEach(([key, value]) => formData.append(key, value));

            const response = await axios.post(`${BASE_URL}/payment/initiateLink`, formData.toString(), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (response.data.status === 1 && response.data?.data) {
                await db.query(
                    'INSERT INTO payments (order_id, txnid, amount, status, access_key) VALUES (?, ?, ?, ?, ?)',
                    [orderId, txnId, totalAmount, 'initiated', response.data.data]
                );

                res.status(201).json({
                    orderId,
                    txnId,
                    gateway: 'easebuzz',
                    access_key: response.data.data,
                    message: 'Easebuzz payment link generated successfully'
                });
            } else {
                console.error('Easebuzz Token Not Generated:', response.data);
                res.status(500).json({ error: 'Easebuzz payment token not generated.', details: response.data });
            }
        } else if (payment === 'razorpay') {
            const razorpayOrder = await razorpayInstance.orders.create({
                amount: totalAmount * 100, // Amount in paise
                currency: 'INR',
                receipt: txnId,
                notes: {
                    productinfo: productinfo,
                    firstname: billingDetails.fullName,
                    email: billingDetails.email,
                    phone: billingDetails.phone
                }
            });

            if (razorpayOrder && razorpayOrder.id) {
                await db.query(
                    'INSERT INTO payments (order_id, txnid, amount, status, access_key) VALUES (?, ?, ?, ?, ?)',
                    [orderId, txnId, totalAmount, 'initiated', razorpayOrder.id]
                );

                res.status(201).json({
                    orderId,
                    txnId,
                    gateway: 'razorpay',
                    razorpayOrderId: razorpayOrder.id,
                    amount: razorpayOrder.amount,
                    currency: razorpayOrder.currency,
                    message: 'Razorpay order generated successfully'
                });
            } else {
                console.error('Razorpay Order Not Created:', razorpayOrder);
                res.status(500).json({ error: 'Razorpay order not created.', details: razorpayOrder });
            }
        } else {
            res.status(400).json({ error: 'Invalid payment method selected.' });
        }
    } catch (error) {
        console.error('Order Creation Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Order creation failed', details: error.response?.data || error.message });
    }
};
// Payment Status Update API
exports.updatePaymentStatus = async (req, res) => {
    const { paymentMethod, txnid, razorpay_order_id, razorpay_payment_id, razorpay_signature, status } = req.body;

    try {
        if (paymentMethod.toLowerCase() === 'razorpay') {
            // Razorpay Signature Verification
            const generatedSignature = crypto.createHmac('sha256', razorpayInstance.key_secret)
                .update(razorpay_order_id + '|' + razorpay_payment_id)
                .digest('hex');

            if (generatedSignature === razorpay_signature && status === 'success') {
                // Success Case
                await db.query('UPDATE payments SET payment_id = ?, status = ? WHERE txnid = ?', [
                    razorpay_payment_id, 'success', txnid
                ]);
                await db.query('UPDATE orders SET payment_status = ? WHERE id = (SELECT order_id FROM payments WHERE txnid = ?)', [
                    'Paid', txnid
                ]);

                return res.json({ message: 'Payment Successful' });
            } else {
                // Failure Case
                await db.query('UPDATE payments SET payment_id = ?, status = ? WHERE txnid = ?', [
                    razorpay_payment_id, 'failed', txnid
                ]);
                await db.query('UPDATE orders SET payment_status = ? WHERE id = (SELECT order_id FROM payments WHERE txnid = ?)', [
                    'Failed', txnid
                ]);

                return res.status(400).json({ message: 'Payment Failed or Verification Failed' });
            }

        } else if (paymentMethod.toLowerCase() === 'easebuzz') {
            // For Easebuzz, you receive status directly (success, failure, pending)
            await db.query('UPDATE payments SET status = ? WHERE txnid = ?', [
                status.toLowerCase(), txnid
            ]);

            await db.query('UPDATE orders SET payment_status = ? WHERE id = (SELECT order_id FROM payments WHERE txnid = ?)', [
                status.toLowerCase() === 'success' ? 'Paid' : (status.toLowerCase() === 'failure' ? 'Failed' : 'Pending'), txnid
            ]);

            return res.json({ message: `Payment ${status}` });
        } else {
            return res.status(400).json({ error: 'Invalid payment method' });
        }
    } catch (error) {
        console.error('Payment Status Update Error:', error.message);
        res.status(500).json({ error: 'Payment status update failed' });
    }
};
