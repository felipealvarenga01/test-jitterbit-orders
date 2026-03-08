import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    creationDate: {
      type: Date,
      required: true,
    },
    items: {
      type: [itemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;

