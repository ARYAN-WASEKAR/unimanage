import mongoose from "mongoose";

const InvoiceSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    customerId: { type: String, required: true },
    customerName: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["PAID", "PENDING", "OVERDUE", "CANCELLED"], default: "PAID" },
    date: { type: String, required: true },
    dueDate: { type: String, required: true },
  },
  { timestamps: true },
);

export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
