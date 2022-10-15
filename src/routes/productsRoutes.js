const express = require("express");
const productController = require("../controllers/productsController");
const router = express.Router();

router.get("/", productController.getProducts);
router.get("/:roll", productController.getProductID);
router.post("/", productController.createProduct);
router.patch("/:roll", productController.updateProduct);
router.delete("/:roll", productController.deleteProduct);

module.exports = router;
