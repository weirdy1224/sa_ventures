const nodemailer = require('nodemailer');

const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const from = () => process.env.EMAIL_FROM || 'HOOOMANS <noreply@hooomans.in>';

const send = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_gmail@gmail.com') {
    console.log(`[Email skip – no credentials] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await getTransporter().sendMail({ from: from(), to, subject, html });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

const formatCurrency = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBD';

const baseStyles = `
  font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;
  background: #fff; color: #1a1a2e; border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
`;

exports.sendOrderConfirmation = async (user, order) => {
  const items = order.products.map(p =>
    `<tr><td style="padding:8px 0">${p.name}</td><td style="text-align:right">x${p.quantity}</td><td style="text-align:right">${formatCurrency(p.priceAtPurchase * p.quantity)}</td></tr>`
  ).join('');

  const html = `
    <div style="${baseStyles}">
      <div style="background:#031C2E;padding:32px;text-align:center">
        <h1 style="color:#F2A51A;font-size:28px;margin:0">HOOOMANS</h1>
        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0">Order Confirmed 🎉</p>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your order has been placed successfully. Here's your summary:</p>
        <div style="background:#F9FAFB;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;font-size:13px;color:#6B7280">ORDER ID</p>
          <p style="margin:0;font-weight:700;font-size:17px">${order._id}</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="border-bottom:2px solid #E5E7EB">
            <th style="text-align:left;padding:8px 0;font-size:13px;color:#6B7280">ITEM</th>
            <th style="text-align:right;font-size:13px;color:#6B7280">QTY</th>
            <th style="text-align:right;font-size:13px;color:#6B7280">PRICE</th>
          </tr></thead>
          <tbody>${items}</tbody>
          <tfoot><tr style="border-top:2px solid #E5E7EB">
            <td colspan="2" style="padding:12px 0;font-weight:700">Total</td>
            <td style="text-align:right;font-weight:700;color:#F2A51A">${formatCurrency(order.totalAmount)}</td>
          </tr></tfoot>
        </table>
        <p style="margin-top:24px;color:#6B7280;font-size:14px">We'll notify you as your order progresses. Thank you for shopping with HOOOMANS! 🐾</p>
      </div>
    </div>`;
  await send(user.email, `Order Confirmed – #${order._id.toString().slice(-6).toUpperCase()}`, html);
};

exports.sendOrderStatusUpdate = async (user, order) => {
  const statusLabels = {
    packed: '📦 Order Packed',
    shipped: '🚚 Order Shipped',
    nearest_hub: '🏪 At Nearest Hub',
    yet_to_deliver: '🏠 Out for Delivery',
    delivered: '✅ Delivered',
  };
  const label = statusLabels[order.status] || order.status;

  const html = `
    <div style="${baseStyles}">
      <div style="background:#031C2E;padding:32px;text-align:center">
        <h1 style="color:#F2A51A;font-size:28px;margin:0">HOOOMANS</h1>
      </div>
      <div style="padding:32px">
        <h2 style="margin:0 0 16px">${label}</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> status has been updated to <strong>${label}</strong>.</p>
        ${order.expectedDelivery ? `<p>Expected delivery: <strong>${formatDate(order.expectedDelivery)}</strong></p>` : ''}
        <p style="color:#6B7280;font-size:14px">Track your order in the HOOOMANS app for real-time updates.</p>
      </div>
    </div>`;
  await send(user.email, `Order Update: ${label} – #${order._id.toString().slice(-6).toUpperCase()}`, html);
};

exports.sendRefundEmail = async (user, order, refund) => {
  const html = `
    <div style="${baseStyles}">
      <div style="background:#031C2E;padding:32px;text-align:center">
        <h1 style="color:#F2A51A;font-size:28px;margin:0">HOOOMANS</h1>
      </div>
      <div style="padding:32px">
        <h2>Refund Initiated 💸</h2>
        <p>Hi <strong>${user.name}</strong>, your refund of <strong>${formatCurrency(order.totalAmount)}</strong> for order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been initiated.</p>
        <p>Refund ID: <code>${refund.id}</code></p>
        <p style="color:#6B7280;font-size:14px">Please allow 5–7 business days for the amount to reflect in your account.</p>
      </div>
    </div>`;
  await send(user.email, `Refund Initiated – ${formatCurrency(order.totalAmount)}`, html);
};

exports.sendLowStockAlert = async (products) => {
  const rows = products.map(p => `<tr><td style="padding:8px">${p.name}</td><td style="padding:8px">${p.sku || 'N/A'}</td><td style="padding:8px;color:#EF4444;font-weight:700">${p.stock}</td></tr>`).join('');
  const html = `
    <div style="${baseStyles}">
      <div style="background:#031C2E;padding:32px;text-align:center"><h1 style="color:#F2A51A;margin:0">⚠️ Low Stock Alert</h1></div>
      <div style="padding:32px">
        <p>The following products have stock below 5 units:</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px">
          <thead><tr style="background:#F3F4F6"><th style="padding:8px;text-align:left">Product</th><th style="padding:8px;text-align:left">SKU</th><th style="padding:8px;text-align:left">Stock</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:24px;color:#6B7280;font-size:14px">Please restock these items promptly to avoid stockouts.</p>
      </div>
    </div>`;
  await send(process.env.INVENTORY_EMAIL || 'inventory@hooomans.in', '⚠️ Low Stock Alert – Action Required', html);
};

exports.sendStaffCredentials = async (user, password, role) => {
  const roleLabels = { staff: 'Staff Member', delivery: 'Delivery Person' };
  const html = `
    <div style="${baseStyles}">
      <div style="background:#031C2E;padding:32px;text-align:center"><h1 style="color:#F2A51A;margin:0">HOOOMANS</h1></div>
      <div style="padding:32px">
        <h2>Welcome to HOOOMANS, ${user.name}! 👋</h2>
        <p>Your ${roleLabels[role]} account has been created. Here are your login details:</p>
        <div style="background:#F3F4F6;border-radius:8px;padding:20px;margin:20px 0">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Password:</strong> <code style="background:#E5E7EB;padding:2px 6px;border-radius:4px">${password}</code></p>
          <p><strong>Portal:</strong> <a href="${process.env.CLIENT_URL}/login" style="color:#F2A51A">${process.env.CLIENT_URL}/login</a></p>
        </div>
        <p style="color:#EF4444;font-size:13px"><strong>Please change your password after first login.</strong></p>
      </div>
    </div>`;
  await send(user.email, `Your HOOOMANS ${roleLabels[role]} Account`, html);
};

exports.sendDeliveryConfirmation = async (user, order) => {
  const html = `
    <div style="${baseStyles}">
      <div style="background:#031C2E;padding:32px;text-align:center"><h1 style="color:#F2A51A;margin:0">HOOOMANS</h1></div>
      <div style="padding:32px">
        <h2>Your order has been delivered! ✅</h2>
        <p>Hi <strong>${user.name}</strong>, order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> was successfully delivered.</p>
        <p>We hope you love your purchase! 🐾 Please share your experience by leaving a review.</p>
        <a href="${process.env.CLIENT_URL}/products" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#F2A51A;color:#1a1a2e;border-radius:8px;font-weight:700;text-decoration:none">Write a Review</a>
      </div>
    </div>`;
  await send(user.email, 'Order Delivered – Share Your Experience!', html);
};
