import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const ActionLoading = ({ isLoading, message = "Processing..." }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="action-loading-overlay"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="action-loading-popup"
                    >
                        <div className="action-loading-content">
                            <Loader2 className="animate-spin text-accent-primary mb-3" size={32} />
                            <p className="text-sm font-medium text-text-primary">{message}</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ActionLoading
