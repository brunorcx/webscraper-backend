const express = require("express");
const mongoose = require("mongoose");

const Product = require("../models/productModel.js");

const router = express.Router();

const { scrapeProducts, scrapeProductsGaviao, scrapeProductsAtacadao } = require("../crawler/scraper");

const getProducts = async (req, res) => {
  try {
    res.header("Access-Control-Allow-Origin", "*");
    const product = await Product.find(req.query ? req.query : {});
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
const updateProducts = async (req, response) => {
  try {
    let products = await scrapeProducts("https://supermercadogoiana.com.br/loja/departamentos/");
    let prodGaviao = await scrapeProductsGaviao(
      "https://www.sitemercado.com.br/supermercadogaviao/boa-vista-loja-villeroy-centro-av-ville-roy/departamentos"
    );
    let prodAtacadao = await scrapeProductsAtacadao("https://www.atacadao.com.br");
    products = products.concat(prodGaviao).concat(prodAtacadao);

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
            rating: product.rating,
            mall: product.mall,
          },
          upsert: true,
        },
      };
    });

    Product.bulkWrite(bulkOps).then((res) => {
      console.log("Documents Updated", res);
      response.status(200).json(res);
    });
  } catch (error) {
    response.status(400).json();
  }
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
