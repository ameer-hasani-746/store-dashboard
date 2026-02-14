import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, User, DollarSign, Calendar, RefreshCcw } from 'lucide-react';

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
        { name: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', icon: <Clock size={14} /> },
        { name: 'Processing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', icon: <RefreshCcw size={14} className="animate-spin-slow" /> },
        { name: 'Shipped', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)', icon: <Truck size={14} /> },
        { name: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)', icon: <CheckCircle size={14} /> },
        { name: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', icon: <XCircle size={14} /> }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[600px] text-[#94a3b8] gap-6">
            <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-white">Establishing Secure Tunnel...</p>
        </div>
    );

    if (orders.length === 0) return (
        <div className="flex flex-col items-center justify-center h-[600px] text-[#94a3b8] gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ShoppingBag size={40} className="opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-white">No Orders Found</h3>
            <p className="text-sm opacity-50">Current ledger is clean. New orders will appear here automatically.</p>
        </div>
    );

    return (
        <div className="flex h-[750px] bg-[#0d0d11] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            {/* Sidebar List */}
            <div className="w-[380px] border-r border-white/5 flex flex-col bg-[#0d0d11]">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-white">Order Inbox</h3>
                        <p className="text-xs text-[#64748b]">{orders.length} events pending</p>
                    </div>
                    <button onClick={fetchOrders} className="p-2 hover:bg-white/5 rounded-lg text-[#64748b] transition-all">
                        <RefreshCcw size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {orders.map((order) => {
                        const s = statuses.find(st => st.name === order.status) || statuses[0];
                        return (
                            <button
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className={`w-full text-left p-4 rounded-xl transition-all border ${selectedOrder?.id === order.id
                                    ? 'bg-indigo-500/10 border-indigo-500/30'
                                    : 'border-transparent hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-white">{order.customer_name}</span>
                                    <span className="text-[10px] text-[#64748b] font-mono">
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-indigo-400">
                                        ${parseFloat(order.total_price).toFixed(2)}
                                    </span>
                                    <span
                                        className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border"
                                        style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
                                    >
                                        {s.icon}
                                        {order.status}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Panel */}
            <div className="flex-1 bg-[#0a0a0c] flex flex-col relative">
                <AnimatePresence mode="wait">
                    {selectedOrder ? (
                        <motion.div
                            key={selectedOrder.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 bg-[#0d0d11]">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono text-indigo-400/60 transition-all hover:text-indigo-400 cursor-default">#{selectedOrder.id.slice(0, 8)}</span>
                                            <span className="w-1 h-1 rounded-full bg-[#64748b]"></span>
                                            <span className="text-xs text-[#64748b]">Issued on {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <h2 className="text-3xl font-bold text-white mb-2">{selectedOrder.customer_name}</h2>
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-[#64748b]" />
                                            <span className="text-sm text-[#94a3b8]">{selectedOrder.user_id ? 'Authenticated Customer' : 'Guest Checkout'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-widest text-[#64748b] mb-1">Settlement Total</p>
                                        <p className="text-4xl font-bold text-white">
                                            <span className="text-indigo-500 text-xl align-top mr-1">$</span>
                                            {parseFloat(selectedOrder.total_price).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Status Controller */}
                                <section>
                                    <h5 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-4">Command Center / Status</h5>
                                    <div className="grid grid-cols-5 gap-3">
                                        {statuses.map(s => {
                                            const isActive = selectedOrder.status === s.name;
                                            return (
                                                <button
                                                    key={s.name}
                                                    onClick={() => updateOrderStatus(selectedOrder.id, s.name)}
                                                    disabled={isActive}
                                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${isActive
                                                        ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5'
                                                        : 'hover:bg-white/5 border-white/5 opacity-40 hover:opacity-80'
                                                        }`}
                                                >
                                                    <div className="p-2 rounded-lg" style={{ backgroundColor: s.bg, color: s.color }}>
                                                        {React.cloneElement(s.icon, { size: 18 })}
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-white' : 'text-[#64748b]'}`}>{s.name}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </section>

                                {/* Itemized List */}
                                <section>
                                    <h5 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-4">Item Analytics</h5>
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                                                        {item.quantity}x
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{item.product_name}</p>
                                                        <p className="text-[10px] text-[#64748b]">Unit: ${parseFloat(item.price).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-white">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Footer Info */}
                            <div className="p-6 border-t border-white/5 bg-[#0d0d11]/50 text-center">
                                <p className="text-[10px] text-[#4b5563] font-mono uppercase tracking-[0.2em]">Transaction Verified via Supabase Secure Edge</p>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#64748b] gap-4">
                            <ShoppingBag size={48} className="opacity-10" />
                            <p className="text-sm">Select an event from the inbox to review</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderList;
