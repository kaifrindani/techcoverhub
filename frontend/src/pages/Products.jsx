import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const IMAGE_BASE_URL = "http://localhost:5000";

export default function Products() {
  const { user, logout } = useAuth(); // ✅ use user + logout

  /* ================= STATE ================= */

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const emptyForm = { name: "", price: "", category: "", stock: "" };
  const [formData, setFormData] = useState(emptyForm);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  /* ================= API ================= */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/products?page=${page}&limit=${limit}&search=${debouncedSearch}`
      );

      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
      // 401 handled globally in axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await api.delete(`/products/${id}`);
    fetchProducts();
  };

  /* ================= IMAGE ================= */

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* ================= ADD / UPDATE ================= */

  const handleAdd = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    await api.post("/products/add", fd);

    closeModal();
    fetchProducts();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    await api.put(`/products/${currentProduct._id}`, fd);

    closeModal();
    fetchProducts();
  };

  /* ================= HELPERS ================= */

  const openAdd = () => {
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setIsAddOpen(true);
  };

  const openEdit = (p) => {
    setCurrentProduct(p);
    setFormData({
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock,
    });
    setImagePreview(p.image ? IMAGE_BASE_URL + p.image : null);
    setImageFile(null);
    setIsEditOpen(true);
  };

  const closeModal = () => {
    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setIsAddOpen(false);
    setIsEditOpen(false);
    setCurrentProduct(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  /* ================= EFFECTS ================= */

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [page, limit, debouncedSearch]);

  /* ================= UI ================= */

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Products</h2>
        <div>
          <span style={{ marginRight: 15 }}>
            Logged in as: <strong>{user?.role}</strong>
          </span>
          <button onClick={logout}>🚪 Logout</button>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          style={{ marginLeft: 10 }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        {/* ✅ Admin Only Add Button */}
        {user?.role === "admin" && (
          <button onClick={openAdd} style={{ marginLeft: 10 }}>
            ➕ Add Product
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <table border="1" width="100%" cellPadding="10">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Image</th>
              {user?.role === "admin" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>₹{p.price}</td>
                <td>{p.category}</td>
                <td>{p.stock}</td>
                <td>
                  {p.image && (
                    <img
                      src={IMAGE_BASE_URL + p.image}
                      width="50"
                      alt=""
                    />
                  )}
                </td>

                {/* ✅ Admin Only Actions */}
                {user?.role === "admin" && (
                  <td>
                    <button onClick={() => openEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p._id)}>
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 10 }}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>

      {(isAddOpen || isEditOpen) && (
        <form onSubmit={isEditOpen ? handleUpdate : handleAdd}>
          <h3>{isEditOpen ? "Edit" : "Add"} Product</h3>

          <input
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
          <input
            name="price"
            type="number"
            required
            value={formData.price}
            onChange={handleChange}
          />
          <input
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
          />
          <input
            name="stock"
            type="number"
            required
            value={formData.stock}
            onChange={handleChange}
          />

          <input type="file" accept="image/*" onChange={handleImageChange} />

          {imagePreview && <img src={imagePreview} width="100" alt="" />}

          <button type="submit">Save</button>
          <button type="button" onClick={closeModal}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}