///src/models/Barcode.js
import React, { useRef, useState, useEffect } from 'react';
import downloadIcon from '../assets/icons/download.png';
import printIcon from '../assets/icons/print.png';
import { fetchBarcodeImage } from '../integration/BarcodeScannerAPI';
import '../styles/barcode.css';

const Barcode = ({ isOpen, onClose, barcodeData = '', barcodeId = null, isLoading = false, error = null, variantData = null }) => {
    const barcodeRef = useRef(null);// Ref for barcode display area
    const [barcodeImage, setBarcodeImage] = useState(null);// State to hold fetched barcode image URL
    const [imageLoading, setImageLoading] = useState(false);// State to track if barcode image is loading
    const [imageError, setImageError] = useState(null);// State to track if there was an error loading the barcode image
    const [imageFetchFailed, setImageFetchFailed] = useState(false);// State to track if barcode image fetch failed, used to determine if we should show fallback visual

    // Reset states when popup closes
    useEffect(() => {
        if (!isOpen) {
            setBarcodeImage(null);
            setImageLoading(false);
            setImageError(null);
            setImageFetchFailed(false);
        }
    }, [isOpen]);

    // Fetch barcode image when barcodeId is available
    useEffect(() => {
        if (isOpen && barcodeId && !barcodeImage && !imageLoading && !imageFetchFailed) {
            fetchBarcodeImageData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, barcodeId]);

    // Function to fetch barcode image from API
    const fetchBarcodeImageData = async () => {
        if (!barcodeId) return;
        
        setImageLoading(true);
        setImageError(null);
        setImageFetchFailed(false);
        
        try {
            console.log(`🖼️ Fetching barcode image for ID: ${barcodeId}`);
            const result = await fetchBarcodeImage(barcodeId);
            
            if (result.success && result.imageUrl) {
                setBarcodeImage(result.imageUrl);
                console.log('✅ Barcode image loaded successfully');
            } else {
                throw new Error(result.error || 'Failed to load barcode image');
            }
        } catch (error) {
            console.error('❌ Error loading barcode image:', error);
            // Don't show error to user, just use fallback visual
            setImageFetchFailed(true);
            console.log('ℹ️ Using fallback barcode visual');
        } finally {
            setImageLoading(false);
        }
    };

    if (!isOpen) return null;

    // Don't show popup if there's no barcode data and there's an error
    if (!barcodeData && error) {
        return null;
    }

    // Handle close action
    const handleCloseBarcode = () => {
        onClose();
    };

    // Handle download action
    const handleDownload = async () => {
        if (!barcodeData) {
            alert('No barcode available to download');
            return;
        }

        console.log('Downloading barcode:', barcodeData, 'Variant:', variantData);
        
        try {
            // If we have a barcode image, download it directly
            if (barcodeImage) {
                const response = await fetch(barcodeImage);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `barcode-${barcodeData}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                return;
            }
            
            // Fallback: Generate barcode image from text with correct dimensions and DPI
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Calculate dimensions for 50x25mm at 300 DPI
            const dpi = 300;
            const widthInMm = 50;
            const heightInMm = 25;
            
            // Convert mm to pixels at 300 DPI (1 inch = 25.4 mm)
            const widthInPixels = Math.round((widthInMm / 25.4) * dpi);
            const heightInPixels = Math.round((heightInMm / 25.4) * dpi);
            
            // Set canvas dimensions
            canvas.width = widthInPixels;
            canvas.height = heightInPixels;
            
            // White background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the barcode visual with Code 128 style spacing
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 36px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw barcode pattern centered
            const barcodeText = '▌▌ ▌▌▌▌ ▌▌▌';
            ctx.fillText(barcodeText, canvas.width / 2, canvas.height * 0.4);
            
            // Draw barcode number below
            ctx.font = 'bold 18px Arial';
            ctx.fillText(barcodeData, canvas.width / 2, canvas.height * 0.75);
            
            // Convert to data URL and trigger download
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `barcode-${barcodeData}.png`;
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading barcode:', error);
            alert('Failed to download barcode image');
        }
    };

    const handlePrint = () => {
        if (!barcodeData) {
            alert('No barcode available to print');
            return;
        }

        console.log('Printing barcode:', barcodeData, 'Variant:', variantData);
        
        // Create print content with correct dimensions
        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Barcode - ${barcodeData}</title>
                    <style>
                        @page {
                            size: auto;
                            margin: 0;
                        }
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            margin: 0;
                            font-family: Arial, sans-serif;
                        }
                        .barcode-display {
                            text-align: center;
                            padding: 10px;
                            width: 50mm;
                            height: 25mm;
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            border: 1px solid #ddd;
                        }
                        .barcode-image {
                            max-width: 90%;
                            height: auto;
                        }
                        .barcode-visual {
                            font-size: 14pt;
                            font-weight: bold;
                            font-family: 'Courier New', monospace;
                            letter-spacing: 2pt;
                            margin: 5px 0;
                        }
                        .barcode-number {
                            font-size: 9pt;
                            font-weight: bold;
                            margin-top: 5px;
                        }
                        @media print {
                            body {
                                height: 25mm;
                            }
                            .barcode-display {
                                border: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="barcode-display">
                        ${barcodeImage ? 
                            `<img src="${barcodeImage}" alt="Barcode" class="barcode-image" />` : 
                            `<div class="barcode-visual">▌▌ ▌▌▌▌ ▌▌▌</div>`
                        }
                        <div class="barcode-number">${barcodeData}</div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => {
                                window.close();
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    return (
        <div className="barcode-overlay" onClick={handleCloseBarcode}>
            <div className="barcode-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="barcode-header">
                    <h2 className="barcode-title">Barcode</h2>
                    <button className="barcode-close" onClick={handleCloseBarcode}>
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="barcode-body">
                    {/* Loading State */}
                    {(isLoading || imageLoading) && (
                        <div className="barcode-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading barcode...</p>
                        </div>
                    )}

                    {/* Error State - Show error message only if there's a critical error */}
                    {error && !isLoading && !imageLoading && !barcodeData && (
                        <div className="barcode-error">
                            <p className="error-message">Error: {error}</p>
                            <p className="error-info">Unable to load barcode. Please try again.</p>
                        </div>
                    )}

                    {/* Barcode Display - Show if we have barcode data */}
                    {!isLoading && !imageLoading && barcodeData && (
                        <>
                            <div className="barcode-display" ref={barcodeRef}>
                                {barcodeImage ? (
                                    <>
                                        <img 
                                            src={barcodeImage} 
                                            alt="Barcode" 
                                            className="barcode-image"
                                            onError={(e) => {
                                                console.error('Failed to load barcode image');
                                                setBarcodeImage(null);
                                                setImageFetchFailed(true);
                                            }}
                                        />
                                        <div className="barcode-number">{barcodeData}</div>
                                    </>
                                ) : (
                                    <>
                                        <div className="barcode-visual">
                                            ▌▌ ▌▌▌▌ ▌▌▌
                                        </div>
                                        <div className="barcode-number">{barcodeData}</div>
                                        {imageFetchFailed && (
                                            <div className="barcode-fallback-note">
                                                <small style={{ color: '#999', fontSize: '12px' }}>
                                                    (Image not available - showing barcode number)
                                                </small>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Action Buttons - Always show if we have barcode data */}
                            <div className="barcode-actions">
                                <button 
                                    className="barcode-btn barcode-btn-download"
                                    onClick={handleDownload}
                                >
                                    <img src={downloadIcon} alt="Download" className="btn-icon" />
                                    Download
                                </button>
                                <button 
                                    className="barcode-btn barcode-btn-print"
                                    onClick={handlePrint}
                                >
                                    <img src={printIcon} alt="Print" className="btn-icon" />
                                    Print
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Barcode;