const express = require("express");
const router = express.Router();
const Product = require("../models/product");
const upload = require("../middleware/upload");

/* ================= ADD PRODUCT ================= */
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const imagePath = req.file
      ? `/uploads/products/${req.file.filename}`
      : null;

    const product = await Product.create({
      name,
      price,
      category,
      description,
      stock,
      image: imagePath,
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= UPDATE PRODUCT ================= */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = req.body.name;
    product.price = req.body.price;
    product.category = req.body.category;
    product.description = req.body.description;
    product.stock = req.body.stock;

    if (req.file) {
      product.image = `/uploads/products/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= DELETE PRODUCT ================= */
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET PRODUCTS ================= */
router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
