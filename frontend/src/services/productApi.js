import axios from "axios";

// CHANGE PORT if your backend uses another one
const BASE_URL = "http://localhost:5000/api/products";

export const getProducts = async (page, limit, search) => {
  const response = await axios.get(BASE_URL, {
    params: {
      page: page,
      limit: limit,
      search: search,
    },
  });
const Products = () => {
  return <h1>Products Page</h1>;
};

export default Products;

  return response.data;
};
