import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp, User, DollarSign, Calendar, RefreshCcw } from 'lucide-react';

const OrderList = ({ setActionLoading }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

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
        } catch (err) {
            console.error('Update status error:', err);
            alert('Failed to update status');
        } finally {
            setActionLoading({ isLoading: false, message: '' });
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'Processing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Shipped': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'Delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={14} />;
            case 'Processing': return <RefreshCcw size={14} className="animate-spin-slow" />;
            case 'Shipped': return <Truck size={14} />;
            case 'Delivered': return <CheckCircle size={14} />;
            case 'Cancelled': return <XCircle size={14} />;
            default: return null;
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[500px] text-[#94a3b8] gap-6">
            <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-white">Fetching Orders...</p>
        </div>
    );

    if (orders.length === 0) return (
        <div className="flex flex-col items-center justify-center h-[500px] text-[#94a3b8] gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ShoppingBag size={40} className="opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-white">No orders yet</h3>
            <p className="text-sm opacity-50">When customers buy products, they will appear here.</p>
        </div>
    );

    return (
        <div className="space-y-4 p-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ShoppingBag className="text-indigo-400" />
                    Incoming Orders
                    <span className="text-xs font-normal bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        {orders.length}
                    </span>
                </h2>
                <button
                    onClick={fetchOrders}
                    className="p-2 hover:bg-white/5 rounded-lg text-[#94a3b8] transition-all"
                >
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div className="space-y-3">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className={`premium-card border-[#1f2937] transition-all ${expandedOrder === order.id ? 'ring-1 ring-indigo-500/30 bg-[#111114]' : 'hover:border-[#374151]'}`}
                    >
                        <div
                            className="flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer p-5"
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{order.customer_name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-[#64748b] flex items-center gap-1">
                                            <Calendar size={12} />
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${getStatusStyles(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-8">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-[#64748b] mb-1">Total Amount</p>
                                    <p className="text-xl font-bold text-white flex items-center gap-1">
                                        <span className="text-indigo-400 text-sm">$</span>
                                        {parseFloat(order.total_price).toFixed(2)}
                                    </p>
                                </div>
                                <button className="p-2 text-[#94a3b8]">
                                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedOrder === order.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t border-white/5"
                                >
                                    <div className="p-6 bg-white/[0.02]">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Items List */}
                                            <div>
                                                <h5 className="text-sm font-bold text-[#64748b] uppercase tracking-widest mb-4">Ordered Items</h5>
                                                <div className="space-y-3">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                                                                    {item.quantity}x
                                                                </div>
                                                                <span className="text-sm text-white font-medium">{item.product_name}</span>
                                                            </div>
                                                            <span className="text-sm text-[#94a3b8]">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order Settings */}
                                            <div>
                                                <h5 className="text-sm font-bold text-[#64748b] uppercase tracking-widest mb-4">Manage Order</h5>
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                                    <div>
                                                        <label className="text-[10px] text-[#64748b] uppercase tracking-widest block mb-2">Update Status</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                                                <button
                                                                    key={s}
                                                                    disabled={order.status === s}
                                                                    onClick={() => updateOrderStatus(order.id, s)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${order.status === s
                                                                        ? 'bg-indigo-600 text-white'
                                                                        : 'bg-white/5 text-[#94a3b8] hover:bg-white/10'}`}
                                                                >
                                                                    {s}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="pt-4 border-t border-white/5">
                                                        <p className="text-[10px] text-[#64748b]">Order ID: <span className="font-mono">{order.id}</span></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderList;
