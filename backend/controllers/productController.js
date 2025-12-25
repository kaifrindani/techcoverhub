import fs from "fs";
import path from "path";

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    if (product.image) {
      const filePath = path.join(process.cwd(), product.image);
      fs.existsSync(filePath) && fs.unlinkSync(filePath);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
