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
        { name: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.25)', icon: <Clock size={16} /> },
        { name: 'Processing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.25)', icon: <RefreshCcw size={16} />, animate: true },
        { name: 'Shipped', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.25)', icon: <Truck size={16} /> },
        { name: 'Delivered', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.25)', icon: <CheckCircle size={16} /> },
        { name: 'Cancelled', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.25)', icon: <XCircle size={16} /> }
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[600px] text-[#94a3b8] gap-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <ShoppingBag size={24} className="text-indigo-400 animate-pulse" />
                </div>
            </div>
            <p className="text-lg font-medium text-white tracking-wide">Synchronizing Orders...</p>
        </div>
    );

    if (orders.length === 0) return (
        <div className="premium-card flex flex-col items-center justify-center min-h-[600px] text-[#94a3b8] text-center">
            <div className="w-24 h-24 rounded-full bg-indigo-500/5 flex items-center justify-center mb-6 border border-indigo-500/10">
                <ShoppingBag size={48} className="opacity-20 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-display">No Entries Found</h3>
            <p className="max-w-xs opacity-50 text-sm leading-relaxed">Incoming customer traffic is currently quiet. All systems are operational.</p>
        </div>
    );

    return (
        <div className="flex h-[calc(100vh-250px)] min-h-[700px] gap-6">
            {/* Inbox Section */}
            <div className="w-[400px] flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#64748b]">Active Queue</h3>
                    <button onClick={fetchOrders} className="p-2 hover:bg-white/5 rounded-lg text-[#64748b] transition-all hover:text-white">
                        <RefreshCcw size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {orders.map((order) => {
                        const s = statuses.find(st => st.name === order.status) || statuses[0];
                        const isSelected = selectedOrder?.id === order.id;
                        return (
                            <button
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className={`w-full text-left p-5 rounded-2xl transition-all border ${isSelected
                                    ? 'bg-[#1a1a20] border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.15)] scale-[1.02]'
                                    : 'bg-[#141417]/50 border-white/5 hover:border-white/10 hover:bg-[#141417]'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="max-w-[180px]">
                                        <p className="text-[10px] text-indigo-400/60 font-mono mb-1">ID: {order.id.slice(0, 8)}</p>
                                        <h4 className="font-bold text-white truncate text-lg leading-tight">{order.customer_name}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-white mb-1">${parseFloat(order.total_price).toFixed(2)}</p>
                                        <p className="text-[10px] text-[#64748b]">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-2 h-2 rounded-full relative"
                                        style={{ backgroundColor: s.color }}
                                    >
                                        {s.animate && (
                                            <span
                                                className="absolute inset-0 rounded-full animate-ping opacity-75"
                                                style={{ backgroundColor: s.color }}
                                            ></span>
                                        )}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: s.color }}>
                                        {order.status}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Detailed View Section */}
            <div className="flex-1 flex flex-col bg-[#141417]/80 rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-sm shadow-2xl">
                <AnimatePresence mode="wait">
                    {selectedOrder ? (
                        <motion.div
                            key={selectedOrder.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full"
                        >
                            {/* Detailed Header */}
                            <div className="p-8 md:p-12 border-b border-white/5 bg-[#1a1a20]/50">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                                                <User size={32} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[11px] font-mono p-1 px-2 bg-white/5 rounded text-[#64748b]">ORDER_REF: {selectedOrder.id}</span>
                                                </div>
                                                <h2 className="text-4xl font-display font-bold text-white tracking-tight leading-none group">
                                                    {selectedOrder.customer_name}
                                                </h2>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-[#94a3b8] text-sm font-medium pl-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-indigo-400/60" />
                                                {new Date(selectedOrder.created_at).toLocaleString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} className="text-indigo-400/60" />
                                                Calculated via Merchant Portal
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-[#1a1a20] p-6 rounded-3xl border border-white/5 shadow-xl min-w-[200px] group hover:border-indigo-500/30 transition-all">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-[#64748b] mb-2 font-bold">Consolidated Total</p>
                                        <p className="text-5xl font-display font-bold text-white leading-none">
                                            <span className="text-indigo-500 text-2xl align-top mr-1 font-sans">$</span>
                                            {parseFloat(selectedOrder.total_price).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Body */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                                {/* Interactive Status Matrix */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h5 className="text-[11px] font-bold text-[#64748b] uppercase tracking-[0.2em] whitespace-nowrap">Status Management Console</h5>
                                        <div className="h-px w-full bg-white/5"></div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {statuses.map(s => {
                                            const isActive = selectedOrder.status === s.name;
                                            return (
                                                <button
                                                    key={s.name}
                                                    onClick={() => updateOrderStatus(selectedOrder.id, s.name)}
                                                    disabled={isActive}
                                                    className={`relative p-5 rounded-[1.5rem] border transition-all flex flex-col items-center gap-3 group overflow-hidden ${isActive
                                                        ? 'bg-white/[0.03] border-indigo-500/50 shadow-lg'
                                                        : 'bg-white/[0.01] border-white/5 hover:border-white/20 hover:bg-white/[0.04] grayscale opacity-50 hover:grayscale-0 hover:opacity-100'
                                                        }`}
                                                >
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="status-glow"
                                                            className="absolute inset-0 bg-indigo-500/5 blur-xl pointer-events-none"
                                                        />
                                                    )}
                                                    <div className={`p-4 rounded-2xl shadow-lg transition-all ${isActive ? 'scale-110 shadow-indigo-500/10' : 'group-hover:scale-110'}`} style={{ backgroundColor: s.bg, color: s.color }}>
                                                        {React.cloneElement(s.icon, { size: 24, className: s.animate && isActive ? 'animate-spin-slow' : '' })}
                                                    </div>
                                                    <span className={`text-[11px] font-bold uppercase tracking-[0.1em] ${isActive ? 'text-white' : 'text-[#64748b]'}`}>{s.name}</span>
                                                    {isActive && (
                                                        <div className="absolute top-2 right-2 flex gap-0.5">
                                                            <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                            <div className="w-1 h-1 rounded-full bg-indigo-500/50"></div>
                                                        </div>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Order Manifest Table */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <h5 className="text-[11px] font-bold text-[#64748b] uppercase tracking-[0.2em] whitespace-nowrap">Order Manifest / Ledger</h5>
                                        <div className="h-px w-full bg-white/5"></div>
                                    </div>
                                    <div className="bg-[#1a1a20]/50 rounded-3xl border border-white/5 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-white/[0.02] border-b border-white/5 text-[#64748b] text-[10px] uppercase font-bold tracking-[0.15em]">
                                                    <th className="p-6">Product Designation</th>
                                                    <th className="p-6 text-center">Qty</th>
                                                    <th className="p-6 text-right">Unit Price</th>
                                                    <th className="p-6 text-right">Computed Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {selectedOrder.items.map((item, idx) => (
                                                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                                        <td className="p-6">
                                                            <span className="text-white font-medium block mb-0.5">{item.product_name}</span>
                                                            <span className="text-[9px] font-mono text-indigo-400/40 uppercase">ITEM_SKU_{idx + 1000}</span>
                                                        </td>
                                                        <td className="p-6 text-center">
                                                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/10">
                                                                {item.quantity}
                                                            </span>
                                                        </td>
                                                        <td className="p-6 text-right text-[#94a3b8] font-mono text-sm">
                                                            ${parseFloat(item.price).toFixed(2)}
                                                        </td>
                                                        <td className="p-6 text-right text-white font-mono font-bold text-sm">
                                                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-white/[0.02] font-bold">
                                                    <td colSpan="3" className="p-6 text-right text-[10px] uppercase tracking-widest text-[#64748b]">Grand Total Settlement</td>
                                                    <td className="p-6 text-right text-2xl text-white font-display">
                                                        <span className="text-indigo-400 text-sm align-top mr-1">$</span>
                                                        {parseFloat(selectedOrder.total_price).toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Footer */}
                            <div className="p-8 border-t border-white/5 bg-[#1a1a20]/20 flex justify-between items-center">
                                <p className="text-[10px] text-[#4b5563] font-mono uppercase tracking-[0.3em] flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Secure Ledger Verification Protocol Active
                                </p>
                                <div className="flex gap-4">
                                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-widest">Print Manifest</button>
                                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest">Contact Node</button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-[#64748b] gap-8 p-12 text-center">
                            <div className="relative">
                                <ShoppingBag size={80} className="opacity-[0.03] text-indigo-400" />
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-2 border-dashed border-indigo-500/10 rounded-full scale-110"
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white/40">No Signal Detected</h3>
                                <p className="text-sm max-w-xs opacity-40 leading-relaxed font-medium capitalize">Select an active transmission from the queue to inspect detailed telemetry</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderList;
