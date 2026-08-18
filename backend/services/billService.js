//path: services/billService.js
// Bill Service: Generate PDF Bill and Send Email
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate PDF Bill in Receipt Style
const generateBillPDF = async (billData, width_mm = 80) => {
  return new Promise((resolve, reject) => {
    // DEBUG CHECK
    console.log("Products received:", billData.products);
    console.log("Product count:", billData.products.length);
    // Convert mm to points (1mm = 2.83465 points)
    const width_pt = width_mm * 2.83465;
    
    // Estimate height
    // Header: ~80pt, Items: ~35pt per item, Footer/Totals: ~120pt
    const estimatedHeight = 120 + (billData.products.length * 60);
    
    const doc = new PDFDocument({ 
      margin: 8,
      size: [width_pt, estimatedHeight] 
    });
    
    const fileName = `bill_${billData.bill_id}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../temp', fileName);

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const leftMargin = 8;
    const pageWidth = width_pt;
    const contentWidth = pageWidth - 16;
    const centerX = pageWidth / 2;

    const drawDottedLine = () => {
      doc
        .fontSize(8)
        .font('Courier')
        .text('------------------------------------------', leftMargin, doc.y, { width: contentWidth, align: 'center' });
      doc.moveDown(0.1);
    };

    // --- Header ---
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(billData.business_name || "PAI FOOD CITY", 0, 10, {
        width: pageWidth,
        align: 'center'
      });

    doc.moveDown(0.2);

    doc
      .fontSize(8)
      .font('Helvetica')
      .text(billData.business_address || "Business Address", 0, doc.y, {
        width: pageWidth,
        align: 'center'
      });

    doc
      .fontSize(8)
      .text(billData.owner_phone || "077xxxxxxx", 0, doc.y, {
        width: pageWidth,
        align: 'center'
      });

    doc.moveDown(0.2);
    drawDottedLine();

    // --- Meta Info ---
    const date = new Date(billData.order_date).toLocaleDateString('en-GB');
    const time = new Date(billData.order_date).toLocaleTimeString('en-GB', { hour12: false });

    doc.fontSize(8).font('Helvetica');

    const line1Y = doc.y;
    doc.text(date, leftMargin, line1Y);
    doc.text(time, leftMargin, line1Y, { width: contentWidth, align: 'right' });

    doc.moveDown(0.2);

    const line2Y = doc.y;
    doc.text(`Cashier: ${billData.cashier_name || "Staff"}`, leftMargin, line2Y);
    doc.text(`No: ${billData.order_no}`, leftMargin, line2Y, { width: contentWidth, align: 'right' });

    doc.moveDown(0.3);
    drawDottedLine();

    // Column positions for 80mm receipt
    const itemX = leftMargin;
    const qtyX = 110;
    const priceX = 145;
    const amountX = 180;

    const itemWidth = 105;
    const qtyWidth = 20;
    const priceWidth = 35;
    const amountWidth = 35;

    // --- Item Header ---
    doc.font("Helvetica-Bold").fontSize(8);

    const headerY = doc.y;

    doc.text("ITEM", itemX, headerY, { width: itemWidth });
    doc.text("QTY", qtyX, headerY, { width: qtyWidth, align: "right" });
    doc.text("PRICE", priceX, headerY, { width: priceWidth, align: "right" });
    doc.text("AMT", amountX, headerY, { width: amountWidth, align: "right" });

    doc.moveDown(0.3);

    // --- Items ---
    doc.font("Helvetica").fontSize(8);

    billData.products.forEach((item) => {

    const startY = doc.y;

    // ITEM NAME
    doc.text(item.product_name, itemX, startY, {
       width: itemWidth
    });

    const endY = doc.y;

    // QTY
    doc.text(
       item.ordered_quantity.toString(),
       qtyX,
       startY,
       { width: qtyWidth, align: "right" }
    );

    // PRICE
    doc.text(
       item.unit_price.toFixed(2),
       priceX,
       startY,
       { width: priceWidth, align: "right" }
    );

    // AMOUNT
    doc.text(
       item.ordered_total_price.toFixed(2),
       amountX,
       startY,
      { width: amountWidth, align: "right" }
    );

    doc.y = endY + 4;

   });





    

    // --- Totals (Net Only) ---
    drawDottedLine();

    const drawRow = (label, value, bold = false, size = 9) => {
    const y = doc.y;

    doc
       .fontSize(size)
       .font(bold ? 'Helvetica-Bold' : 'Helvetica');

    doc.text(label, leftMargin, y);

    doc.text(
       value,
       leftMargin,
       y,
       { width: contentWidth, align: 'right' }
    );

     doc.moveDown(0.2);
   };

   // Subtotal
   drawRow('Sub Total', billData.total_price.toFixed(2));

   // Discount
   if (billData.discounting_price > 0) {
  drawRow('Discount', billData.discounting_price.toFixed(2));
   }

   // Net Total
   drawRow('Net Total', billData.discounted_price.toFixed(2), true, 11);

   drawDottedLine();


    

    // Payment Info
    const paidAmount = billData.paid_amount || billData.discounted_price;
    const balance = paidAmount - billData.discounted_price;
    
    drawRow('CASH', paidAmount.toFixed(2), false, 8);
    drawRow('BALANCE', balance.toFixed(2), false, 8);

    doc.moveDown(0.5);

    // --- Footer ---
    doc
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text('Thank you for shopping with us!', 0, doc.y, {
        width: pageWidth,
        align: 'center'
      });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', (err) => reject(err));
  });
};

// Send Bill Email
const sendBillEmail = async (transporter, customerEmail, customerName, billPdfPath, billData) => {
  const mailOptions = {
    from: billData.business_name ? `"${billData.business_name}" <${process.env.EMAIL_USER}>` : process.env.EMAIL_USER,
    to: customerEmail,
    subject: `Invoice #${billData.bill_id} - ${billData.business_name || 'Store'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
          <h2 style="margin: 0;">Invoice from ${billData.business_name}</h2>
        </div>
        
        <div style="border: 1px solid #ddd; border-top: none; padding: 20px; border-radius: 0 0 5px 5px;">
          <p>Dear <strong>${customerName}</strong>,</p>
          <p>Thank you for your order! Please find attached your invoice.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Invoice Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0;"><strong>Invoice Number:</strong></td>
                <td style="padding: 5px 0;">#${billData.bill_id}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Order Number:</strong></td>
                <td style="padding: 5px 0;">#${billData.order_no}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Date:</strong></td>
                <td style="padding: 5px 0;">${new Date(billData.order_date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Cashier:</strong></td>
                <td style="padding: 5px 0;">${billData.cashier_name || 'Staff'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0;"><strong>Subtotal:</strong></td>
                <td style="padding: 5px 0;">Rs.${(billData.total_price || 0).toFixed(2)}</td>
              </tr>
              ${billData.discounting_percentage > 0 ? `
              <tr>
                <td style="padding: 5px 0;"><strong>Discount (${billData.discounting_percentage.toFixed(0)}%):</strong></td>
                <td style="padding: 5px 0; color: red;">-Rs.${billData.discounting_price.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 2px solid #4CAF50;">
                <td style="padding: 10px 0 5px 0;"><strong>Total Amount:</strong></td>
                <td style="padding: 10px 0 5px 0; font-size: 18px; color: #4CAF50;"><strong>Rs.${billData.discounted_price.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
          
          <p>If you have any questions regarding this invoice, please don't hesitate to contact us.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p style="margin: 5px 0;"><strong>${billData.business_name}</strong></p>
            <p style="margin: 5px 0;">${billData.business_address}</p>
            <p style="margin: 5px 0;">${billData.owner_phone}</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 11px;">
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </div>
    `,
    attachments: [{
      filename: `Invoice_${billData.bill_id}.pdf`,
      path: billPdfPath,
    }],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  } finally {
    if (fs.existsSync(billPdfPath)) {
      try {
        fs.unlinkSync(billPdfPath);
      } catch (err) {
        console.error('Error deleting temp PDF:', err);
      }
    }
  }
};

// Main function
const generateAndSendBill = async (transporter, billData) => {
  try {
    const customerEmail = String(billData.customer_email || '').trim();
    if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      console.log('Skipping bill email because no valid customer email was provided.');
      return { success: false, skipped: true, reason: 'No valid customer email' };
    }
    
    console.log('Generating PDF bill...');
    const billPdfPath = await generateBillPDF(billData);
    console.log('PDF generated at:', billPdfPath);
    
    console.log('Sending email to:', customerEmail);
    const result = await sendBillEmail(
      transporter,
      customerEmail,
      billData.customer_name,
      billPdfPath,
      billData
    );
    console.log('Email sent successfully');

    return result;
  } catch (error) {
    console.error('Error generating/sending bill:', error);
    throw error;
  }
};

module.exports = { generateAndSendBill, generateBillPDF };