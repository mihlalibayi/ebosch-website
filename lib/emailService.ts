import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'members.ebosch@gmail.com',
    pass: process.env.GMAIL_PASSWORD || 'pwsk ztza ipow vmoi'
  }
});

interface ReceiptData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: 'pickup' | 'delivery' | 'digital';
  deliveryAddress?: string;
  paymentMethod: 'payfast' | 'bank_transfer';
  date: string;
}

interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  businessName?: string;
  date: string;
  isTransportInvoice?: boolean;
  transportCost?: number;
}

export async function sendReceipt(data: ReceiptData): Promise<boolean> {
  try {
    const itemsHtml = data.items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R${item.price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #2d5016; margin-bottom: 15px; border-bottom: 2px solid #2d5016; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .summary { margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .summary-row.total { font-size: 18px; font-weight: bold; color: #2d5016; border-top: 2px solid #2d5016; padding-top: 10px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Order Receipt</h1>
            <p>Order #${data.orderId}</p>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <p><strong>Name:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Order Date:</strong> ${data.date}</p>
          </div>

          <div class="section">
            <div class="section-title">Items Ordered</div>
            <table>
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Delivery Information</div>
            <p><strong>Delivery Type:</strong> ${data.deliveryType === 'pickup' ? 'Pickup' : data.deliveryType === 'delivery' ? 'Delivery' : 'Digital'}</p>
            ${data.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>` : ''}
          </div>

          <div class="section">
            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>R${data.subtotal.toFixed(2)}</span>
              </div>
              ${data.deliveryFee > 0 ? `
                <div class="summary-row">
                  <span>Delivery Fee:</span>
                  <span>R${data.deliveryFee.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="summary-row total">
                <span>Total Paid:</span>
                <span>R${data.total.toFixed(2)}</span>
              </div>
              <div class="summary-row" style="margin-top: 15px; font-size: 14px;">
                <span>Payment Method:</span>
                <span>${data.paymentMethod === 'payfast' ? 'PayFast' : 'Bank Transfer'}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for your purchase! If you have any questions, please contact us.</p>
            <p>e'Bosch - Community | Heritage | Leadership</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: 'members.ebosch@gmail.com',
      to: data.customerEmail,
      subject: `Order Receipt #${data.orderId}`,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Error sending receipt:', error);
    return false;
  }
}

export async function sendInvoice(data: InvoiceData): Promise<boolean> {
  try {
    const itemsHtml = data.items
      .map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const isTransport = data.isTransportInvoice;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #2d5016; margin-bottom: 15px; border-bottom: 2px solid #2d5016; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .summary { margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .summary-row.total { font-size: 18px; font-weight: bold; color: #2d5016; border-top: 2px solid #2d5016; padding-top: 10px; }
          .payment-info { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${isTransport ? '🚚 Delivery Invoice' : '📋 Order Invoice'}</h1>
            <p>Invoice #${data.orderId}</p>
          </div>

          ${isTransport ? `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #2196F3;">
              <p style="margin: 0; font-size: 14px;"><strong>Please pay the transport fee below to complete your delivery.</strong></p>
            </div>
          ` : `
            <div class="section">
              <div class="section-title">Order Details</div>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>Date:</strong> ${data.date}</p>
            </div>
          `}

          <div class="section">
            <div class="section-title">${isTransport ? 'Transport Fee' : 'Items'}</div>
            <table>
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Description</th>
                  ${!isTransport ? '<th style="padding: 10px; text-align: center;">Qty</th>' : ''}
                  <th style="padding: 10px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${isTransport ? `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">Delivery/Transport Fee</td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R${data.transportCost?.toFixed(2)}</td>
                  </tr>
                ` : itemsHtml}
              </tbody>
            </table>
          </div>

          ${data.deliveryType === 'delivery' && !isTransport ? `
            <div class="section">
              <div class="section-title">Delivery Address</div>
              <p>${data.deliveryAddress}</p>
            </div>
          ` : ''}

          <div class="section">
            <div class="summary">
              <div class="summary-row total">
                <span>Amount Due:</span>
                <span>R${(isTransport ? data.transportCost : data.total)?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div class="payment-info">
            <strong>How to Pay:</strong>
            <p style="margin: 10px 0 0 0; font-size: 14px;">
              Transfer the amount to our bank account or contact us for payment options.
            </p>
          </div>

          <div class="footer">
            <p>e'Bosch - Community | Heritage | Leadership</p>
            <p>For inquiries, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: 'members.ebosch@gmail.com',
      to: data.customerEmail,
      subject: `${isTransport ? 'Delivery' : 'Order'} Invoice #${data.orderId}`,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Error sending invoice:', error);
    return false;
  }
}

export async function sendBusinessOrderNotification(businessEmail: string, orderData: any): Promise<boolean> {
  try {
    const itemsHtml = orderData.items
      .map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">R${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `)
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c2c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 18px; font-weight: bold; color: #2d5016; margin-bottom: 15px; border-bottom: 2px solid #2d5016; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          .summary { margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .summary-row.total { font-size: 18px; font-weight: bold; color: #2d5016; border-top: 2px solid #2d5016; padding-top: 10px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 New Order Received</h1>
            <p>Order #${orderData.orderId}</p>
          </div>

          <div class="section">
            <div class="section-title">Customer Information</div>
            <p><strong>Name:</strong> ${orderData.customerName}</p>
            <p><strong>Email:</strong> ${orderData.customerEmail}</p>
            <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
            ${orderData.deliveryAddress ? `<p><strong>Address:</strong> ${orderData.deliveryAddress}</p>` : ''}
          </div>

          <div class="section">
            <div class="section-title">Order Items</div>
            <table>
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="summary">
              <div class="summary-row total">
                <span>Order Total:</span>
                <span>R${orderData.total.toFixed(2)}</span>
              </div>
              <div class="summary-row" style="margin-top: 15px; font-size: 14px;">
                <span>Delivery:</span>
                <span>${orderData.deliveryType === 'pickup' ? 'Customer Pickup' : 'Delivery to Address'}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Please prepare the order and coordinate with the customer for delivery/pickup.</p>
            <p>e'Bosch Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: 'members.ebosch@gmail.com',
      to: businessEmail,
      subject: `New Order #${orderData.orderId} - Action Required`,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Error sending business notification:', error);
    return false;
  }
}
