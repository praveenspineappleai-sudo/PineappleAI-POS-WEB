//path: Controllers/publicBillController.js
// Public Bill Controller: View Bill as PDF
const { CashierOrder, CashierProduct, Customer, BusinessDetail, OwnerDetail, CashierPrice, CashierBill } = require('../models');
const { generateBillPDF } = require('../services/billService');
const fs = require('fs');

exports.viewBill = async (req, res) => {
    try {
        const { order_no } = req.params;
        const width = req.query.width ? parseInt(req.query.width) : 80;

        // 1. Find the Bill (Summary)
        const bill = await CashierBill.findOne({
            where: { order_no }
        });

        if (!bill) {
            return res.status(404).send("Bill not found");
        }

        // 2. Find all Order items for this order_no
        const orders = await CashierOrder.findAll({
            where: { order_no },
            include: [
                {
                    model: Customer,
                    as: 'customer'
                },
                {
                    model: CashierPrice,
                    as: 'price',
                    include: [
                        {
                            model: CashierProduct,
                            as: 'product',
                            attributes: ['name']
                        }
                    ]
                }
            ]
        });

        if (orders.length === 0) {
            return res.status(404).send("Order items not found");
        }

        const firstOrder = orders[0];
        const business = await BusinessDetail.findOne(); 
        const owner = business ? await OwnerDetail.findByPk(business.owner_id) : null;

        
        
        // 3. Prepare bill data for PDF generator
        const billData = {
            bill_id: bill.id,
            order_no: order_no,
            order_date: bill.createdAt,
            customer_name: firstOrder.customer ? firstOrder.customer.name : "Guest",
            customer_email: firstOrder.customer ? firstOrder.customer.email : "",
            customer_phone: firstOrder.customer ? firstOrder.customer.phone_no : "",
            cashier_name: bill.cashier_name || "Cashier", 
            business_name: business ? business.name : "POS System",
            business_address: business ? business.address : "",
            owner_phone: owner ? owner.phone_number : "",
            total_price: parseFloat(bill.total_price),
            discounted_price: parseFloat(bill.discounted_price),
            paid_amount: parseFloat(bill.paid_amount || 0), // Defaulting to price if not in bill record
            discounting_percentage: parseFloat(bill.discounting_percentage),
            discounting_price: parseFloat(bill.discounting_price),
            products: orders.map(o => ({
                product_name: o.price?.product?.name || "Item",
                ordered_quantity: o.ordered_quantity,
                unit_price: parseFloat(o.price?.selling_price || 0),
                ordered_total_price: parseFloat(o.ordered_total_price)
            }))
        };
        
        const pdfPath = await generateBillPDF(billData, width);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=bill_${order_no}.pdf`);
        
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);
        
        fileStream.on('finish', () => {
             // fs.unlink(pdfPath, () => {}); 
        });

    } catch (error) {
        console.error("Error viewing bill:", error);
        res.status(500).send("Error generating bill: " + error.message);
    }
};
