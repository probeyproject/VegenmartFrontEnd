import React, { useEffect, useState } from "react";
import Footer from "../Components/Common/Footer";
import HeaderTop from "../Components/Header/HeaderTop";
import HeaderMiddle from "../Components/Header/HeaderMiddle";
import HeaderBottom from "../Components/Header/HeaderBottom";
import ProductSlider from "../Components/Detail_Page/ProductSlider";
import { TabContent, TabPane, Nav, NavItem, NavLink } from "reactstrap";
import Slider from "react-slick";
import classnames from "classnames";
import ProductList from "../Components/ProductSection/ProductList";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import WriteReviewModal from "../Components/Detail_Page/WriteReviewModal";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { baseUrl } from "../API/Api";
import LoginModal from "../Components/Common/LoginModal";
import { DetailsPageReleventProduct } from "../Components/Common/DetailsPageReleventProduct";
import { BsInfoCircle } from "react-icons/bs";
import DiscountModal from "../Components/Common/DiscountModal";
import { FaRegCircle } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";

const formatDate = (dateString) => {
  const date = new Date(dateString);

  // Extract day, month, and year
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  // Format as DD-MM-YYYY
  return `${day}-${month}-${year}`;
};

function DetailPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [product, setProduct] = useState([]); // Consider setting to null for clarity
  const { id } = useParams();
  const [categoryIds, setCategoryIds] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Consider null instead of array
  const [careInstructions, setCareInstructions] = useState([]);
  const [additionalInfo, setAdditionalInfo] = useState([]); // Changed name for clarity
  const [timeLeft, setTimeLeft] = useState({});
  const [ads, setAds] = useState([]);
  const [banner, setBanner] = useState([]);
  const navigate = useNavigate();

  const [inputweight, setInputWeight] = useState("");
  const [warningMsg, setWarningMsg] = useState("");
  const [finalPrice, setFinalPrice] = useState("");
  const [weight_type, setWeight_type] = useState("");
  const [weightType, setWeightType] = useState(weight_type || "Kg");
  const [modal, setModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isModalDiscount, setIsModalDiscount] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [responseWeight, setResponseWeight] = useState("");

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, // Enable autoplay
    autoplaySpeed: 3000, // Time in milliseconds before moving to next slide
  };

  const authenticated = useSelector((state) => state?.user?.authenticated);
  const userState = useSelector((state) => state?.user?.user);
  const userId = userState?.id;
  const userStates = useSelector((state) => state?.user);
  const cart = userStates?.cart;
  const wishlist = userStates?.wishlists;

  const handleDiscountModal = (offersData) => {
    setModalData(offersData);
    setIsModalDiscount(true);
  };

  const toggleDiscountModal = () => {
    setIsModalDiscount(false);
  };
  const toggleLoginModal = () => setLoginModal(!loginModal);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };


  const handleAuth = (e, a) => {
    e.preventDefault();

    // Correctly prevent the default action

    if (authenticated) {
      navigate(a); // Navigate if authenticated
    } else {
      toggleLoginModal(); // Open login modal if not authenticated
    }
  };

  const handleClickCart = (e, a) => {
    if (!authenticated) {
      // If the user is not authenticated, call handleAuth
      handleAuth(e, a); // Pass event (e) and the argument (a)
    } else {
      // If the user is authenticated, call createCart
      createCart(); // Call createCart directly
    }
  };

  const handleClickWishlist = (e, a) => {
    if (!authenticated) {
      // If the user is not authenticated, call handleAuth
      handleAuth(e, a); // Pass event (e) and the argument (a)
    } else {
      // If the user is authenticated, call createCart
      handleAddToWishlist(); // Call createCart directly
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      const response = await axios.get(`${baseUrl}/getProductById/${id}`);
      
      const data = await response.data;
      console.log(data);
      setProduct(data);

      const categories = data.map((product) => product.category_id);
      const weight = data[0].weight_type;
      setWeight_type(weight);
      setCategoryIds(categories);
    };

    fetchProductDetails();
  }, [id]);

  const fetchReviews = async () => {
    const response = await axios.get(
      `${baseUrl}/getAllReviewByProdyctId/${id}`
    );
    const data = await response.data;
    setReviews(data);
  };

  const getAds = async () => {
    const response = await axios.get(`${baseUrl}/getAllAds`);
    const data = await response.data;
    setAds(data);
  };
  const getBanner = async () => {
    const response = await axios.get(`${baseUrl}/getBannerById/2`);
    const data = await response.data;
    setBanner(data);
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  useEffect(() => {
    getAds();
    getBanner();
  }, []);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (categoryIds.length > 0) {
        try {
          const careResponse = await axios.get(
            `${baseUrl}/getCareInstructionById/${categoryIds.join(",")}`
          );
          const careData = await careResponse.data;
          setCareInstructions(careData);

          const addInfoResponse = await axios.get(
            `${baseUrl}/getAdditionInfoById/${categoryIds.join(",")}`
          );
          const addInfoData = await addInfoResponse.data;
          setAdditionalInfo(addInfoData);
        } catch (error) {
          console.error("Error fetching additional data:", error);
        }
      }
    };

    fetchAdditionalData();
  }, [categoryIds]);

  const handleCloseModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(false);
    fetchReviews();
  };

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const ratingCounts = Array(5).fill(0);

  // Count the ratings
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1] += 1; // Increment the count for the respective rating
    }
  });

  // Calculate the average rating
  const totalRatings = reviews.length;
  const averageRating = totalRatings
    ? (
        reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings
      ).toFixed(1) // One decimal place
    : 0;

  const handleAddToWishlist = async () => {
    try {
      // Prepare the data to be sent
      const data = {
        productId: id,
        userId: userId,
      };

      // Make the POST request
      const response = await axios.post(`${baseUrl}/addToWishlist`, data);

      setIsInWishlist(true);
      // Handle the response (e.g., show a success message)

      toast.success("Add to wishlist Successful");
    } catch (error) {
      // Handle errors (e.g., show an error message)
      console.error("Error:", error);
      toast.warning("This product already in your wishlist!");
    }
  };

  const numericWeight = Number(inputweight);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputWeight(value);

    // Check if the input value is empty or null
    if (!value) {
      setWarningMsg(""); // Clear the warning message if the input is empty
      return; // Exit the function early
    }

    // Proceed with checking the weightType only if value is not empty
    if (weightType === "Kg") {
      if (Number(value) < 1 || Number(value) > 15) {
        setWarningMsg("Enter 1 to 15 Kg");
      } else {
        setWarningMsg(""); // Clear the warning if the condition is met
      }
    } else if (weightType === "pieces") {
      if (Number(value) < 5) {
        setWarningMsg("Enter 5 pieces or above.");
      } else if (Number(value) > 30) {
        setWarningMsg("Maximum 30 pieces allowed.");
      } else {
        setWarningMsg(""); // Clear the warning if the condition is met
      }
    } else {
      setWarningMsg(""); // Clear the warning if weightType is not recognized or is other than "Kg" or "pieces"
    }
  };

  useEffect(() => {
    setWeightType(weight_type || "kg"); // Update weightType if weight_type changes
  }, [weight_type]);

  useEffect(() => {
    // Convert inputweight to a number

    if (numericWeight && weightType) {
      // Check weight conditions based on weight type
      if (
        (weightType === "Kg" && numericWeight >= 1) ||
        (weightType === "pieces" && numericWeight >= 5) ||
        weightType === "g"
      ) {
        calculatePrice(numericWeight); // Call the API only if valid
      }
    }
  }, [inputweight, weightType]);

  const calculatePrice = async (numericWeight) => {
    try {
      let unitTypeToSend = weightType;

      // Change unitType to kg if it's grams
      if (weightType === "g") {
        unitTypeToSend = "Kg"; // Change unitType to kg
      }

      const response = await axios.post(`${baseUrl}/calculate-price/${id}`, {
        weight: numericWeight, // Use the already calculated weight
        unitType: unitTypeToSend, // Send kg if it was grams
      });

      setFinalPrice(response.data.final_price);
      setResponseWeight(response.data.weight);
    } catch (error) {
      console.error("Error:", error);
      
    }
  };

  useEffect(() => {
    if (inputweight === "") {
      setFinalPrice("");
    }
  }, [inputweight, setFinalPrice]);

  const createCart = async () => {
    const numericWeight = parseFloat(inputweight);

    // Check if inputWeight is valid based on weightType
    if (
      (weightType === "Kg" && (isNaN(numericWeight) || numericWeight < 0.9)) ||
      (weightType === "g" && (isNaN(numericWeight) || numericWeight < 0.25)) ||
      (weightType === "pieces" && (isNaN(numericWeight) || numericWeight < 5))
    ) {
      toast.warning(`Please enter a valid input for ${weightType}.`);
      return;
    }

    let unitTypeToSend = weightType;

    if (weightType === "g") {
      unitTypeToSend = "Kg"; // Change unitType to kg
    }

    try {
      const response = await axios.post(`${baseUrl}/create/cart/${userId}`, {
        productId: id,
        totalPrice: finalPrice,
        weight: responseWeight,
        weight_type: unitTypeToSend,
      });

      toast.success("Your product add to cart successfully");
    } catch (error) {
      console.error("Error creating cart:", error);
    }
  };

  const totalStars = 5;

  return (
    <>
      {product?.map((data, index) => {
        return (
          <div key={index} className="container-fluid px-0 overflow-hidden ">
            <header className="pb-md-4 pb-0">
              <HeaderTop />
              <HeaderMiddle />
              <HeaderBottom />
            </header>

            {/* <section className="breadcrumb-section pt-0">
              <div className="container-fluid-lg">
                <div className="row">
                  <div className="col-12">
                    <div className="breadcrumb-contain">
                      <h2>{data.product_name}</h2>

                      <nav>
                        <ol className="breadcrumb mb-0">
                          <li className="breadcrumb-item">
                            <Link to="/">
                              <i className="fa-solid fa-house" />
                            </Link>
                          </li>
                          <li className="breadcrumb-item active">
                            {data.product_name}
                          </li>
                        </ol>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            </section> */}

            <section className="product-section">
              <div className="container-fluid-lg">
                <div className="row">
                  <div className="col-xxl-9 col-xl-8 col-lg-7 wow fadeInUp">
                    <div className="row g-4">
                      <div className="col-xl-6 wow fadeInUp">
                        <ProductSlider
                          imgSrc={JSON.parse(data.product_image)}
                        />
                        <div className="wow fadeInUp">
                          <div className="right-box-contain">
                            <div className="pickup-box">
                              <div className="product-info">
                                <ul className="product-info-list product-info-list-2">
                                  <li>
                                    <h1></h1>
                                    Type : <a>{data.product_type}</a>
                                  </li>
                                  <li>
                                    SKU : <a>{data.sku}</a>
                                  </li>
                                  <li>
                                    MFG :{" "}
                                    <a>{formatDate(data.manufacturing_date)}</a>
                                  </li>
                                  <li>
                                    Stock : <a>{data.status}</a>
                                  </li>
                                  <li>
                                    Tags : <a>{data.tags}</a>{" "}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-6 wow fadeInUp">
                        <div className="right-box-contain">
                          <h5 className="offer-top">
                            {Math.round(
                              ((data.discount_price - data.product_price) /
                                data.discount_price) *
                                100
                            ) === -Infinity
                              ? 0
                              : Math.round(
                                  ((data.discount_price - data.product_price) /
                                    data.discount_price) *
                                    100
                                )}
                            % off
                          </h5>
                          <div className="d-flex gap-4 center">
                            <div>
                              <span className="name fs-5">{data.product_name}
                              {data.is_washed === 1 && <span className="fs-5 "> &nbsp;(Ozone-Washed) </span>}</span>
                            </div>
                            <div>
                              <BsInfoCircle
                                id="TooltipExample"
                                onClick={() => handleDiscountModal(data.offers)}
                                className="cursor-pointer"
                                title="Offers"
                              />
                            </div>
                          </div>

                          <div className="price-rating">
                            <h3 className="theme-color price">
                              ₹{data.product_price}/{data.weight_type}{" "}
                              <del className="text-content">
                                ₹{data.discount_price}
                              </del>{" "}
                            </h3>
                            <div className="product-rating custom-rate">
                              <ul className="rating">
                                {[...Array(totalStars)].map((_, index) => (
                                  <li key={index}>
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={24}
                                      height={24}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className={`feather feather-star ${
                                        index < averageRating ? "fill" : ""
                                      }`}
                                    >
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                  </li>
                                ))}
                              </ul>
                              <span className="review">
                                {totalRatings} Customer Review
                              </span>
                            </div>
                          </div>

                          {/* coustome Weight */}

                          <div className="product-package d-flex gap-2 center-box">
                            <select
                              style={{ width: "100px", height: "35px" }}
                              className="border-1 rounded"
                              onChange={(e) => {
                                setWeightType(e.target.value);
                                setInputWeight(""); // Clear input when weight type changes
                              }}
                              value={weightType} // Control the select with state
                            >
                              {weight_type === "pieces" && (
                                <option value="pieces">Pieces</option>
                              )}
                              {(weight_type === "Kg" ||
                                weight_type === "g") && (
                                <>
                                  <option value="Kg">Kg</option>
                                  <option value="g">Gram</option>
                                </>
                              )}
                            </select>

                            <div className="rounded-1">
                              {weightType === "Kg" && (
                                <input
                                  type="number"
                                  required
                                  placeholder="Weight"
                                  className="form-control  border-1 w-50"
                                  style={{ width: "100px", height: "35px" }}
                                  value={inputweight}
                                  onChange={handleChange}
                                />
                              )}

                              {weightType === "g" && (
                                <select
                                  style={{ width: "100px", height: "35px" }}
                                  className="rounded-2"
                                  value={inputweight}
                                  onChange={handleChange}
                                >
                                  <option>Select</option>
                                  <option value="0.25">250 g</option>
                                  <option value="0.5">500 g</option>
                                  <option value="0.75">750 g</option>
                                </select>
                              )}

                              {weightType === "pieces" && (
                                <input
                                  type="number"
                                  required
                                  placeholder="Pieces"
                                  className="form-control  border-1"
                                  style={{ width: "100px", height: "35px" }}
                                  value={inputweight}
                                  onChange={handleChange}
                                />
                              )}

                              <div className="text-danger small">
                                {warningMsg}
                              </div>
                              <div>
                                {finalPrice ? (
                                  <h4 className="theme-color price">
                                    MRP: ₹{finalPrice}
                                  </h4>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="note-box product-package">
                            <button
                              onClick={handleClickCart}
                              className="btn btn-animation"
                              disabled={data.stock == 0}
                            >
                              {data.stock == 0 ? "Out of stock" : "Add To Cart"}
                            </button>
                          </div>
                          <div className="buy-box">
                            <Link>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                onClick={handleClickWishlist}
                                height={24}
                                viewBox="0 0 24 24"
                                fill={
                                  isInWishlist ||
                                  (Array.isArray(wishlist) &&
                                    wishlist.some(
                                      (item) =>
                                        item.product_id === data.product_id
                                    ))
                                    ? "red" // Set fill to red if the product is in the wishlist
                                    : "none" // Otherwise, set fill to none (transparent)
                                }
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="feather feather-heart"
                              >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                              <span onClick={handleClickWishlist}>
                                Add To Wishlist
                              </span>
                            </Link>
                          </div>
                          <div className="pickup-box">
                            <div className="product-title">
                              <h4>Product Info:</h4>
                            </div>
                            <div className="pickup-detail">
                              <h4 className="text-content">Vegenmart.com</h4>
                            </div>
                            <div className="product-title">
                              <h4>Store Information:</h4>
                            </div>
                            <div className="pickup-detail">
                              <h4 className="text-content">
                                {data.store_info}
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12 container">
                        <div className="product-section-box">
                          <Nav tabs className="nav nav-tabs custom-nav">
                            <NavItem className="nav-item">
                              <NavLink
                                className={classnames({
                                  active: activeTab === "1",
                                })}
                                onClick={() => {
                                  toggle("1");
                                }}
                              >
                                Descriptions
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                className={classnames({
                                  active: activeTab === "2",
                                })}
                                onClick={() => {
                                  toggle("2");
                                }}
                              >
                                Additional info
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                className={classnames({
                                  active: activeTab === "3",
                                })}
                                onClick={() => {
                                  toggle("3");
                                }}
                              >
                                Care Instructions
                              </NavLink>
                            </NavItem>
                            <NavItem>
                              <NavLink
                                className={classnames({
                                  active: activeTab === "4",
                                })}
                                onClick={() => {
                                  toggle("4");
                                }}
                              >
                                Reviews
                              </NavLink>
                            </NavItem>
                          </Nav>
                          <TabContent
                            activeTab={activeTab}
                            className="tab-content custom-tab"
                          >
                            <TabPane tabId="1" className="tab-pane ">
                              <div className="product-description">
                                <div className="nav-desh">
                                  <h1 className="fs-4 mb-2">{data.product_name} - </h1>
                                  
                                <p className="px-2">   <GoDotFill/> {data.product_description}</p>
                                
                                </div>
                              </div>
                            </TabPane>
                            <TabPane tabId="2" className="tab-pane fade show ">
                              <div
                                className="tab-pane fade active show"
                                id="info"
                                role="tabpanel"
                              >
                                <div className="table-responsive">
                                  <table className="table info-table">
                                    {additionalInfo?.length === 0 ? (
                                      <>
                                        <p className="placeholder-glow">
                                          <span className="placeholder col-12" />
                                        </p>
                                        <p className="placeholder-glow">
                                          <span className="placeholder col-12" />
                                        </p>
                                        <p className="placeholder-glow">
                                          <span className="placeholder col-12" />
                                        </p>
                                      </>
                                    ) : (
                                      additionalInfo?.map((info, index) => (
                                        <tbody key={index}>
                                          <tr>
                                            <td>Specialty</td>
                                            <td>{info.specialty}</td>
                                          </tr>
                                          <tr>
                                            <td>Ingredient Type</td>
                                            <td>{info.ingredient_type}</td>
                                          </tr>
                                          <tr>
                                            <td>Brand</td>
                                            <td>{info.brand}</td>
                                          </tr>
                                          <tr>
                                            <td>Form</td>
                                            <td>{info.form}</td>
                                          </tr>
                                          <tr>
                                            <td>Package Information</td>
                                            <td>{info.package_information}</td>
                                          </tr>
                                          <tr>
                                            <td>Manufacturer</td>
                                            <td>{info.manufacture}</td>
                                          </tr>
                                        </tbody>
                                      ))
                                    )}
                                  </table>
                                </div>
                              </div>
                            </TabPane>
                            <TabPane tabId="3" className="tab-pane fade show ">
                              <div
                                className="tab-pane fade active show"
                                id="care"
                                role="tabpanel"
                              >
                                <div className="information-box">
                                  <ul>
                                    {careInstructions.length === 0 ? (
                                      <li>
                                        <div className="product-description">
                                          <div className="nav-desh">
                                            <p className="placeholder-glow">
                                              <span className="placeholder col-12" />
                                            </p>
                                          </div>
                                        </div>
                                      </li>
                                    ) : (
                                      careInstructions.map((care, index) => (
                                        <li key={index}>
                                          <div className="product-description">
                                            <div className="nav-desh">
                                              <p>{care.care_instruction}</p>
                                            </div>
                                          </div>
                                        </li>
                                      ))
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </TabPane>
                            <TabPane tabId="4" className="tab-pane fade show">
                              <div
                                className="tab-pane fade active show"
                                id="review"
                                role="tabpanel"
                              >
                                <div className="review-box">
                                  <div className="row">
                                    <div className="col-xl-5">
                                      <div className="product-rating-box">
                                        <div className="row">
                                          <div className="col-xl-12">
                                            <div className="product-main-rating">
                                              <h2>
                                                {averageRating}
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width={24}
                                                  height={24}
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  strokeWidth={2}
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  className="feather feather-star"
                                                >
                                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                </svg>
                                              </h2>
                                              <h5>
                                                {totalRatings} Overall Rating
                                              </h5>
                                            </div>
                                          </div>
                                          <div className="col-xl-12">
                                            <ul className="product-rating-list">
                                              {ratingCounts.map(
                                                (count, index) => (
                                                  <li key={index}>
                                                    <div className="rating-product">
                                                      <h5>
                                                        {index + 1}{" "}
                                                        {/* Change to display 1 to 5 stars */}
                                                        <svg
                                                          xmlns="http://www.w3.org/2000/svg"
                                                          width={24}
                                                          height={24}
                                                          viewBox="0 0 24 24"
                                                          fill="none"
                                                          stroke="currentColor"
                                                          strokeWidth={2}
                                                          strokeLinecap="round"
                                                          strokeLinejoin="round"
                                                          className="feather feather-star"
                                                        >
                                                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                        </svg>
                                                      </h5>
                                                      <div className="progress">
                                                        <div
                                                          className="progress-bar"
                                                          style={{
                                                            width: `${(count / totalRatings) * 100}%`,
                                                          }}
                                                        ></div>
                                                      </div>
                                                      <h5 className="total">
                                                        {count}{" "}
                                                        {/* Show the count for each rating */}
                                                      </h5>
                                                    </div>
                                                  </li>
                                                )
                                              )}
                                            </ul>

                                            <div className="review-title-2">
                                              <h4 className="fw-bold">
                                                Review this product
                                              </h4>
                                              <p>
                                                Let other customers know what
                                                you think
                                              </p>
                                              <button
                                                className="btn btn-md btn-theme-outline fw-bold"
                                                type="button"
                                                data-bs-toggle="modal"
                                                data-bs-target="#writereview"
                                                onClick={(e) => {
                                                  if (!authenticated) {
                                                    // If the user is not authenticated, call handleAuth
                                                    handleAuth(e, a); // Assuming 'a' is the argument you want to pass
                                                  } else {
                                                    // If the user is authenticated, call handleOpenModal
                                                    handleOpenModal(data); // Passing 'data' to handleOpenModal
                                                  }
                                                }}
                                              >
                                                Write a review
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-xl-7">
                                      <div className="review-people">
                                        <ul className="review-list">
                                          {reviews.length === 0 ? (
                                            <li>
                                              <p className="placeholder-glow">
                                                <span className="placeholder col-12" />
                                              </p>
                                              <p className="placeholder-glow">
                                                <span className="placeholder col-12" />
                                              </p>
                                              <p className="placeholder-glow">
                                                <span className="placeholder col-12" />
                                              </p>
                                            </li>
                                          ) : (
                                            reviews.map((review, index) => (
                                              <li key={index}>
                                                <div className="people-box">
                                                  <div>
                                                    <div>{review.name}</div>
                                                  </div>
                                                  <div className="people-comment">
                                                    <div className="people-name">
                                                      <div className="date-time">
                                                        <h6 className="text-content">
                                                          {formatDate(
                                                            review.created_at
                                                          )}
                                                        </h6>
                                                        <div className="product-rating">
                                                          <ul className="rating">
                                                            {Array.from(
                                                              { length: 5 },
                                                              (_, index) => {
                                                                const isFilled =
                                                                  index <
                                                                  review.rating;
                                                                return (
                                                                  <li
                                                                    key={index}
                                                                  >
                                                                    <svg
                                                                      xmlns="http://www.w3.org/2000/svg"
                                                                      width={24}
                                                                      height={
                                                                        24
                                                                      }
                                                                      viewBox="0 0 24 24"
                                                                      fill="none"
                                                                      stroke="currentColor"
                                                                      strokeWidth={
                                                                        2
                                                                      }
                                                                      strokeLinecap="round"
                                                                      strokeLinejoin="round"
                                                                      className={`feather feather-star ${
                                                                        isFilled
                                                                          ? "fill"
                                                                          : ""
                                                                      }`}
                                                                    >
                                                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                                                    </svg>
                                                                  </li>
                                                                );
                                                              }
                                                            )}
                                                          </ul>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    <div className="reply">
                                                      <p>{review.comment}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                              </li>
                                            ))
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabPane>
                          </TabContent>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-xxl-3 col-xl-4 col-lg-5 d-none d-lg-block wow fadeInUp">
                    <div className="right-sidebar-box">
                       <Slider {...settings}>
                        {ads.map((adds, index) => (
                          <div className="vendor-box" key={index}>
                            <div className="vendor-contain" style={{backgroundImage:"adds.logo_url"}}>
                              <div className="vendor-image">
                                <img
                                  src={adds.logo_url}
                                  className="blur-up lazyloaded"
                                  alt={adds.company_name}
                                />
                              </div>
                              <div className="vendor-name">
                                <h5 className="fw-500">{adds.company_name}</h5>
                                <div className="product-rating custom-rate">
                                  <ul className="rating">
                                    {[...Array(5)].map((_, idx) => (
                                      <li key={idx}>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width={24}
                                          height={24}
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className={`feather feather-star ${
                                            idx < adds.rating ? "fill" : ""
                                          }`}
                                        >
                                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                      </li>
                                    ))}
                                  </ul>
                                  <span className="review">
                                    {Math.round(adds.rating)} Reviews
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="vendor-detail">
                              {adds.company_details}
                            </p>
                            <div className="vendor-list">
                              <ul>
                                <li>
                                  <div className="address-contact">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={24}
                                      height={24}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="feather feather-map-pin"
                                    >
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                      <circle cx={12} cy={10} r={3} />
                                    </svg>
                                    <h5>
                                      Address:{" "}
                                      <span className="text-content">
                                        {adds.address}
                                      </span>
                                    </h5>
                                  </div>
                                </li>
                                <li>
                                  <div className="address-contact">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={24}
                                      height={24}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="feather feather-headphones"
                                    >
                                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                                    </svg>
                                    <h5>
                                      Contact Seller:{" "}
                                      <span className="text-content">
                                        {adds.contact}
                                      </span>
                                    </h5>
                                  </div>
                                </li>
                              </ul>
                            </div>
                          </div>
                        ))}
                      </Slider> 

                      <div className="section-t-space">
                        <div className="category-menu">
                          <h3>Trending Products</h3>
                          <ProductList />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="product-description mt-3">
                    <div
                      className="banner-contain nav-desh bg-size blur-up lazyloaded"
                      style={{
                        backgroundImage:
                          'url("https://themes.pixelstrap.com/fastkart/assets/images/vegetable/banner/14.jpg")',
                        backgroundSize: "cover",
                        backgroundPosition: "center center",
                        backgroundRepeat: "no-repeat",
                        display: "block",
                      }}
                    >
                      <img
                        src="https://themes.pixelstrap.com/fastkart/assets/images/vegetable/banner/14.jpg"
                        className="bg-img blur-up lazyload"
                        alt=""
                        style={{ display: "none" }}
                      />
                      <div className="banner-details p-center banner-b-space w-100 text-center">
                        <div>
                          <h6 className="ls-expanded theme-color mb-sm-3 mb-1">
                            SUMMER
                          </h6>
                          <h2>VEGETABLE</h2>
                          <p className="mx-auto mt-1">Save up to 5% OFF</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <DetailsPageReleventProduct productId={id} />
                </div>
              </div>
            </section>

            <LoginModal isOpen={loginModal} toggle={toggleLoginModal} />
            <DiscountModal
              isOpen={isModalDiscount}
              toggle={() => setIsModalDiscount(false)}
              onClose={toggleDiscountModal}
              offers={modalData}
            />

            {selectedProduct && (
              <WriteReviewModal
                productId={selectedProduct.product_id}
                productName={selectedProduct.product_name}
                productPrice={selectedProduct.product_price}
                productImage={selectedProduct.product_image}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
              />
            )}
            <Footer />
          </div>
        );
      })}
    </>
  );
}
export default DetailPage;