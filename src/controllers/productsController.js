const express = require("express");
const mongoose = require("mongoose");

const Product = require("../models/productModel.js");

const router = express.Router();

const { scrapeProducts } = require("../crawler/scraper");

const getProducts = async (req, res) => {
  try {
    const product = await Product.find();
    console.log(product);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getProductID = async (req, res) => {
  const id = req.params.id;

  try {
    const prod = await Product.findOne({ id: id });

    res.status(200).json(prod);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createProduct = async (req, res) => {
  console.log(req.body);
  const newProduct = new Product({
    name: req.body.name,
    price: req.body.price,
    qty: req.body.qty,
    brand: req.body.brand,
    tags: req.body.tags,
    img: req.body.img,
  });
  try {
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const patchProduct = async (req, res) => {
  const id = req.params.id;
  try {
    await Product.findOneAndUpdate(
      {
        id: id,
      },
      {
        name: req.body.name,
        price: req.body.price,
        qty: req.body.qty,
        brand: req.body.brand,
        tags: req.body.tags,
        img: req.body.img,
      }
    );
    res.status(202).json({ id: id });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
const updateProducts = async (req, res) => {
  const products = await scrapeProducts("https://supermercadogoiana.com.br/loja/departamentos/");

  const bulkOps = products.map((product) => {
    return {
      updateOne: {
        filter: {
          id: product.id,
        },
        update: {
          name: product.name,
          tags: product.tags,
          price: product.price,
          img: product.img,
        },
        upsert: true,
      },
    };
  });

  Product.bulkWrite(bulkOps).then((res) => {
    console.log("Res", res);
    console.log("Documents Updated", res.modifiedCount);
  });
};

const deleteProduct = async (req, res) => {
  const id = req.params.id;

  try {
    await Product.findOneAndRemove({ id: id });
    res.status(203).json({ id: id });
  } catch (error) {
    res.status(402).json({ message: error.message });
  }
};

module.exports.getProducts = getProducts;
module.exports.createProduct = createProduct;
module.exports.getProductID = getProductID;
module.exports.patchProduct = patchProduct;
module.exports.updateProducts = updateProducts;
module.exports.deleteProduct = deleteProduct;
