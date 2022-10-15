const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome do produto é obrigatório"],
    },
    price: {
      type: Number,
      required: [true, "Valor do produto é obrigatório"],
    },
    qty: {
      type: Number,
      required: [true, "Quantidade do produto é obrigatória"],
    },
    brand: {
      type: String,
      required: [true, "Marca do produto é obrigatória"],
    },
    tags: {
      type: [String],
      required: [true, "Deve conter no mínimo 1 categoria"],
    },
    img: {
      type: String,
    },
  },
  { collection: "produtos" }
);

module.exports = mongoose.model("productSchema", productSchema);
