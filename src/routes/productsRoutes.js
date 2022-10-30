const express = require("express");
const productController = require("../controllers/productsController");
const router = express.Router();

router.get("/", productController.getProducts);
router.get("/:roll", productController.getProductID);
router.post("/", productController.createProduct);
router.put("/", productController.updateProducts);
router.patch("/:roll", productController.patchProduct);
router.delete("/:roll", productController.deleteProduct);

module.exports = router;
