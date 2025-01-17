import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../API/Api";
import ProductBox from "../ProductSection/ProductBox"; // Use your existing ProductBox component
import "./CategoryProductCarousel.css"; // Add CSS for styling
import { Link } from "react-router-dom";
import CategoryBox from "../ProductSection/CategoryBox";
import("../../CSS/ProductSection.css");

const CategoryProductCarousel = ({ categoryId }) => {
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState(6); // Number of products to show initially

  // Fetch products for the given category
  const fetchProductsByCategory = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/getCategoryById/${categoryId}`
      );
      const fetchedProducts = response.data;
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProductsByCategory();
  }, [categoryId]);

  // Function to load more products
  const loadMoreProducts = () => {
    setVisibleProducts((prevVisibleProducts) => prevVisibleProducts + 6); // Increase the number of visible products
  };

  return (
    <div className="category-product-grid">
      <div className="new_order3">
        <div className="title">
          <h2 className="mt-4">Browse by Categories</h2>
          <span className="title-leaf"></span>
          <p>Top Categories Of The Week</p>
        </div>

        <div
          className="category-slider-2 product-wrapper no-arrow slick-initialized slick-slider slick-dotted mb-4"
          data-aos="fade-left"
        >
          <CategoryBox />
        </div>
      </div>
      <div className="title me-1">
        <h2 className="mt-3 me-5">Top Categories</h2>
        <span className="title-leaf"> </span>
        <p>All Time Top Categories Of The Week</p>
      </div>
      <div className="product-grid pe-3">
        {products.slice(0, visibleProducts).map((product) => (
          <div key={product.product_id} className="product_view">
            <ProductBox
              imageSrc={JSON.parse(product.product_image || '""')}
              productName={product.product_name}
              currentPrice={product.product_price}
              product_id={product.product_id}
              inStock={product.stock}
              productDetails={product.product_details}
              productType={product.product_type}
              brand_name={product.brand_name}
              sku={product.sku}
              weight={product.weight}
              weight_type={product.weight_type}
              min_weight={product.min_weight}
              discount_price={product.discount_price}
              average_rating={product.average_rating}
              offers={product.offers}
            />
          </div>
        ))}
      </div>
      {/* Show "View More" button if there are more products to display */}
      {products.length > visibleProducts && (
        <div className="view-more-button d-flex justify-content-center">
          <Link to="/filter" className="btn btn-animation ">
            View More
          </Link>
        </div>
      )}
    </div>
  );
};

export default CategoryProductCarousel;
