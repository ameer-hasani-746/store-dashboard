import React, { useState, useRef } from 'react'
import { X, Upload, CheckCircle2, Loader2, DollarSign, Type, Image as ImageIcon, Link as LinkIcon, Check, AlertCircle, Tag } from 'lucide-react'
import { motion } from 'framer-motion'

const AddProductModal = ({ onClose, onSuccess, setActionLoading }) => {
    const [formData, setFormData] = useState({
        product_name: '',
        price: '',
        image_URL: '',
        status: 'Available',
        currency: 'USD'
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setFormData({ ...formData, image_URL: reader.result })
            }
            reader.readAsDataURL(file)
        }
    }

    const handlePaste = (e) => {
        const items = e.clipboardData.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile()
                const reader = new FileReader()
                reader.onloadend = () => {
                    setFormData({ ...formData, image_URL: reader.result })
                }
                reader.readAsDataURL(blob)
            }
        }
    }

    const generateInt8Id = () => {
        // Generate a random unique integer that fits in int8 (up to 2^63 - 1)
        // JavaScript's MAX_SAFE_INTEGER is 2^53 - 1, which fits comfortably in int8.
        return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setActionLoading({ isLoading: true, message: 'Deploying Asset...' })

        try {
            const payload = {
                Product_id: generateInt8Id(),
                product_name: formData.product_name,
                Price: formData.price,
                image_URL: formData.image_URL,
                status: formData.status,
                currency: formData.currency
            }

            const response = await fetch('https://cuisocsasddsad.app.n8n.cloud/webhook/ece8e658-d631-4f6e-b4e7-81a1793b8508', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || `Error ${response.status}`)
            }

            setSuccess(true)
            setTimeout(() => {
                onSuccess()
            }, 1500)
        } catch (error) {
            console.error('Submission Error:', error)
            alert(`Deployment failed: ${error.message}`)
        } finally {
            setLoading(false)
            setActionLoading({ isLoading: false, message: '' })
        }
    }

    return (
        <div className="modal-overlay" onPaste={handlePaste}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="premium-card modal-content"
                onClick={(e) => e.stopPropagation()}
            >

                {success ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6"
                        >
                            <Check size={40} />
                        </motion.div>
                        <h3 className="text-3xl font-bold mb-3 font-display">Asset Deployed</h3>
                        <p className="text-text-secondary">Inventory database has been updated successfully.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold mb-2 font-display">List New Item</h2>
                            <p className="text-text-secondary text-sm">Add a high-quality photo and details for your product.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* 1. Image Dropzone */}
                            <div className="form-group">
                                <label className="form-label">
                                    <ImageIcon size={14} /> Product Visualization
                                </label>
                                {formData.image_URL ? (
                                    <div className="dropzone-preview-container">
                                        <img src={formData.image_URL} alt="Preview" className="dropzone-preview" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image_URL: '' })}
                                            className="remove-image-btn"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className={`dropzone ${isDragging ? 'dragging' : ''}`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            setIsDragging(false);
                                            const file = e.dataTransfer.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setFormData({ ...formData, image_URL: reader.result });
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                                            <Upload className="text-accent-primary" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-text-primary">Drop image, Paste or Click</p>
                                            <p className="text-xs text-text-muted mt-1">PNG, JPG or SVG up to 5MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            hidden
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 2. Product Name */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Type size={14} /> Designation
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Quantum CPU V2"
                                    value={formData.product_name}
                                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                                />
                            </div>

                            {/* 3. Price & Currency */}
                            <div className="form-group">
                                <label className="form-label">
                                    <DollarSign size={14} /> Financial Valuation
                                </label>
                                <div className="currency-input-group">
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="flex-1"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                    <div className="currency-toggle">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, currency: 'USD' })}
                                            className={`currency-btn ${formData.currency === 'USD' ? 'active' : ''}`}
                                        >
                                            USD
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, currency: 'SYP' })}
                                            className={`currency-btn ${formData.currency === 'SYP' ? 'active' : ''}`}
                                        >
                                            SYP
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Availability Status */}
                            <div className="form-group">
                                <label className="form-label">
                                    <AlertCircle size={14} /> Operational Status
                                </label>
                                <div className="status-grid">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'Available' })}
                                        className={`status-btn ${formData.status === 'Available' ? 'active-Available' : ''}`}
                                    >
                                        {formData.status === 'Available' && <Check size={16} />}
                                        Available
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'Not Available' })}
                                        className={`status-btn ${formData.status === 'Not Available' ? 'active-NotAvailable' : ''}`}
                                    >
                                        {formData.status === 'Not Available' && <X size={16} />}
                                        Unavailable
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 btn-secondary py-4 justify-center text-lg font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={loading || !formData.image_URL}
                                    type="submit"
                                    className="flex-[2] btn-primary py-4 justify-center text-lg font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        "Deploy Asset"
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default AddProductModal
