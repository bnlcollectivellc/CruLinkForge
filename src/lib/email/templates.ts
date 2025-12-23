// Email templates for CruLink Forge notifications
// These templates can be used with any email service (SendGrid, Resend, etc.)

export interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  partName: string;
  quantity: number;
  total: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  orderUrl: string;
  companyName: string;
  companyLogo?: string;
  primaryColor?: string;
}

// Base email wrapper
const emailWrapper = (content: string, data: OrderData) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Update</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header {
      padding: 24px;
      text-align: center;
      border-bottom: 1px solid #eee;
    }
    .header img {
      max-height: 48px;
      width: auto;
    }
    .content {
      padding: 32px 24px;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: ${data.primaryColor || '#dc2626'};
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 16px 0;
    }
    .order-box {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .order-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
    .order-row:last-child {
      border-bottom: none;
      font-weight: 600;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .status-new { background: #dbeafe; color: #1d4ed8; }
    .status-production { background: #fef3c7; color: #b45309; }
    .status-shipped { background: #e9d5ff; color: #7c3aed; }
    .status-delivered { background: #dcfce7; color: #16a34a; }
    h1 { font-size: 24px; margin: 0 0 16px 0; }
    h2 { font-size: 18px; margin: 24px 0 12px 0; }
    p { margin: 0 0 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${data.companyLogo ? `<img src="${data.companyLogo}" alt="${data.companyName}">` : `<h2 style="margin:0;color:${data.primaryColor || '#dc2626'}">${data.companyName}</h2>`}
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${data.companyName}. All rights reserved.</p>
      <p>Powered by CruLink: Forge</p>
    </div>
  </div>
</body>
</html>
`;

// Customer: Order Confirmation
export const orderConfirmationEmail = (data: OrderData) => ({
  subject: `Order Confirmed - #${data.orderId}`,
  html: emailWrapper(`
    <h1>Thank you for your order!</h1>
    <p>Hi ${data.customerName},</p>
    <p>We've received your order and it's being reviewed by our team. You'll receive an update once production begins.</p>

    <div class="order-box">
      <h2 style="margin-top:0">Order #${data.orderId}</h2>
      <div class="order-row">
        <span>Part</span>
        <span>${data.partName}</span>
      </div>
      <div class="order-row">
        <span>Quantity</span>
        <span>${data.quantity}</span>
      </div>
      <div class="order-row">
        <span>Total</span>
        <span>$${data.total.toLocaleString()}</span>
      </div>
    </div>

    <p style="text-align:center">
      <a href="${data.orderUrl}" class="button">View Order Status</a>
    </p>

    <p>If you have any questions, just reply to this email and we'll be happy to help.</p>
  `, data),
});

// Customer: Order Accepted / In Production
export const orderAcceptedEmail = (data: OrderData) => ({
  subject: `Production Started - Order #${data.orderId}`,
  html: emailWrapper(`
    <h1>Your order is in production!</h1>
    <p>Hi ${data.customerName},</p>
    <p>Great news! We've reviewed your order and production has begun.</p>

    <div style="text-align:center;margin:24px 0">
      <span class="status-badge status-production">In Production</span>
    </div>

    <div class="order-box">
      <h2 style="margin-top:0">Order #${data.orderId}</h2>
      <div class="order-row">
        <span>Part</span>
        <span>${data.partName}</span>
      </div>
      <div class="order-row">
        <span>Quantity</span>
        <span>${data.quantity}</span>
      </div>
      ${data.estimatedDelivery ? `
      <div class="order-row">
        <span>Estimated Completion</span>
        <span>${data.estimatedDelivery}</span>
      </div>
      ` : ''}
    </div>

    <p style="text-align:center">
      <a href="${data.orderUrl}" class="button">Track Your Order</a>
    </p>

    <p>We'll notify you as soon as your parts are ready to ship.</p>
  `, data),
});

// Customer: Order Shipped
export const orderShippedEmail = (data: OrderData) => ({
  subject: `Your Order Has Shipped - #${data.orderId}`,
  html: emailWrapper(`
    <h1>Your order is on its way!</h1>
    <p>Hi ${data.customerName},</p>
    <p>Your custom parts have shipped and are headed your way.</p>

    <div style="text-align:center;margin:24px 0">
      <span class="status-badge status-shipped">Shipped</span>
    </div>

    <div class="order-box">
      <h2 style="margin-top:0">Tracking Information</h2>
      ${data.trackingNumber ? `
      <div class="order-row">
        <span>Tracking Number</span>
        <span>${data.trackingNumber}</span>
      </div>
      ` : ''}
      ${data.estimatedDelivery ? `
      <div class="order-row">
        <span>Estimated Delivery</span>
        <span>${data.estimatedDelivery}</span>
      </div>
      ` : ''}
    </div>

    ${data.trackingUrl ? `
    <p style="text-align:center">
      <a href="${data.trackingUrl}" class="button">Track Package</a>
    </p>
    ` : ''}

    <p style="text-align:center">
      <a href="${data.orderUrl}" style="color:${data.primaryColor || '#dc2626'}">View Order Details</a>
    </p>
  `, data),
});

// Customer: Order Delivered
export const orderDeliveredEmail = (data: OrderData) => ({
  subject: `Order Delivered - #${data.orderId}`,
  html: emailWrapper(`
    <h1>Your order has been delivered!</h1>
    <p>Hi ${data.customerName},</p>
    <p>Your custom parts have arrived. We hope everything meets your expectations!</p>

    <div style="text-align:center;margin:24px 0">
      <span class="status-badge status-delivered">Delivered</span>
    </div>

    <div class="order-box">
      <h2 style="margin-top:0">Order #${data.orderId}</h2>
      <div class="order-row">
        <span>Part</span>
        <span>${data.partName}</span>
      </div>
      <div class="order-row">
        <span>Quantity</span>
        <span>${data.quantity}</span>
      </div>
    </div>

    <p>If you have any issues with your order or need additional parts, we're here to help.</p>

    <p style="text-align:center">
      <a href="${data.orderUrl}" class="button">Reorder Parts</a>
    </p>

    <p style="text-align:center;color:#888;font-size:14px">
      Thank you for choosing ${data.companyName}!
    </p>
  `, data),
});

// Fabricator: New Order Alert
export interface FabricatorOrderData extends OrderData {
  adminUrl: string;
  margin: number;
  platformFee: number;
  payout: number;
}

export const newOrderAlertEmail = (data: FabricatorOrderData) => ({
  subject: `New Order Received - #${data.orderId}`,
  html: emailWrapper(`
    <h1>New Order Received!</h1>
    <p>You have a new order that requires your attention.</p>

    <div style="text-align:center;margin:24px 0">
      <span class="status-badge status-new">Needs Review</span>
    </div>

    <div class="order-box">
      <h2 style="margin-top:0">Order #${data.orderId}</h2>
      <div class="order-row">
        <span>Customer</span>
        <span>${data.customerName}</span>
      </div>
      <div class="order-row">
        <span>Part</span>
        <span>${data.partName}</span>
      </div>
      <div class="order-row">
        <span>Quantity</span>
        <span>${data.quantity}</span>
      </div>
      <div class="order-row">
        <span>Order Total</span>
        <span>$${data.total.toLocaleString()}</span>
      </div>
      <div class="order-row">
        <span>Platform Fee (5%)</span>
        <span>-$${data.platformFee.toLocaleString()}</span>
      </div>
      <div class="order-row">
        <span>Your Payout</span>
        <span style="color:#16a34a">$${data.payout.toLocaleString()}</span>
      </div>
    </div>

    <p style="text-align:center">
      <a href="${data.adminUrl}" class="button">Review Order</a>
    </p>

    <p style="font-size:14px;color:#888">Please review and accept this order within 24 hours to maintain response time metrics.</p>
  `, data),
});

// Fabricator: Daily Summary (optional)
export interface DailySummaryData {
  companyName: string;
  companyLogo?: string;
  primaryColor?: string;
  date: string;
  newOrders: number;
  inProduction: number;
  shipped: number;
  totalRevenue: number;
  pendingPayouts: number;
  adminUrl: string;
}

export const dailySummaryEmail = (data: DailySummaryData) => ({
  subject: `Daily Summary - ${data.date}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header {
      padding: 24px;
      text-align: center;
      border-bottom: 1px solid #eee;
    }
    .content {
      padding: 32px 24px;
    }
    .footer {
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #eee;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 24px 0;
    }
    .stat-box {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: ${data.primaryColor || '#dc2626'};
    }
    .stat-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background-color: ${data.primaryColor || '#dc2626'};
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${data.companyLogo ? `<img src="${data.companyLogo}" alt="${data.companyName}" style="max-height:48px">` : `<h2 style="margin:0;color:${data.primaryColor || '#dc2626'}">${data.companyName}</h2>`}
    </div>
    <div class="content">
      <h1 style="margin:0 0 8px 0">Daily Summary</h1>
      <p style="color:#888;margin:0 0 24px 0">${data.date}</p>

      <div class="stat-grid">
        <div class="stat-box">
          <div class="stat-value">${data.newOrders}</div>
          <div class="stat-label">New Orders</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.inProduction}</div>
          <div class="stat-label">In Production</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.shipped}</div>
          <div class="stat-label">Shipped Today</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">$${data.totalRevenue.toLocaleString()}</div>
          <div class="stat-label">Revenue</div>
        </div>
      </div>

      <div style="background:#f0fdf4;border-radius:8px;padding:16px;text-align:center;margin:24px 0">
        <div style="font-size:14px;color:#16a34a">Pending Payouts</div>
        <div style="font-size:24px;font-weight:700;color:#16a34a">$${data.pendingPayouts.toLocaleString()}</div>
      </div>

      <p style="text-align:center">
        <a href="${data.adminUrl}" class="button">View Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${data.companyName}. All rights reserved.</p>
      <p>Powered by CruLink: Forge</p>
    </div>
  </div>
</body>
</html>
`,
});
