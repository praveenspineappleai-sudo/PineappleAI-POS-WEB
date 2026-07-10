import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import SaveButton from '../../components/buttons/SaveButton';
import AddButton from '../../components/buttons/AddButton';
import NewProduct from '../../models/AddCategory';
import SelectPopup from '../../models/SelectPopup';
import ViewProduct from '../../models/ViewProduct';
import DeleteConfirmationPopup from '../../models/DeleteConfirmation';
import AddAttributes from '../../models/AddAttributes';
import NewBarcode from '../../models/NewBarcode';
import AddBarcode from '../../models/AddBarcode';
import { fetchCategories, createCategory, getCategoryName } from '../../integration/CategoryAPI';
import { fetchColors, createColor, getColorName } from '../../integration/ColorsAPI';
import { fetchSizes, createSize, getSizeName } from '../../integration/SizeAPI';
import {
    createProduct,
    getCategoryIdByName,
    getColorIdByName,
    getSizeIdByName
} from '../../integration/ProductAPI';
import { updateProductWithPrice } from '../../integration/EditProductAPI';
import { useToast } from '../../contexts/ToastContext';
import colorIcon from '../../assets/icons/color.png';
import priceIcon from '../../assets/icons/price.png';
import sizeIcon from '../../assets/icons/size.png';
import quantityIcon from '../../assets/icons/quantity.png';
import deleteIcon from '../../assets/icons/delete.png';
import dropdownIcon from '../../assets/icons/dropdown.png';
import '../../styles/addproduct.css';

// Validation function for product name
const validateProductName = (name) => {
    if (!name || name.trim() === '') {
        return { isValid: false, message: 'Product name is required' };
    }

    // Check if name contains only numbers
    if (/^\d+$/.test(name.trim())) {
        return {
            isValid: false,
            message: 'Product name cannot contain only numbers'
        };
    }

    // Check if name contains only special characters (no letters or numbers)
    const onlySpecialChars = /^[^a-zA-Z0-9]+$/.test(name.trim());
    if (onlySpecialChars) {
        return {
            isValid: false,
            message: 'Product name cannot contain only special characters'
        };
    }

    // Check if name contains at least one letter (alphabet character)
    const hasLetter = /[a-zA-Z]/.test(name.trim());
    if (!hasLetter) {
        return {
            isValid: false,
            message: 'Product name must contain at least one letter'
        };
    }

    return { isValid: true, message: '' };
};

