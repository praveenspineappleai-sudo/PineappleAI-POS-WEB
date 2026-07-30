///src/models/AddCategory.js
import React, { useState } from 'react';
import ProcessOrderButton from '../components/buttons/ProceedOrderButton';
import { createCategory } from '../integration/CategoryAPI';
import '../styles/addcategory.css';

// This component is a popup for adding a new category, color, size, or custom attribute value.
const AddCategory = ({
    isOpen,
    onClose,
    type,
    onAdd,
    existingItems = []
}) => {
    const [inputValue, setInputValue] = useState('');

    // Handle adding new category, color, size, or custom attribute value
    const handleAdd = () => {
        if (inputValue.trim() !== '') {
            // Capitalize first letter
            const capitalized = inputValue.trim().charAt(0).toUpperCase() + inputValue.trim().slice(1);

            // Call parent handler
            onAdd(capitalized);

            // Reset input
            setInputValue('');

            // Close modal
            onClose();
        }
    };

    // Handle Enter key press for adding item
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    // Close modal when clicking outside
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
            setInputValue(''); // Reset input when closing
        }
    };

    if (!isOpen) return null;

    // Known built-in types
    const builtInTypes = ['category', 'color', 'size'];

    // Capitalize attribute name for display (e.g. "sample attributes" => "Sample attributes")
    const attrDisplayName = type
        ? type.charAt(0).toUpperCase() + type.slice(1)
        : 'Item';

    // Function to determine title based on type
    const getTitle = () => {
        switch (type) {
            case 'category': return 'Add category';
            case 'color':    return 'Add colour';
            case 'size':     return 'Add size';
            default:         return `Add ${attrDisplayName}`;  // e.g. "Add Material"
        }
    };

    // Function to determine label based on type
    const getLabel = () => {
        switch (type) {
            case 'category': return 'Category';
            case 'color':    return 'Colour';
            case 'size':     return 'Size';
            default:         return attrDisplayName;           // e.g. "Material"
        }
    };

    // Function to determine placeholder based on type
    const getPlaceholder = () => {
        switch (type) {
            case 'category': return 'Type your category name';
            case 'color':    return 'Type your colour name';
            case 'size':     return 'Type your size';
            default:         return `Type your ${type ? type.toLowerCase() : 'item'} value`;
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{getTitle()}</h2>
                    <button className="modal-close-btn" onClick={() => {
                        onClose();
                        setInputValue('');
                    }}>
                        &#x2715;
                    </button>
                </div>

                <div className="modal-content">
                    <div className="modal-form-group">
                        <label className="modal-label">{getLabel()}</label>
                        <input
                            type="text"
                            placeholder={getPlaceholder()}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="modal-input"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <ProcessOrderButton
                        onClick={handleAdd}
                        title="Add"
                        disabled={inputValue.trim() === ''}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddCategory;