const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const invoiceDirectory = path.join(process.cwd(), "storage", "invoices");

function ensureInvoiceDirectory() {
  if (!fs.existsSync(invoiceDirectory)) {
    fs.mkdirSync(invoiceDirectory, { recursive: true });
  }
}

function buildInvoiceNumber(orderId) {
  const suffix = String(orderId || "").replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `INV-${suffix}`;
}

function formatAmount(amountInPaise, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format((Number(amountInPaise || 0)) / 100);
}

async function generateInvoicePdf({ payment, appUrl }) {
  ensureInvoiceDirectory();

  const invoiceNumber = payment.invoice_number || buildInvoiceNumber(payment.order_id);
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(invoiceDirectory, fileName);
  const invoiceUrl = `${appUrl}/invoice-files/${encodeURIComponent(fileName)}`;
  const formattedDate = new Date(payment.updated_at || payment.created_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const formattedAmount = formatAmount(payment.amount, payment.currency);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(filePath);

    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    doc.font("Helvetica-Bold").fontSize(24).fillColor("#0f172a").text("Invoice", 50, 50);
    doc.font("Helvetica").fontSize(11).fillColor("#64748b").text("LegalAxis Legal Services", 50, 82);

    doc.moveTo(50, 115).lineTo(545, 115).lineWidth(1).strokeColor("#cbd5e1").stroke();

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text("Invoice ID", 50, 145);
    doc.font("Helvetica").fillColor("#334155").text(invoiceNumber, 180, 145);

    doc.font("Helvetica-Bold").fillColor("#0f172a").text("Customer Name", 50, 170);
    doc.font("Helvetica").fillColor("#334155").text(payment.customer_name || "-", 180, 170);

    doc.font("Helvetica-Bold").fillColor("#0f172a").text("Service Name", 50, 195);
    doc.font("Helvetica").fillColor("#334155").text(payment.service || "-", 180, 195);

    doc.font("Helvetica-Bold").fillColor("#0f172a").text("Amount", 50, 220);
    doc.font("Helvetica").fillColor("#334155").text(formattedAmount, 180, 220);

    doc.font("Helvetica-Bold").fillColor("#0f172a").text("Date", 50, 245);
    doc.font("Helvetica").fillColor("#334155").text(formattedDate, 180, 245);

    doc.moveTo(50, 290).lineTo(545, 290).lineWidth(1).strokeColor("#e2e8f0").stroke();
    doc.font("Helvetica").fontSize(10).fillColor("#64748b").text("This invoice was generated automatically after successful payment.", 50, 315);

    doc.end();
  });

  return {
    invoiceNumber,
    fileName,
    filePath,
    invoiceUrl,
  };
}

module.exports = {
  ensureInvoiceDirectory,
  generateInvoicePdf,
  buildInvoiceNumber,
  formatAmount,
};
