function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(amountInPaise, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format((amountInPaise || 0) / 100);
}

function generateInvoiceNumber(orderId) {
  const suffix = String(orderId || "").slice(-6).toUpperCase();
  return `INV-${suffix}`;
}

function buildInvoiceHtml(payment) {
  const paidAt = payment.updated_at || payment.created_at;
  const invoiceNumber = payment.invoice_number || generateInvoiceNumber(payment.order_id);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice ${escapeHtml(invoiceNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8fbff; color: #0f172a; margin: 0; padding: 32px; }
      .invoice { max-width: 860px; margin: 0 auto; background: #fff; border: 1px solid #dbeafe; border-radius: 20px; padding: 32px; }
      .header { display: flex; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: 32px; }
      .brand { font-size: 28px; font-weight: 800; color: #1163ff; }
      .label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; }
      h1 { margin: 8px 0 0; font-size: 32px; }
      .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; margin-bottom: 32px; }
      .card { background: #f8fbff; border-radius: 16px; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { text-align: left; padding: 14px 0; border-bottom: 1px solid #e2e8f0; }
      .total { font-size: 22px; font-weight: 800; color: #1163ff; }
      .footer { margin-top: 32px; color: #64748b; font-size: 14px; }
      @media (max-width: 640px) { body { padding: 16px; } .invoice { padding: 20px; } .grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main class="invoice">
      <section class="header">
        <div>
          <div class="brand">LegalAxis</div>
          <div class="label">Professional Legal Services Invoice</div>
          <h1>Payment Receipt</h1>
        </div>
        <div>
          <div><span class="label">Invoice Number</span><br />${escapeHtml(invoiceNumber)}</div>
          <div style="margin-top: 12px;"><span class="label">Order ID</span><br />${escapeHtml(payment.order_id)}</div>
          <div style="margin-top: 12px;"><span class="label">Payment ID</span><br />${escapeHtml(payment.payment_id)}</div>
        </div>
      </section>

      <section class="grid">
        <div class="card">
          <div class="label">Billed To</div>
          <strong>${escapeHtml(payment.customer_name)}</strong><br />
          ${escapeHtml(payment.customer_phone)}
        </div>
        <div class="card">
          <div class="label">Payment Details</div>
          Status: ${escapeHtml(payment.status)}<br />
          Date: ${escapeHtml(new Date(paidAt).toLocaleString("en-IN"))}<br />
          Currency: ${escapeHtml(payment.currency)}
        </div>
      </section>

      <section>
        <div class="label">Service Summary</div>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Customer Message</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${escapeHtml(payment.service)}</td>
              <td>${escapeHtml(payment.customer_message || "Not provided")}</td>
              <td class="total">${escapeHtml(formatCurrency(payment.amount, payment.currency))}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <p class="footer">This invoice was generated automatically after successful payment. For support, contact hello@legalaxis.in.</p>
    </main>
  </body>
</html>`;
}

module.exports = {
  buildInvoiceHtml,
  generateInvoiceNumber,
};
