import React, { useState } from 'react'
import { Trash2, ToggleLeft, ToggleRight, ImageIcon, CheckCircle2, AlertCircle, Loader2, Package, Tag, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ProductList = ({ products, onRefresh, setActionLoading }) => {
    const [processingId, setProcessingId] = useState(null)

    const handleToggleStatus = async (product) => {
        const newStatus = product.status === 'Available' ? 'Not Available' : 'Available'
        if (!confirm(`Change status to "${newStatus}"?`)) return

        try {
            setProcessingId(product.Product_id)
            setActionLoading({ isLoading: true, message: 'Shifting Status...' })
            const response = await fetch('https://cuisocsasddsad.app.n8n.cloud/webhook/c2f21765-a97e-4309-9f81-2220948fc461', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...product,
                    status: newStatus
                })
            })

            if (!response.ok) throw new Error('Failed to update status')
            await onRefresh()
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error updating status. Please try again.')
        } finally {
            setProcessingId(null)
            setActionLoading({ isLoading: false, message: '' })
        }
    }

    const handleDelete = async (product) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

        try {
            setProcessingId(product.Product_id)
            setActionLoading({ isLoading: true, message: 'Decommissioning Asset...' })
            const response = await fetch('https://cuisocsasddsad.app.n8n.cloud/webhook/d5b0ae14-76d3-48df-a3b4-9c1511fe7e6b', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            })

            if (!response.ok) throw new Error('Failed to delete product')
            await onRefresh()
        } catch (error) {
            console.error('Error deleting product:', error)
            alert('Error deleting product. Please try again.')
        } finally {
            setProcessingId(null)
            setActionLoading({ isLoading: false, message: '' })
        }
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-text-muted">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Package size={40} className="opacity-20 text-indigo-400" />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">Inventory Empty</p>
                    <p className="text-sm opacity-50">No products match your current filter.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="product-grid">
            <AnimatePresence>
                {products.map((product, index) => (
                    <motion.div
                        layout
                        key={product.Product_id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="product-card"
                    >
                        {/* Image Container */}
                        <div className="product-image-container">
                            <div className="status-floating-badge">
                                <span className={`badge ${product.status === 'Available' ? 'badge-success' : 'badge-warning shadow-lg'}`}>
                                    {product.status || 'Unknown'}
                                </span>
                            </div>

                            {product.image_URL ? (
                                <img
                                    src={product.image_URL}
                                    alt={product.product_name}
                                    className="product-image"
                                    loading="lazy"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'; }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-bg-tertiary">
                                    <ImageIcon className="text-text-muted opacity-20" size={48} />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="product-card-content">
                            <div className="product-info-header">
                                <h4 className="product-title" title={product.product_name}>
                                    {product.product_name || 'Unnamed Asset'}
                                </h4>
                                <span className="product-id-tag">ID: {product.Product_id}</span>
                            </div>

                            <div className="product-price-section">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-text-muted uppercase font-bold tracking-tighter opacity-50 mb-1">Price Point</span>
                                    <div className="price-display">
                                        {product.Price}
                                    </div>
                                </div>

                                <div className="product-card-actions">
                                    <button
                                        disabled={processingId === product.Product_id}
                                        onClick={() => handleToggleStatus(product)}
                                        className="card-action-btn"
                                        title="Shift Status"
                                    >
                                        {processingId === product.Product_id ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : product.status === 'Available' ? (
                                            <ToggleRight size={22} className="text-success" />
                                        ) : (
                                            <ToggleLeft size={22} className="text-text-muted" />
                                        )}
                                    </button>
                                    <button
                                        disabled={processingId === product.Product_id}
                                        onClick={() => handleDelete(product)}
                                        className="card-action-btn delete"
                                        title="Decommission Product"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}

export default ProductList
