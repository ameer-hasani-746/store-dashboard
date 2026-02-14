import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, User, DollarSign, Calendar, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderList = ({ setActionLoading }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
            if (data && data.length > 0 && !selectedOrder) {
                setSelectedOrder(data[0]);
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setActionLoading({ isLoading: true, message: `Updating status to ${newStatus}...` });
            const { error } = await supabase
                .from('Orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            console.error('Update status error:', err);
        } finally {
            setActionLoading({ isLoading: false, message: '' });
        }
    };

    const statuses = [
        { name: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: <Clock size={16} /> },
        { name: 'Processing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: <RefreshCcw size={16} />, live: true },
        { name: 'Shipped', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', icon: <Truck size={16} /> },
        { name: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: <CheckCircle size={16} /> },
        { name: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: <XCircle size={16} /> }
    ];

    if (loading) return (
        <div className="empty-state-orders">
            <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p>Fetching Secure Ledger...</p>
        </div>
    );

    if (orders.length === 0) return (
        <div className="empty-state-orders">
            <ShoppingBag size={48} style={{ opacity: 0.1, marginBottom: '20px' }} />
            <h3 style={{ color: 'white' }}>No Orders Found</h3>
            <p>Your incoming order queue is currently empty.</p>
        </div>
    );

    return (
        <div className="order-console">
            {/* Inbox Sidebar */}
            <div className="order-sidebar">
                <div className="order-sidebar-header">
                    <div>
                        <h3 style={{ color: 'white', margin: 0 }}>Incoming</h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{orders.length} active events</p>
                    </div>
                    <button onClick={fetchOrders} className="p-2 hover:bg-white/5 rounded-lg text-[#64748b]">
                        <RefreshCcw size={18} />
                    </button>
                </div>

                <div className="order-inbox-list custom-scrollbar">
                    {orders.map((order) => {
                        const s = statuses.find(st => st.name === order.status) || statuses[0];
                        const isActive = selectedOrder?.id === order.id;
                        return (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className={`order-inbox-item ${isActive ? 'active' : ''}`}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '700', color: 'white', fontSize: '14px' }}>{order.customer_name}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--accent-primary)', fontSize: '13px' }}>
                                        ${parseFloat(order.total_price).toFixed(2)}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div className={s.live && order.status === 'Processing' ? 'live-pulse' : ''} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.color }}></div>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: s.color, textTransform: 'uppercase' }}>{order.status}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Details Panel */}
            <div className="order-details-container custom-scrollbar">
                <AnimatePresence mode="wait">
                    {selectedOrder ? (
                        <motion.div
                            key={selectedOrder.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                        >
                            <div className="order-receipt-header">
                                <div>
                                    <div className="order-id-chip" style={{ marginBottom: '12px' }}>#{selectedOrder.id}</div>
                                    <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'white', margin: '0 0 8px 0' }}>{selectedOrder.customer_name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} /> {new Date(selectedOrder.created_at).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <User size={14} /> {selectedOrder.user_id ? 'Store Member' : 'Guest Client'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '4px' }}>Balance Due</p>
                                    <p style={{ fontSize: '40px', fontWeight: '800', color: 'white', margin: 0 }}>
                                        <span style={{ color: 'var(--accent-primary)', fontSize: '20px', verticalAlign: 'top', marginRight: '4px' }}>$</span>
                                        {parseFloat(selectedOrder.total_price).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="order-receipt-body">
                                {/* Status Matrix */}
                                <div className="status-matrix">
                                    {statuses.map(s => {
                                        const isActive = selectedOrder.status === s.name;
                                        return (
                                            <div
                                                key={s.name}
                                                onClick={() => updateOrderStatus(selectedOrder.id, s.name)}
                                                className={`status-button ${isActive ? 'active' : ''}`}
                                            >
                                                <div className="status-icon-wrapper" style={{ backgroundColor: s.bg, color: s.color }}>
                                                    {React.cloneElement(s.icon, { size: 20 })}
                                                </div>
                                                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{s.name}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Manifest Table */}
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>Order Manifest</h4>
                                <table className="order-table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th style={{ textAlign: 'center' }}>Qty</th>
                                            <th style={{ textAlign: 'right' }}>Price</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td style={{ color: 'white', fontWeight: '500' }}>{item.product_name}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '12px' }}>{item.quantity}</span>
                                                </td>
                                                <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>${parseFloat(item.price).toFixed(2)}</td>
                                                <td style={{ textAlign: 'right', color: 'white', fontWeight: '600' }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'right', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '10px' }}>Total Settlement</td>
                                            <td style={{ textAlign: 'right', fontSize: '18px', color: 'white' }}>${parseFloat(selectedOrder.total_price).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {/* Footer Information */}
                            <div style={{ padding: '24px 40px', borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.01)', textAlign: 'center' }}>
                                <p style={{ fontSize: '10px', color: '#4b5563', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0 }}>
                                    Secure Transaction Record • Verified via Merchant Portal
                                </p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="empty-state-orders">
                            <ShoppingBag size={48} style={{ opacity: 0.05, marginBottom: '20px' }} />
                            <p>Select an entry from the inbox to review</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderList;