const AddProduct = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const editMode = location.state?.editMode || false;
    const editProductData = location.state?.productData || null;

    // Basic details state
    const [basicDetails, setBasicDetails] = useState({
        name: editProductData?.name || '',
        category: editProductData?.category || '',
        description: editProductData?.description || ''
    });

    // Validation state
    const [validationErrors, setValidationErrors] = useState({
        name: '',
        category: '',
        description: ''
    });

    // Product attributes state
    const [productAttributes, setProductAttributes] = useState({
        quantity: editProductData?.quantity || '',
        costPrice: editProductData?.costPrice || '',
        sellingPrice: editProductData?.sellingPrice || '',
        color: editProductData?.color || '',
        size: editProductData?.size || '',
        barcode: editProductData?.barcode || ''
    });

    // Data states
    const [allCategories, setAllCategories] = useState([]);
    const [categoriesRaw, setCategoriesRaw] = useState([]);
    const [colors, setColors] = useState([]);
    const [colorsRaw, setColorsRaw] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [sizesRaw, setSizesRaw] = useState([]);

    // Loading states
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingColors, setLoadingColors] = useState(false);
    const [loadingSizes, setLoadingSizes] = useState(false);
    const [categoryError, setCategoryError] = useState(null);

    // Modal states
    const [newProductModalOpen, setNewProductModalOpen] = useState(false);
    const [newProductModalType, setNewProductModalType] = useState(null);
    const [selectPopupOpen, setSelectPopupOpen] = useState(false);
    const [selectPopupType, setSelectPopupType] = useState(null);
    const [addAttributesOpen, setAddAttributesOpen] = useState(false);

    // Product management states
    const [addedProducts, setAddedProducts] = useState([]);
    const [viewProductOpen, setViewProductOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showProductAttributes, setShowProductAttributes] = useState(false);

    // Delete confirmation state
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);

    // Category creation states - REMOVED: newCategoryName, categoryAttributes, isCreatingNewCategory
    const [isCreatingCategory, setIsCreatingCategory] = useState(false); // For API creation

    // Barcode states - IMPORTANT: Track whether barcode was generated or custom
    const [barcodePopupOpen, setBarcodePopupOpen] = useState(false);
    const [addBarcodePopupOpen, setAddBarcodePopupOpen] = useState(false);
    const [pendingProduct, setPendingProduct] = useState(null);
    const [barcodeMode, setBarcodeMode] = useState(null); // 'generated' or 'custom'

    // Category custom attributes - persisted in localStorage
    const [categoryCustomAttributes, setCategoryCustomAttributes] = useState(() => {
        try {
            const saved = localStorage.getItem('categoryCustomAttributes');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading category attributes from localStorage:', error);
            return {};
        }
    });

    // Default attributes that ALWAYS show for ALL categories
    const defaultAttributes = [
        { labelName: 'Size', fieldName: 'size', type: 'select', icon: sizeIcon },
        { labelName: 'Colour', fieldName: 'color', type: 'select', icon: colorIcon },
        { labelName: 'Quantity', fieldName: 'quantity', type: 'number', alwaysShow: true },
        { labelName: 'Cost Price', fieldName: 'costPrice', type: 'number', alwaysShow: true },
        { labelName: 'Selling Price', fieldName: 'sellingPrice', type: 'number', alwaysShow: true }
    ];

    // Save categoryCustomAttributes to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('categoryCustomAttributes', JSON.stringify(categoryCustomAttributes));
        } catch (error) {
            console.error('Error saving category attributes to localStorage:', error);
        }
    }, [categoryCustomAttributes]);

    // Get attributes for current category - FIXED VERSION (no duplicate color)
    const getCurrentCategoryAttributes = () => {
        const allAttrs = [...defaultAttributes];

        if (basicDetails.category) {
            const categoryLower = basicDetails.category.toLowerCase();
            const customAttrs = categoryCustomAttributes[categoryLower];

            // Add custom attributes if any
            if (customAttrs?.length > 0) {
                customAttrs.forEach(customAttr => {
                    const labelName = customAttr.labelName?.toLowerCase() || '';
                    const fieldName = labelName.replace(/\s+/g, '_');
                    
                    // Skip if it's already in default attributes (check both color and colour variants)
                    const isDefault = [
                        'size', 
                        'color', 
                        'colour',
                        'quantity', 
                        'costprice', 
                        'sellingprice'
                    ].includes(fieldName);
                    
                    if (!isDefault) {
                        allAttrs.push({
                            labelName: customAttr.labelName,
                            fieldName: fieldName,
                            type: 'text',
                            isCustom: true
                        });
                    }
                });
            }
        }

        return allAttrs;
    };

    // Load categories - SIMPLIFIED VERSION
    const loadCategories = async () => {
        setLoadingCategories(true);
        setCategoryError(null);
        try {
            const categories = await fetchCategories();
            if (categories?.length > 0) {
                setCategoriesRaw(categories);
                const categoryNames = categories.map(cat => getCategoryName(cat));
                const validCategoryNames = categoryNames.filter(name => name?.trim() !== '');
                setAllCategories(validCategoryNames);
                
            } else {
                setCategoriesRaw([]);
                setAllCategories([]);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            setCategoryError('Failed to load categories from server');
            setCategoriesRaw([]);
            setAllCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Load colors
    const loadColors = async () => {
        setLoadingColors(true);
        try {
            const colorsData = await fetchColors();
            if (colorsData?.length > 0) {
                setColorsRaw(colorsData);
                const colorNames = colorsData.map(color => getColorName(color));
                const validColorNames = colorNames.filter(name => name?.trim() !== '');
                setColors(validColorNames);
            } else {
                setColorsRaw([]);
                setColors([]);
            }
        } catch (error) {
            console.error('Failed to load colors:', error);
            setColorsRaw([]);
            setColors([]);
        } finally {
            setLoadingColors(false);
        }
    };

    // Load sizes
    const loadSizes = async () => {
        setLoadingSizes(true);
        try {
            const sizesData = await fetchSizes();
            if (sizesData?.length > 0) {
                setSizesRaw(sizesData);
                const sizeNames = sizesData.map(size => getSizeName(size));
                const validSizeNames = sizeNames.filter(name => name?.trim() !== '');
                setSizes(validSizeNames);
            } else {
                setSizesRaw([]);
                setSizes([]);
            }
        } catch (error) {
            console.error('Failed to load sizes:', error);
            setSizesRaw([]);
            setSizes([]);
        } finally {
            setLoadingSizes(false);
        }
    };

    // Load initial data
    useEffect(() => {
        loadCategories();
        loadColors();
        loadSizes();
    }, []);

    // Show product attributes when basic details are filled
    useEffect(() => {
        if (editMode) {
            setShowProductAttributes(true);
        } else {
            const isBasicDetailsFilled = basicDetails.name.trim() !== '' &&
                basicDetails.category.trim() !== '' &&
                basicDetails.description.trim() !== '';
            setShowProductAttributes(isBasicDetailsFilled);
        }
    }, [basicDetails, editMode]);

    // Validate basic details
    const validateBasicDetails = () => {
        const errors = {
            name: '',
            category: '',
            description: ''
        };

        // Validate product name
        const nameValidation = validateProductName(basicDetails.name);
        if (!nameValidation.isValid) {
            errors.name = nameValidation.message;
        }

        // Validate category
        if (!basicDetails.category.trim()) {
            errors.category = 'Category is required';
        }

        // Validate description
        if (!basicDetails.description.trim()) {
            errors.description = 'Description is required';
        }

        setValidationErrors(errors);
        return !errors.name && !errors.category && !errors.description;
    };

    // Handle basic details change
    const handleBasicDetailsChange = (field, value) => {
        const updatedDetails = { ...basicDetails, [field]: value };
        setBasicDetails(updatedDetails);

        // Clear validation error for this field
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Validate product name in real-time
        if (field === 'name') {
            const nameValidation = validateProductName(value);
            if (value.trim() !== '' && !nameValidation.isValid) {
                setValidationErrors(prev => ({ ...prev, name: nameValidation.message }));
            } else if (value.trim() === '') {
                setValidationErrors(prev => ({ ...prev, name: '' }));
            }
        }

        if (field === 'category') {
            // Reset only custom attributes, keep default attributes
            setProductAttributes(prev => ({
                quantity: prev.quantity,
                costPrice: prev.costPrice,
                sellingPrice: prev.sellingPrice,
                color: prev.color,
                size: prev.size,
                barcode: '',
                ...Object.keys(prev).reduce((acc, key) => {
                    if (!['quantity', 'costPrice', 'sellingPrice', 'color', 'size', 'barcode'].includes(key)) {
                        acc[key] = '';
                    }
                    return acc;
                }, {})
            }));

            if (!editMode) {
                const isBasicDetailsFilled = updatedDetails.name.trim() !== '' &&
                    updatedDetails.category.trim() !== '' &&
                    updatedDetails.description.trim() !== '';
                setShowProductAttributes(isBasicDetailsFilled);
            }
        }
    };

    // Handle attributes change
    const handleAttributesChange = (field, value) => {
        setProductAttributes(prev => ({ ...prev, [field]: value }));
    };

    // Handle barcode generation - UPDATED: Only generate barcode when clicked
    const handleGenerateBarcode = () => {
        if (pendingProduct) {
            setBarcodeMode('generated');
            const generatedBarcode = `BAR${Math.floor(100000 + Math.random() * 900000)}`;
            
            const newProduct = {
                ...pendingProduct,
                barcode: generatedBarcode,
                status: parseInt(pendingProduct.quantity) === 0 ? 'Out of stock' :
                    parseInt(pendingProduct.quantity) <= 10 ? 'Low stock' : 'In stock'
            };

            setAddedProducts(prev => [...prev, newProduct]);
            setProductAttributes({ quantity: '', costPrice: '', sellingPrice: '', color: '', size: '', barcode: '' });
            setBarcodePopupOpen(false);
            setPendingProduct(null);
            showToast('Success', 'Product variant added successfully with generated barcode!', 'success');
        }
    };

    // Handle add barcode - UPDATED: Use custom barcode only
    const handleAddBarcode = (barcodeValue) => {
        if (pendingProduct && barcodeValue.trim() !== '') {
            setBarcodeMode('custom');
            const newProduct = {
                ...pendingProduct,
                barcode: barcodeValue.trim(),
                status: parseInt(pendingProduct.quantity) === 0 ? 'Out of stock' :
                    parseInt(pendingProduct.quantity) <= 10 ? 'Low stock' : 'In stock'
            };

            setAddedProducts(prev => [...prev, newProduct]);
            setProductAttributes({ quantity: '', costPrice: '', sellingPrice: '', color: '', size: '', barcode: '' });
            setAddBarcodePopupOpen(false);
            setPendingProduct(null);
            showToast('Success', 'Product variant added successfully with custom barcode!', 'success');
        }
    };

    // Open add barcode popup
    const handleOpenAddBarcode = () => {
        setBarcodePopupOpen(false);
        setAddBarcodePopupOpen(true);
    };

    // Add product variant
    const handleAddProduct = () => {
        // First validate basic details
        if (!validateBasicDetails()) {
            showToast('Validation Error', 'Please fix the errors in basic details before adding product', 'warning');
            return;
        }

        const currentAttributes = getCurrentCategoryAttributes();
        const validationErrors = currentAttributes
            .filter(attr => attr.alwaysShow && !productAttributes[attr.fieldName])
            .map(attr => attr.labelName);

        if (validationErrors.length > 0) {
            showToast('Validation Error', `Please fill in: ${validationErrors.join(', ')}`, 'warning');
            return;
        }

        if (!basicDetails.name || !basicDetails.category) {
            showToast('Validation Error', 'Please enter product name and select a category', 'warning');
            return;
        }

        // Validate product name again before adding
        const nameValidation = validateProductName(basicDetails.name);
        if (!nameValidation.isValid) {
            showToast('Validation Error', nameValidation.message, 'warning');
            return;
        }

        const productWithoutBarcode = {
            id: Date.now(),
            ...basicDetails,
            ...productAttributes,
        };

        setPendingProduct(productWithoutBarcode);
        setBarcodePopupOpen(true);
    };

    // Final add product
    const handleFinalAdd = () => {
        // Validate basic details first
        if (!validateBasicDetails()) {
            showToast('Validation Error', 'Please fix the errors in basic details', 'warning');
            return;
        }

        if (editMode) {
            const validationErrors = getCurrentCategoryAttributes()
                .filter(attr => attr.alwaysShow && !productAttributes[attr.fieldName])
                .map(attr => attr.labelName);

            if (validationErrors.length > 0) {
                showToast('Validation Error', `Please fill in all required fields: ${validationErrors.join(', ')}`, 'warning');
                return;
            }
            setViewProductOpen(true);
            return;
        }

        if (addedProducts.length === 0) {
            showToast('Validation Error', 'Please add at least one product variant', 'warning');
            return;
        }

        setViewProductOpen(true);
    };

    // Cancel
    const handleCancel = () => navigate('/product-management');

    // Delete variant
    const handleDeleteVariant = (index) => {
        setAddedProducts(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteClick = (index) => {
        setProductToDelete(index);
        setDeleteConfirmationOpen(true);
    };

    const handleConfirmDelete = () => {
        if (productToDelete !== null) {
            handleDeleteVariant(productToDelete);
            setDeleteConfirmationOpen(false);
            setProductToDelete(null);
            showToast('Success', 'Product variant deleted successfully!', 'success');
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
        setProductToDelete(null);
    };

    // Save product - UPDATED: Pass correct barcode to API
    const handleNext = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Validate product name one more time before saving
            const nameValidation = validateProductName(basicDetails.name);
            if (!nameValidation.isValid) {
                showToast('Error', nameValidation.message, 'error');
                setIsSubmitting(false);
                return;
            }

            if (editMode && editProductData) {
                const finalCategoryId = getCategoryIdByName(basicDetails.category, categoriesRaw);
                const finalColorId = getColorIdByName(productAttributes.color, colorsRaw);
                const finalSizeId = getSizeIdByName(productAttributes.size, sizesRaw);

                if (!finalCategoryId) {
                    showToast('Error', 'Invalid category selected. Please select a valid category.', 'error');
                    setIsSubmitting(false);
                    return;
                }

                const updateData = {
                    name: basicDetails.name,
                    description: basicDetails.description || '',
                    category_id: finalCategoryId,
                    quantity: parseInt(productAttributes.quantity),
                    cost_price: parseFloat(productAttributes.costPrice || 0),
                    selling_price: parseFloat(productAttributes.sellingPrice),
                };

                if (productAttributes.color && finalColorId) updateData.color_id = finalColorId;
                if (productAttributes.size && finalSizeId) updateData.size_id = finalSizeId;

                const result = await updateProductWithPrice(
                    editProductData.id,
                    editProductData.priceId,
                    updateData
                );

                if (result.success) {
                    setViewProductOpen(false);
                    navigate('/product-management', { state: { refresh: true, productUpdated: true } });
                } else {
                    showToast('Error', `Failed to update product: ${result.error}`, 'error');
                    setIsSubmitting(false);
                }

            } else {
                const categoryId = getCategoryIdByName(addedProducts[0].category, categoriesRaw);

                if (!categoryId) {
                    showToast('Error', 'Invalid category selected. Please try again.', 'error');
                    setIsSubmitting(false);
                    return;
                }

                const productData = {
                    name: addedProducts[0].name,
                    description: addedProducts[0].description || '',
                    category_id: categoryId,
                };

                const variations = addedProducts.map(product => {
                    const colorId = getColorIdByName(product.color, colorsRaw);
                    const sizeId = getSizeIdByName(product.size, sizesRaw);

                    const variation = {
                        quantity: parseInt(product.quantity),
                        cost_price: parseFloat(product.costPrice || 0),
                        selling_price: parseFloat(product.sellingPrice),
                    };

                    // Add barcode to the variation if it exists
                    if (product.barcode && product.barcode.trim() !== '') {
                        variation.barcode = product.barcode.trim();
                        console.log(`📦 Setting barcode for variant: ${product.barcode}`);
                    }

                    if (colorId) variation.color_id = colorId;
                    if (sizeId) variation.size_id = sizeId;

                    return variation;
                });

                console.log('📤 Creating product with variations:', variations);
                const result = await createProduct(productData, variations);

                if (result.success) {
                    setViewProductOpen(false);
                    navigate('/product-management', { state: { refresh: true, newProductAdded: true } });
                } else {
                    showToast('Error', `Failed to create product: ${result.error}`, 'error');
                    setIsSubmitting(false);
                }
            }
        } catch (error) {
            console.error('Error saving product:', error);
            showToast('Error', error.message || 'Failed to save product. Please try again.', 'error');
            setIsSubmitting(false);
        }
    };

    // Modal handlers
    const handleOpenNewProductModal = (type) => {
        setNewProductModalType(type);
        setNewProductModalOpen(true);
    };

    const handleCloseNewProductModal = () => {
        setNewProductModalOpen(false);
        setNewProductModalType(null);
    };

   // Add new item (category, color, size)
    const handleAddNewItem = async (value) => {
        const capitalized = value.charAt(0).toUpperCase() + value.slice(1);

        if (newProductModalType === 'category') {
            if (allCategories.includes(capitalized)) {
                showToast('Warning', `Category "${capitalized}" already exists. Please select it from the list.`, 'warning');
                handleCloseNewProductModal();
                return;
            }

            setIsCreatingCategory(true); // Start API creation

            try {
                console.log(`📤 Creating category "${capitalized}" on backend...`);
                const createdCategory = await createCategory(capitalized); // now always works
                const newCategoryObject = {
                   id: createdCategory.id,
                   name: capitalized,
                   category_name: capitalized,
                   attributes: []
                };


                setCategoriesRaw(prev => [...prev, newCategoryObject]);
                setAllCategories(prev => [...prev, capitalized]);
                
                // Set the category as selected immediately
                handleBasicDetailsChange('category', capitalized);
                
                // Show success message
                showToast('Success', `Category "${capitalized}" created successfully!`, 'success');
                
            } catch (error) {
                console.error('❌ Failed to create category on backend:', error);
                showToast('Error', `Failed to create category "${capitalized}" on server. Please try again.`, 'error');
                
                // Even if backend fails, continue with local creation
                const newCategoryObject = {
                    id: Date.now(),
                    name: capitalized,
                    category_name: capitalized,
                    attributes: []
                };

                setCategoriesRaw(prev => [...prev, newCategoryObject]);
                setAllCategories(prev => [...prev, capitalized]);
                
                // Set the category as selected immediately
                handleBasicDetailsChange('category', capitalized);
                
                showToast('Warning', `Category "${capitalized}" added locally.`, 'warning');
            } finally {
                setIsCreatingCategory(false);
                handleCloseNewProductModal();
            }
        } else {
            try {
                if (newProductModalType === 'color') {
                    await createColor(capitalized);
                    await loadColors();
                    handleAttributesChange('color', capitalized);
                } else if (newProductModalType === 'size') {
                    await createSize(capitalized);
                    await loadSizes();
                    handleAttributesChange('size', capitalized);
                }
            } catch (error) {
                console.error(`Failed to create ${newProductModalType}:`, error);
                showToast('Error', `Failed to create ${newProductModalType}. Please try again.`, 'error');

                if (newProductModalType === 'color') {
                    setColors(prev => [...prev, capitalized]);
                    handleAttributesChange('color', capitalized);
                } else if (newProductModalType === 'size') {
                    setSizes(prev => [...prev, capitalized]);
                    handleAttributesChange('size', capitalized);
                }
            }
            handleCloseNewProductModal();
        }
    };


    // Select item from popup - FIXED: Correct function names
    const handleOpenSelectPopup = (type) => {
        setSelectPopupType(type);
        setSelectPopupOpen(true);
    };

    const handleCloseSelectPopup = () => {
        setSelectPopupOpen(false);
        setSelectPopupType(null);
    };

    const handleSelectItem = (selectedValue) => {
        const capitalized = selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1);
        if (selectPopupType === 'category') {
            handleBasicDetailsChange(selectPopupType, capitalized);
        } else {
            handleAttributesChange(selectPopupType, capitalized);
        }
        handleCloseSelectPopup();
    };

    // Get existing items for select popup
    const getExistingItems = () => {
        switch (selectPopupType) {
            case 'category': return allCategories;
            case 'color': return colors;
            case 'size': return sizes;
            default: return [];
        }
    };

    const getSelectPopupTitle = () => {
        switch (selectPopupType) {
            case 'category': return loadingCategories ? 'Loading categories...' : 'Select category';
            case 'color': return loadingColors ? 'Loading colors...' : 'Select colour';
            case 'size': return loadingSizes ? 'Loading sizes...' : 'Select size';
            default: return 'Select item';
        }
    };

    // Render attribute field
    const renderAttributeField = (attribute) => {
        const { labelName, fieldName, type } = attribute;

        if (type === 'select') {
            const items = fieldName === 'color' ? colors : sizes;
            const loading = fieldName === 'color' ? loadingColors : loadingSizes;
            const placeholder = loading ? "Loading..." : `Select ${labelName.toLowerCase()}`;

            return (
                <div className={`form-group ${fieldName}-field`}>
                    <label>{labelName}</label>
                    <div className={`${fieldName}-input-container`}>
                        <div className="select-wrapper">
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={productAttributes[fieldName] || ''}
                                readOnly
                                className={`form-input ${fieldName}-input`}
                                onClick={() => !loading && handleOpenSelectPopup(fieldName)}
                                disabled={loading}
                            />
                            <img src={dropdownIcon} alt="Dropdown" className="dropdown-icon" />
                        </div>
                        <div className="add-button-container">
                            <AddButton
                                onClick={() => handleOpenNewProductModal(fieldName)}
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>
            );
        } else {
            const placeholder = `Type your ${labelName.toLowerCase()}`;
            return (
                <div className={`form-group ${fieldName}-field`}>
                    <label>{labelName}</label>
                    <input
                        type={type === 'number' ? 'number' : 'text'}
                        placeholder={placeholder}
                        value={productAttributes[fieldName] || ''}
                        onChange={(e) => handleAttributesChange(fieldName, e.target.value)}
                        className="form-input"
                    />
                </div>
            );
        }
    };

    // Navigation handlers
    const handleDashboardClick = () => navigate('/dashboard');
    const handleProductClick = () => navigate('/product-management');
    const handleSalesClick = () => navigate('/sales-management');
    const handleLogoClick = () => navigate('/');

    // Get view product data
    const getViewProductData = () => {
        if (editMode && editProductData) {
            return {
                basicDetails: {
                    name: basicDetails.name,
                    category: basicDetails.category,
                    description: basicDetails.description
                },
                addedProducts: [{
                    id: editProductData.id,
                    color: productAttributes.color,
                    size: productAttributes.size,
                    quantity: productAttributes.quantity,
                    sellingPrice: productAttributes.sellingPrice,
                    costPrice: productAttributes.costPrice
                    // Removed barcode to match UI design
                }]
            };
        } else {
            return {
                basicDetails: addedProducts.length > 0 ? {
                    name: addedProducts[0].name,
                    category: addedProducts[0].category,
                    description: addedProducts[0].description
                } : null,
                addedProducts: addedProducts.map(p => ({
                    id: p.id,
                    color: p.color,
                    size: p.size,
                    quantity: p.quantity,
                    sellingPrice: p.sellingPrice,
                    costPrice: p.costPrice
                    // Removed barcode to match UI design
                }))
            };
        }
    };

    const viewProductData = getViewProductData();
    const currentCategoryAttributes = getCurrentCategoryAttributes();

    return (
        <div className="add-product-page">
            <Sidebar
                activeItem="product"
                onDashboardClick={handleDashboardClick}
                onProductClick={handleProductClick}
                onSalesClick={handleSalesClick}
                onLogoClick={handleLogoClick}
            />

            <Header
                title={editMode ? "Edit Product" : "Add Products"}
                subtitle={editMode ? "Update the product information below" : "Fill in the product information below"}
            />

            <div className="add-product-content">
                <div className="form-containers-wrapper">
                    {/* Basic Details */}
                    <div className="form-container">
                        <div className="container-header">
                            <h3 className="container-title">Basic details</h3>
                        </div>
                        <div className="container-content">
                            <div className="basic-details-grid">
                                <div className="form-group name-field">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        placeholder="E.g. T-shirt"
                                        value={basicDetails.name}
                                        onChange={(e) => handleBasicDetailsChange('name', e.target.value)}
                                        className="form-input"
                                    />
                                    {validationErrors.name && (
                                        <span className="validation-error">{validationErrors.name}</span>
                                    )}
                                </div>

                                <div className="form-group description-field">
                                    <label>Description</label>
                                    <textarea
                                        placeholder="Type your description"
                                        value={basicDetails.description}
                                        onChange={(e) => handleBasicDetailsChange('description', e.target.value)}
                                        className="form-textarea"
                                        rows="3"
                                    />
                                    {validationErrors.description && (
                                        <span className="validation-error">{validationErrors.description}</span>
                                    )}
                                </div>

                                <div className="form-group category-field">
                                    <label>Category</label>
                                    <div className="category-input-container">
                                        <div className="select-wrapper">
                                            <input
                                                type="text"
                                                placeholder={loadingCategories ? "Loading..." : "Search category"}
                                                value={basicDetails.category}
                                                readOnly
                                                className="form-input category-input"
                                                onClick={() => !loadingCategories && handleOpenSelectPopup('category')}
                                                disabled={loadingCategories}
                                            />
                                            <img src={dropdownIcon} alt="Dropdown" className="dropdown-icon" />
                                        </div>
                                        <div className="add-button-container">
                                            <AddButton
                                                onClick={() => handleOpenNewProductModal('category')}
                                                disabled={loadingCategories || isCreatingCategory}
                                            />
                                        </div>
                                    </div>
                                    {validationErrors.category && (
                                        <span className="validation-error">{validationErrors.category}</span>
                                    )}
                                    {categoryError && <span className="category-error">{categoryError}</span>}
                                    {!showProductAttributes && !editMode && (
                                        <span className="category-hint">*Select a category to view and add relevant product attributes.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Attributes */}
                    {showProductAttributes && (
                        <div className="form-container">
                            <div className="container-header">
                                <h3 className="container-title">attributes</h3>
                            </div>
                            <div className="container-content">
                                <div className="product-attributes-grid">
                                    <div className="attribute-row first-row">
                                        {currentCategoryAttributes
                                            .filter(attr => ['color', 'size', 'quantity'].includes(attr.fieldName))
                                            .map(attribute => (
                                                <React.Fragment key={attribute.fieldName}>
                                                    {renderAttributeField(attribute)}
                                                </React.Fragment>
                                            ))}
                                    </div>

                                    <div className="attribute-row second-row">
                                        {currentCategoryAttributes
                                            .filter(attr => ['sellingPrice', 'costPrice'].includes(attr.fieldName))
                                            .map(attribute => (
                                                <React.Fragment key={attribute.fieldName}>
                                                    {renderAttributeField(attribute)}
                                                </React.Fragment>
                                            ))}
                                        <div className="form-group empty-field"></div>
                                    </div>

                                    {currentCategoryAttributes
                                        .filter(attr => attr.isCustom)
                                        .map(attribute => (
                                            <div className="attribute-row" key={attribute.fieldName}>
                                                {renderAttributeField(attribute)}
                                            </div>
                                        ))}
                                </div>
                                {!editMode && (
                                    <div className="form-actions">
                                        <SaveButton onClick={handleAddProduct} title="Add" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Added Products */}
                    {!editMode && addedProducts.length > 0 && (
                        <div className="form-container">
                            <div className="container-header">
                                <h3 className="container-title">Added product</h3>
                            </div>
                            <div className="container-content">
                                <div className="product-cards-grid">
                                    {addedProducts.map((product, index) => (
                                        <div key={product.id} className="product-card">
                                            <div className="product-card-header">
                                                <h4 className="product-card-title">Attributes {index + 1}</h4>
                                                <button
                                                    className="delete-variant-btn"
                                                    onClick={() => handleDeleteClick(index)}
                                                    title="Delete this variant"
                                                >
                                                    <img src={deleteIcon} alt="Delete" className="delete-icon" />
                                                </button>
                                            </div>
                                            <div className="product-card-content">
                                                {product.color && product.color.trim() !== '' && (
                                                    <div className="product-attribute">
                                                        <img src={colorIcon} alt="Color" className="attr-icon" />
                                                        <div className="attr-details">
                                                            <span className="attr-label">Color</span>
                                                            <span className="attr-value">{product.color}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {product.size && product.size.trim() !== '' && (
                                                    <div className="product-attribute">
                                                        <img src={sizeIcon} alt="Size" className="attr-icon" />
                                                        <div className="attr-details">
                                                            <span className="attr-label">Size</span>
                                                            <span className="attr-value">{product.size}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {product.quantity && (
                                                    <div className="product-attribute">
                                                        <img src={quantityIcon} alt="Quantity" className="attr-icon" />
                                                        <div className="attr-details">
                                                            <span className="attr-label">Quantity</span>
                                                            <span className="attr-value">{product.quantity}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {product.sellingPrice && (
                                                    <div className="product-attribute">
                                                        <img src={priceIcon} alt="Price" className="attr-icon" />
                                                        <div className="attr-details">
                                                            <span className="attr-label">Price</span>
                                                            <span className="attr-value">Rs {product.sellingPrice}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="final-actions">
                                    <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                                    <button onClick={handleFinalAdd} className="final-add-btn">Add</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {editMode && (
                        <div className="final-actions">
                            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                            <button onClick={handleFinalAdd} className="final-add-btn">Update</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <NewProduct
                isOpen={newProductModalOpen}
                onClose={handleCloseNewProductModal}
                type={newProductModalType}
                onAdd={handleAddNewItem}
            />

            <SelectPopup
                isOpen={selectPopupOpen}
                onClose={handleCloseSelectPopup}
                onSave={handleSelectItem}
                title={getSelectPopupTitle()}
                existingOptions={getExistingItems()}
                type="select"
            />

            <ViewProduct
                isOpen={viewProductOpen}
                onClose={() => setViewProductOpen(false)}
                addedProducts={viewProductData.addedProducts}
                basicDetails={viewProductData.basicDetails}
                onNext={handleNext}
                onDeleteVariant={handleDeleteVariant}
                isSubmitting={isSubmitting}
                showBarcodeButton={false}
            />

            <DeleteConfirmationPopup
                isOpen={deleteConfirmationOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />

            {/* Removed AddAttributes modal from render */}

            <NewBarcode
                isOpen={barcodePopupOpen}
                onClose={() => {
                    setBarcodePopupOpen(false);
                    setPendingProduct(null);
                }}
                onAddBarcode={handleAddBarcode}
                onGenerateBarcode={handleGenerateBarcode}
                onOpenAddBarcode={handleOpenAddBarcode}
            />

            <AddBarcode
                isOpen={addBarcodePopupOpen}
                onClose={() => {
                    setAddBarcodePopupOpen(false);
                    setPendingProduct(null);
                }}
                onSave={handleAddBarcode}
                pendingProduct={pendingProduct}
            />
        </div>
    );
};

export default AddProduct;