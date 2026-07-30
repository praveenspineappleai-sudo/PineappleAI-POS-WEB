// ProductManagement.js - Only Actual Barcodes (No Fallback)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import Pagination from '../../components/Pagination';
import StatsCards2 from '../../components/StatsCards2';
import Search from '../../components/Search';
import ProcessOrderButton from '../../components/buttons/ProceedOrderButton';
import ViewProduct from '../../models/ViewProduct';
import { fetchProducts } from '../../integration/ProductAPI';
import { fetchCategories, getCategoryName } from '../../integration/CategoryAPI';
import { getColorName } from '../../integration/ColorsAPI';
import { getSizeName } from '../../integration/SizeAPI';
import { fetchProductWithBarcode } from '../../integration/BarcodeScannerAPI';
import { useToast } from '../../contexts/ToastContext';
import limitIcon from '../../assets/icons/limit.png';
import viewIcon from '../../assets/icons/view.png';
import editIcon from '../../assets/icons/edit.png';
import '../../styles/productmanagement.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [viewProductOpen, setViewProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productBarcodes, setProductBarcodes] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const entriesPerPage = 10;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleClickOutside = (event) => {
      if (!event.target.closest('.th-with-icon-wrapper')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Fetch barcode for a single product with timeout
  const fetchSingleBarcode = async (productId, variantData = null, timeoutMs = 3000) => {
    const variantKey = variantData ?
      `${productId}_${variantData.color}_${variantData.size}`.replace(/\s+/g, '_') :
      productId.toString();

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      );

      const fetchPromise = fetchProductWithBarcode(productId, variantData);

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (result.success && result.barcode && result.barcode.barcodeNo) {
        return {
          variantKey,
          barcode: result.barcode.barcodeNo
        };
      } else {
        return {
          variantKey,
          barcode: null
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch barcode for ${variantKey}:`, error.message);
      return {
        variantKey,
        barcode: null
      };
    }
  };

  // Transform products with existing barcodes only
  const transformProductsQuick = (productsData) => {
    return productsData.map(product => {
      const productId = product.id || product.product_id;
      const priceId = product.price_id || product.priceId || product.id;

      // Extract color - handle empty/null values
      let color = getColorName(product.color) || product.color_name || '';
      color = (color === 'Default' || color === 'N/A') ? '' : color;

      // Extract size - handle empty/null values
      let size = getSizeName(product.size) || product.size_name || '';
      size = (size === 'Default' || size === 'N/A') ? '' : size;

      const variantKey = `${productId}_${color}_${size}`.replace(/\s+/g, '_');

      // Get barcode from multiple possible fields
      let existingBarcode = '';
      if (product.barcode && product.barcode.trim() !== '') {
        existingBarcode = product.barcode;
      } else if (product.barcode_no && product.barcode_no.trim() !== '') {
        existingBarcode = product.barcode_no;
      } else if (product.barcodeNo && product.barcodeNo.trim() !== '') {
        existingBarcode = product.barcodeNo;
      } else if (product.Barcode && product.Barcode.barcode_no && product.Barcode.barcode_no.trim() !== '') {
        existingBarcode = product.Barcode.barcode_no;
      }

      // Extract custom attributes - any fields not in the standard set
      const standardKeys = [
        'id', 'product_id', 'price_id', 'priceId', 'name', 'product_name',
        'barcode', 'barcode_no', 'barcodeNo', 'Barcode',
        'category', 'category_name', 'category_id', 'categorys_id',
        'color', 'color_name', 'color_id',
        'size', 'size_name', 'size_id',
        'quantity', 'stock',
        'selling_price', 'price', 'cost_price',
        'description', 'created_at', 'createdAt',
        'status', 'customAttributes'
      ];
      const extractedCustomAttributes = { ...(product.customAttributes || {}) };
      Object.keys(product).forEach(key => {
        if (!standardKeys.includes(key) && product[key] !== undefined && product[key] !== null && product[key] !== '') {
          extractedCustomAttributes[key] = product[key];
        }
      });

      return {
        id: productId,
        priceId: priceId,
        variantKey: variantKey,
        name: product.name || product.product_name || 'Unknown Product',
        barcode: existingBarcode,
        category: getCategoryName(product.category) || product.category_name || 'Uncategorized',
        price: `Rs ${formatPrice(product.selling_price || product.price || 0)}`,
        stock: product.quantity || product.stock || 0,
        status: getStockStatus(product.quantity || product.stock || 0),
        color: color,
        size: size,
        costPrice: product.cost_price || 0,
        sellingPrice: product.selling_price || product.price || 0,
        description: product.description || '',
        created_at: product.created_at || product.createdAt || new Date().toISOString(),
        category_id: product.category_id || product.categorys_id,
        color_id: product.color_id,
        size_id: product.size_id,
        customAttributes: extractedCustomAttributes
      };
    }).sort((a, b) => b.id - a.id);
  };

  // Fetch missing barcodes in parallel (background)
  const fetchBarcodesInBackground = async (products) => {
    // Filter products that don't have barcodes
    const productsNeedingBarcodes = products.filter(product =>
      !product.barcode || product.barcode.trim() === ''
    );

    if (productsNeedingBarcodes.length === 0) {
      console.log('✅ All products already have barcodes');
      return;
    }

    console.log(`🔍 Fetching barcodes for ${productsNeedingBarcodes.length} products...`);

    const barcodePromises = productsNeedingBarcodes.map(product => {
      const variantData = {
        color: product.color,
        size: product.size,
        productId: product.id
      };
      return fetchSingleBarcode(product.id, variantData, 3000);
    });

    try {
      const barcodeResults = await Promise.all(barcodePromises);

      const barcodeMap = {};
      barcodeResults.forEach(result => {
        if (result.barcode) {
          barcodeMap[result.variantKey] = result.barcode;
        }
      });

      setProductBarcodes(barcodeMap);

      // Update products with fetched barcodes
      setAllProducts(prevProducts =>
        prevProducts.map(product => {
          const newBarcode = barcodeMap[product.variantKey];
          if (newBarcode) {
            return { ...product, barcode: newBarcode };
          }
          return product;
        })
      );

      setFilteredProducts(prevProducts =>
        prevProducts.map(product => {
          const newBarcode = barcodeMap[product.variantKey];
          if (newBarcode) {
            return { ...product, barcode: newBarcode };
          }
          return product;
        })
      );

      console.log('✅ Barcodes updated successfully');
    } catch (error) {
      console.error('❌ Error fetching barcodes:', error);
    }
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📄 Fetching all products from API...');
      const productsData = await fetchProducts();
      console.log('📦 Products received from API:', productsData);

      if (productsData && productsData.length > 0) {
        // Quick transform with existing barcodes only
        const transformedProducts = transformProductsQuick(productsData);
        setAllProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
        console.log('✅ Products loaded successfully:', transformedProducts.length);

        setLoading(false); // Stop loading immediately

        // Fetch missing barcodes in background
        fetchBarcodesInBackground(transformedProducts);
      } else {
        console.log('ℹ️ No products found in API');
        setAllProducts([]);
        setFilteredProducts([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      setError('Failed to load products from server');
      setAllProducts([]);
      setFilteredProducts([]);
      setLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      console.log('📂 Fetching categories...');
      const categoriesData = await fetchCategories();
      console.log('📦 Categories received from API:', categoriesData);

      if (categoriesData && categoriesData.length > 0) {
        const categoryNames = categoriesData.map(cat => getCategoryName(cat));
        const validCategoryNames = categoryNames.filter(name => name && name.trim() !== '');
        setCategories(validCategoryNames);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Failed to load categories:', error);
      setCategories([]);
    }
  }, []);

  // Initial load - only once
  useEffect(() => {
    console.log('🚀 ProductManagement component mounted');
    loadProducts();
    loadCategories();
  }, []); // Empty dependency array - only run once

  // Handle location state changes
  useEffect(() => {
    const state = location.state;
    if (state) {
      if (state.newProductAdded) {
        console.log('📄 New product added, refreshing...');
        showToast('Success', 'Product created successfully!', 'success');
        loadProducts();
        navigate(location.pathname, { replace: true, state: {} });
      } else if (state.productUpdated) {
        console.log('✏️ Product updated, refreshing...');
        showToast('Success', 'Product updated successfully!', 'success');
        loadProducts();
        navigate(location.pathname, { replace: true, state: {} });
      } else if (state.refresh) {
        console.log('🔄 Refresh triggered by navigation state');
        loadProducts();
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state]); // Only depend on location.state

  // Search, Category, Status filtering and Sorting
  useEffect(() => {
    let result = [...allProducts];

    // Search filter
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchLower)) ||
        (product.barcode && product.barcode.toLowerCase().includes(searchLower)) ||
        (product.category && product.category.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(product =>
        product.category && product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Status filter
    if (selectedStatus !== 'All') {
      result = result.filter(product =>
        product.status && product.status.toLowerCase() === selectedStatus.toLowerCase()
      );
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key] || '';
        let valB = b[sortConfig.key] || '';

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, sortConfig, allProducts]);

  const formatPrice = (price) => {
    if (!price) return '0';
    const numberPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) : price;
    return numberPrice.toLocaleString('en-IN');
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'Out of stock';
    if (quantity <= 10) return 'Low stock';
    return 'In stock';
  };

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / entriesPerPage);

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const products = getCurrentPageProducts();

  const stats = {
    totalProducts: filteredProducts.length,
    lowStock: filteredProducts.filter(p => p.status === 'Low stock').length,
    outOfStock: filteredProducts.filter(p => p.status === 'Out of stock').length,
    categories: [...new Set(filteredProducts.map(p => p.category))].length,
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const getAllProductVariants = (productName) => {
    return allProducts.filter(product => product.name === productName);
  };

  const handleView = (productId) => {
    const product = filteredProducts.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setViewProductOpen(true);
    }
  };

  const handleEdit = (product) => {
    console.log('🔧 Editing product:', product);
    navigate('/add-product', {
      state: {
        editMode: true,
        productData: {
          id: product.id,
          priceId: product.priceId,
          name: product.name,
          category: product.category,
          description: product.description,
          color: product.color,
          size: product.size,
          quantity: product.stock,
          costPrice: product.costPrice,
          sellingPrice: product.sellingPrice,
          category_id: product.category_id,
          color_id: product.color_id,
          size_id: product.size_id,
          variantKey: product.variantKey,
          barcode: product.barcode,
          customAttributes: product.customAttributes
        }
      }
    });
  };

  const handleCloseViewProduct = () => {
    setViewProductOpen(false);
    setSelectedProduct(null);
  };

  const getViewProductData = () => {
    if (!selectedProduct) return { basicDetails: null, addedProducts: [] };

    const allVariants = getAllProductVariants(selectedProduct.name);

    const basicDetails = {
      name: selectedProduct.name,
      category: selectedProduct.category,
      description: selectedProduct.description || `High-quality ${selectedProduct.name} from our ${selectedProduct.category} collection.`
    };

    const addedProducts = allVariants.map(variant => {
      const variantBarcode = productBarcodes[variant.variantKey] || variant.barcode;

      return {
        id: variant.id,
        variantKey: variant.variantKey,
        color: variant.color || 'N/A',
        size: variant.size || 'N/A',
        quantity: variant.stock,
        sellingPrice: variant.sellingPrice || variant.price.replace('Rs ', '').replace(/,/g, ''),
        costPrice: variant.costPrice || 0,
        barcode: variantBarcode || 'Not assigned',
        customAttributes: variant.customAttributes || {}
      };
    });

    return { basicDetails, addedProducts };
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'In stock': return 'status-in-stock';
      case 'Low stock': return 'status-low-stock';
      case 'Out of stock': return 'status-out-of-stock';
      default: return '';
    }
  };

  const viewProductData = getViewProductData();

  if (loading) {
    return (
      <div className="product-management-page">
        <Sidebar
          activeItem="product"
          onDashboardClick={() => navigate('/dashboard')}
          onProductClick={() => navigate('/product-management')}
          onSalesClick={() => navigate('/sales-management')}
        />
        <Header
          title="Product management"
          subtitle="Manage products, prices, and inventory easily."
        />
        <div className="content-wrapper">
          <div className="loading-state">
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && allProducts.length === 0) {
    return (
      <div className="product-management-page">
        <Sidebar
          activeItem="product"
          onDashboardClick={() => navigate('/dashboard')}
          onProductClick={() => navigate('/product-management')}
          onSalesClick={() => navigate('/sales-management')}
        />
        <Header
          title="Product management"
          subtitle="Manage products, prices, and inventory easily."
        />
        <div className="content-wrapper">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadProducts} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-management-page">
      <Sidebar
        activeItem="product"
        onDashboardClick={() => navigate('/dashboard')}
        onProductClick={() => navigate('/product-management')}
        onSalesClick={() => navigate('/sales-management')}
      />

      <Header
        title="Product management"
        subtitle="Manage products, prices, and inventory easily."
      />

      <div className="content-wrapper">
        <div className="product-stats-wrapper">
          <StatsCards2 stats={stats} />
        </div>

        <div className="product-list-section">
          <div className="product-list-header">
            <div className="search-section">
              <Search
                onSearch={handleSearch}
                value={searchTerm}
                placeholder="Search by product name or barcode"
              />
            </div>
            <ProcessOrderButton
              onClick={handleAddProduct}
              title={isMobile ? "+" : "+ Add Product"}
              className={isMobile ? "mobile-add-btn" : ""}
            />
          </div>

          <div className="product-table-container">
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <p>
                  {searchTerm
                    ? `No products found matching "${searchTerm}"`
                    : 'No products found. Click "+ Add Product" to create your first product.'
                  }
                </p>
              </div>
            ) : (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>
                      <div className="th-with-icon-wrapper">
                        <div 
                          className="th-with-icon" 
                          onClick={() => setActiveDropdown(activeDropdown === 'product' ? null : 'product')}
                          title="Sort products"
                        >
                          Product
                          {sortConfig.key === 'name' && (
                            <span className="sort-arrow">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                          <img 
                            src={limitIcon} 
                            alt="Filter Product" 
                            className={`limit-icon ${sortConfig.key === 'name' ? 'active-filter' : ''}`} 
                          />
                        </div>
                        {activeDropdown === 'product' && (
                          <div className="filter-dropdown-menu">
                            <div className="dropdown-header-title">Sort Product</div>
                            <div 
                              className={`dropdown-item ${sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSortConfig({ key: 'name', direction: 'asc' });
                                setActiveDropdown(null);
                              }}
                            >
                              Sort A to Z (Ascending)
                            </div>
                            <div 
                              className={`dropdown-item ${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSortConfig({ key: 'name', direction: 'desc' });
                                setActiveDropdown(null);
                              }}
                            >
                              Sort Z to A (Descending)
                            </div>
                            {sortConfig.key === 'name' && (
                              <div 
                                className="dropdown-item reset-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSortConfig({ key: null, direction: null });
                                  setActiveDropdown(null);
                                }}
                              >
                                Clear Sort
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th>Barcode</th>
                    <th>
                      <div className="th-with-icon-wrapper">
                        <div 
                          className="th-with-icon"
                          onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
                          title="Filter category"
                        >
                          Category
                          {selectedCategory !== 'All' && <span className="active-tag">{selectedCategory}</span>}
                          {sortConfig.key === 'category' && (
                            <span className="sort-arrow">{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                          )}
                          <img 
                            src={limitIcon} 
                            alt="Filter Category" 
                            className={`limit-icon ${selectedCategory !== 'All' || sortConfig.key === 'category' ? 'active-filter' : ''}`} 
                          />
                        </div>
                        {activeDropdown === 'category' && (
                          <div className="filter-dropdown-menu">
                            <div className="dropdown-header-title">Filter Category</div>
                            <div 
                              className={`dropdown-item ${selectedCategory === 'All' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory('All');
                                setActiveDropdown(null);
                              }}
                            >
                              All Categories
                            </div>
                            {categories.map(cat => (
                              <div 
                                key={cat}
                                className={`dropdown-item ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCategory(cat);
                                  setActiveDropdown(null);
                                }}
                              >
                                {cat}
                              </div>
                            ))}
                            <div className="dropdown-divider"></div>
                            <div className="dropdown-header-title">Sort Category</div>
                            <div 
                              className={`dropdown-item ${sortConfig.key === 'category' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSortConfig({ key: 'category', direction: 'asc' });
                                setActiveDropdown(null);
                              }}
                            >
                              Category A to Z
                            </div>
                            <div 
                              className={`dropdown-item ${sortConfig.key === 'category' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSortConfig({ key: 'category', direction: 'desc' });
                                setActiveDropdown(null);
                              }}
                            >
                              Category Z to A
                            </div>
                            {(selectedCategory !== 'All' || sortConfig.key === 'category') && (
                              <div 
                                className="dropdown-item reset-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCategory('All');
                                  if (sortConfig.key === 'category') setSortConfig({ key: null, direction: null });
                                  setActiveDropdown(null);
                                }}
                              >
                                Clear Category Filter
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>
                      <div className="th-with-icon-wrapper">
                        <div 
                          className="th-with-icon"
                          onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                          title="Filter status"
                        >
                          Status
                          {selectedStatus !== 'All' && <span className="active-tag">{selectedStatus}</span>}
                          <img 
                            src={limitIcon} 
                            alt="Filter Status" 
                            className={`limit-icon ${selectedStatus !== 'All' ? 'active-filter' : ''}`} 
                          />
                        </div>
                        {activeDropdown === 'status' && (
                          <div className="filter-dropdown-menu">
                            <div className="dropdown-header-title">Filter Status</div>
                            {['All', 'In stock', 'Low stock', 'Out of stock'].map(st => (
                              <div 
                                key={st}
                                className={`dropdown-item ${selectedStatus === st ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStatus(st);
                                  setActiveDropdown(null);
                                }}
                              >
                                {st === 'All' ? 'All Statuses' : st}
                              </div>
                            ))}
                            {selectedStatus !== 'All' && (
                              <div 
                                className="dropdown-item reset-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStatus('All');
                                  setActiveDropdown(null);
                                }}
                              >
                                Clear Status Filter
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.variantKey}>
                      <td className="product-name">
                        <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{product.name}</div>
                      </td>
                      <td className="product-barcode">
                        {product.barcode || '-'}
                      </td>
                      <td className="product-category">{product.category}</td>
                      <td className="product-price">{product.price}</td>
                      <td className="product-stock">{product.stock}</td>
                      <td className="product-status">
                        <span className={`status-badge ${getStatusClass(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="product-actions">
                        <button className="action-icon-btn view-btn" onClick={() => handleView(product.id)}>
                          <img src={viewIcon} alt="View" />
                        </button>
                        <button className="action-icon-btn edit-btn" onClick={() => handleEdit(product)}>
                          <img src={editIcon} alt="Edit" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {filteredProducts.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalEntries={totalProducts}
            entriesPerPage={entriesPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <ViewProduct
        isOpen={viewProductOpen}
        onClose={handleCloseViewProduct}
        addedProducts={viewProductData.addedProducts}
        basicDetails={viewProductData.basicDetails}
        showNextButton={false}
        onNext={handleCloseViewProduct}
        showBarcodeButton={true}
      />
    </div>
  );
};

export default ProductManagement;