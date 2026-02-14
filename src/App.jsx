import React, { useState, useEffect } from 'react'
import { Plus, Package, AlertCircle, Loader2, LayoutDashboard, CheckCircle, XCircle, RefreshCcw, Menu, X, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from './lib/supabase'
import ProductList from './components/ProductList'
import AddProductModal from './components/AddProductModal'
import ActionLoading from './components/ActionLoading'
import OrderList from './components/OrderList'

// Error Boundary Component to prevent white screen of death
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#0a0a0c] text-[#f8fafc]">
          <div className="premium-card max-w-md border-red-500/20 p-10 bg-[#141417] rounded-2xl border">
            <XCircle size={64} className="text-red-500 mb-6 mx-auto opacity-80" />
            <h2 className="text-3xl font-bold mb-4 font-display">System Alert</h2>
            <p className="text-[#94a3b8] mb-8 leading-relaxed">
              {this.state.error?.message || "A critical rendering error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mx-auto shadow-lg shadow-indigo-500/20"
            >
              <RefreshCcw size={18} />
              Reboot Terminal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [stats, setStats] = useState({ total: 0, available: 0, outOfStock: 0 })
  const [activeFilter, setActiveFilter] = useState('All')
  const [currentView, setCurrentView] = useState('inventory') // 'inventory' or 'orders'
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState({ isLoading: false, message: '' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from('Products')
        .select('*')
        .order('Product_id', { ascending: false })

      if (error) throw error
      console.log(`📊 Inventory Sync: Found ${data?.length || 0} items`, data)
      setProducts(data || [])

      // Calculate Stats
      const total = data?.length || 0
      const available = data?.filter(p => p.status === 'Available').length || 0
      const outOfStock = total - available
      setStats({ total, available, outOfStock })
    } catch (err) {
      console.error('Data Fetch Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => {
    if (activeFilter === 'All') return true
    return p.status === activeFilter
  })

  return (
    <ErrorBoundary>
      <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Overlay */}
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <aside className={`sidebar ${isSidebarOpen ? 'mobile-show' : ''}`}>
          <div className="sidebar-header">
            <div className="logo-container">
              <h1 className="logo-text">
                Store <span className="gradient-text">Dash</span>
              </h1>
              <span className="logo-slogan">Secure Inventory Node</span>
            </div>
            <button
              className="close-sidebar-btn"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-label">Main Console</div>
            <button
              onClick={() => {
                setCurrentView('inventory')
                setActiveFilter('All')
                setIsSidebarOpen(false)
              }}
              className={`nav-item ${currentView === 'inventory' ? 'active' : ''}`}
            >
              <div className="nav-item-content">
                <LayoutDashboard size={20} className="nav-icon" />
                <span className="nav-text">Inventory Management</span>
              </div>
            </button>

            <button
              onClick={() => {
                setCurrentView('orders')
                setIsSidebarOpen(false)
              }}
              className={`nav-item ${currentView === 'orders' ? 'active' : ''}`}
            >
              <div className="nav-item-content">
                <ShoppingBag size={20} className="nav-icon" />
                <span className="nav-text">Customer Orders</span>
              </div>
            </button>

            {currentView === 'inventory' && (
              <>
                <div className="nav-label mt-6">Inventory Filters</div>
                <button
                  onClick={() => {
                    setActiveFilter('All')
                    setIsSidebarOpen(false)
                  }}
                  className={`nav-item sub-item ${activeFilter === 'All' ? 'active' : ''}`}
                >
                  <div className="nav-item-content">
                    <Package size={18} className="nav-icon" />
                    <span className="nav-text">All Stock</span>
                  </div>
                  <span className="nav-badge">{stats.total}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveFilter('Available')
                    setIsSidebarOpen(false)
                  }}
                  className={`nav-item sub-item ${activeFilter === 'Available' ? 'active' : ''}`}
                >
                  <div className="nav-item-content">
                    <CheckCircle size={18} className="nav-icon" />
                    <span className="nav-text">Available</span>
                  </div>
                  <span className="nav-badge">{stats.available}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveFilter('Not Available')
                    setIsSidebarOpen(false)
                  }}
                  className={`nav-item sub-item ${activeFilter === 'Not Available' ? 'active' : ''}`}
                >
                  <div className="nav-item-content">
                    <XCircle size={18} className="nav-icon" />
                    <span className="nav-text">Unavailable</span>
                  </div>
                  <span className="nav-badge">{stats.outOfStock}</span>
                </button>
              </>
            )}
          </nav>

          <div className="sidebar-footer">
            <button
              onClick={async () => {
                const results = [];
                const targetTable = 'Products';

                // 1. Check Row Count
                const { count, error: countErr } = await supabase.from(targetTable).select('*', { count: 'exact', head: true });
                results.push(`📦 Table '${targetTable}': ${countErr ? 'NOT FOUND' : count + ' items'}`);

                // 2. Check for RLS (Try to read one row)
                const { error: rlsErr } = await supabase.from(targetTable).select('*').limit(1);
                if (rlsErr && rlsErr.message.includes('policy')) {
                  results.push(`⚠️ SECURITY: RLS is blocking the app!`);
                }

                // 3. Confirm Project URL
                results.push(`🌐 Project: ${supabase.supabaseUrl}`);

                alert(`DATABASE DIAGNOSTIC\n----------------------\n${results.join('\n')}\n\nACTION: Ensure n8n is using the SAME PROJECT URL as above!`);
              }}
              className="group flex flex-col gap-2 p-3 rounded-lg hover:bg-white/5 transition-all text-left w-full"
            >
              <div className="flex items-center gap-2 text-[#64748b] text-[10px] font-mono">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>SUPABASE_CONNECTED</span>
              </div>
              <span className="text-[9px] text-indigo-400 font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">CHECK_SECURITY_SYNC</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-layout">
          <div className="content-wrapper">
            <header className="page-header">
              <div className="header-left">
                <button
                  className="mobile-menu-btn"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu size={24} />
                </button>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    {currentView === 'inventory'
                      ? (activeFilter === 'All' ? 'Inventory Grid' : activeFilter === 'Available' ? 'Available Stock' : 'Out of Inventory')
                      : 'Order Management'
                    }
                  </h2>
                  <p className="text-[#94a3b8] hidden-mobile">
                    {currentView === 'inventory'
                      ? (activeFilter === 'All' ? 'Global management interface for store assets' : `Filtering by status: ${activeFilter.toLowerCase()}`)
                      : 'Review and manage incoming customer orders and shipping status'}
                  </p>
                </div>
              </div>
              {currentView === 'inventory' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary"
                >
                  <Plus size={20} />
                  <span className="hidden-mobile">Deploy Product</span>
                  <span className="show-mobile">Add</span>
                </button>
              )}
            </header>

            {/* API Level Error View */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card border-red-500/20 mb-8 flex items-center gap-4 text-red-400 bg-red-500/5"
              >
                <AlertCircle size={24} />
                <div>
                  <p className="font-bold">Database Communication Error</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </motion.div>
            )}


            {currentView === 'inventory' ? (
              <div className="premium-card min-h-[500px] overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center h-[500px] text-[#94a3b8] gap-6"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="animate-pulse text-indigo-400" size={24} />
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-medium text-white">Syncing Ledger...</p>
                        <p className="text-xs uppercase tracking-widest opacity-50">Establishing secure tunnel</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="inventory"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="h-full"
                    >
                      <ProductList
                        products={filteredProducts}
                        onRefresh={fetchProducts}
                        setActionLoading={setActionLoading}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="h-full"
                >
                  <OrderList setActionLoading={setActionLoading} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <AddProductModal
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                setIsModalOpen(false)
                fetchProducts()
              }}
              setActionLoading={setActionLoading}
            />
          )}
        </AnimatePresence>

        <ActionLoading
          isLoading={actionLoading.isLoading}
          message={actionLoading.message}
        />
      </div>
    </ErrorBoundary>
  )
}

export default App
