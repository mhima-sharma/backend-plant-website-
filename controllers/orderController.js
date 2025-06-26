const db = require('../config/db');
const axios = require('axios');

exports.createOrder = async (req, res) => {
    const { userId, billingDetails, cartItems, paymentMethod, totalAmount } = req.body;

    try {
        // Insert order
        const [orderResult] = await db.query('INSERT INTO orders (user_id, total_amount, payment_method, payment_status) VALUES (?, ?, ?, ?)', [userId, totalAmount, paymentMethod, 'Pending']);
        const orderId = orderResult.insertId;

        // Insert billing details
        await db.query('INSERT INTO order_billing_details (order_id, full_name, email, phone, shipping_address) VALUES (?, ?, ?, ?, ?)', [
            orderId, billingDetails.fullName, billingDetails.email, billingDetails.phone, billingDetails.shippingAddress
        ]);

        // Insert order items
        for (let item of cartItems) {
            await db.query('INSERT INTO order_items (order_id, product_name, quantity, price) VALUES (?, ?, ?, ?)', [
                orderId, item.name, item.quantity, item.price
            ]);
        }

        res.status(201).json({ orderId, message: 'Order created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.initiatePayment = async (req, res) => {
    const { orderId, totalAmount, customer } = req.body;

    try {
        const response = await axios.post('https://pay.easebuzz.in/payment/initiateLink', {
            key: 'BVK2USG0F',
            txnid: `TXN${orderId}`,
            amount: totalAmount,
            firstname: customer.fullName,
            email: customer.email,
            phone: customer.phone,
            productinfo: 'Plant Order',
            surl: 'http://localhost:3000/api/orders/payment-success',
            furl: 'http://localhost:3000/api/orders/payment-failure'
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment initiation failed' });
    }
};

exports.paymentSuccess = async (req, res) => {
    const { txnid } = req.body;
    const orderId = txnid.replace('TXN', '');

    await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', ['Paid', orderId]);

    res.send('Payment successful. Order updated.');
};

exports.paymentFailure = async (req, res) => {
    const { txnid } = req.body;
    const orderId = txnid.replace('TXN', '');

    await db.query('UPDATE orders SET payment_status = ? WHERE id = ?', ['Failed', orderId]);

    res.send('Payment failed. Order updated.');
};
