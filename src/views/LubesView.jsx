import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  TrendingUp, 
  ShoppingCart,
  Boxes,
  ArrowUpRight
} from 'lucide-react';

export default function LubesView() {
  const { lubricants, setLubricants, activeRole, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [selectedLube, setSelectedLube] = useState(lubricants[0]);
  const [addQty, setAddQty] = useState(10);

  const filteredLubes = lubricants.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInventoryValue = lubricants.reduce((sum, item) => sum + (item.price * item.stockQty), 0);
  const lowStockCount = lubricants.filter(l => l.stockQty <= l.minReorder).length;

  const handleStockInSubmit = (e) => {
    e.preventDefault();
    if (!selectedLube || addQty <= 0) return;
    setLubricants(prev =>
      prev.map(item => {
        if (item.id === selectedLube.id) {
          return {
            ...item,
            stockQty: item.stockQty + parseInt(addQty)
          };
        }
        return item;
      })
    );
    setAddStockModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-active">SERVO / IOCL APPROVED</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>8 Packaged Stock Keeping Units</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
            Packaged Lubricants & Non-Fuel Retail Inventory
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Engine oils (2T/4T), AdBlue / DEF buckets, coolants, brake fluids, and car care inventory with bundled forecourt billing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setAddStockModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={18} /> Inward Stock Receipt
          </button>
          <button 
            onClick={() => setActiveTab('pos')}
            className="btn-secondary"
          >
            <ShoppingCart size={18} /> POS Billing
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TOTAL LUBE STOCK VALUE</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Packaged retail inventory
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>TOTAL UNITS ON HAND</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
            {lubricants.reduce((sum, item) => sum + item.stockQty, 0)} Units
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across all categories
          </div>
        </div>

        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>LOW STOCK ALERTS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: lowStockCount > 0 ? '#f87171' : '#34d399', marginTop: '4px' }}>
            {lowStockCount} SKU
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Below minimum reorder level
          </div>
        </div>
      </div>

      {/* Inventory Search & Table */}
      <div className="glass-card" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={20} color="#f59e0b" /> Packaged Stock Master
          </h3>

          <div style={{ width: '280px' }}>
            <input
              type="text"
              placeholder="Search lubes or SKUs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                <th style={{ padding: '12px 10px' }}>SKU CODE</th>
                <th style={{ padding: '12px 10px' }}>PRODUCT NAME</th>
                <th style={{ padding: '12px 10px' }}>CATEGORY / BRAND</th>
                <th style={{ padding: '12px 10px' }}>RETAIL MRP (₹)</th>
                <th style={{ padding: '12px 10px' }}>CURRENT STOCK</th>
                <th style={{ padding: '12px 10px' }}>MIN REORDER</th>
                <th style={{ padding: '12px 10px' }}>GST %</th>
                <th style={{ padding: '12px 10px' }}>STOCK STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLubes.map((lube) => {
                const isLow = lube.stockQty <= lube.minReorder;
                return (
                  <tr key={lube.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fbbf24' }}>
                      {lube.code}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#f8fafc' }}>
                      {lube.name}
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                      {lube.category} ({lube.brand})
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#38bdf8' }}>
                      ₹{lube.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: isLow ? '#f87171' : '#f8fafc' }}>
                      {lube.stockQty} Pcs
                    </td>
                    <td style={{ padding: '12px 10px', color: 'var(--text-dim)' }}>
                      {lube.minReorder} Pcs
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {lube.gstPercent}%
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      {isLow ? (
                        <span className="badge badge-alert"><AlertTriangle size={12} /> REORDER</span>
                      ) : (
                        <span className="badge badge-active"><CheckCircle size={12} /> IN STOCK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Inward Modal */}
      {addStockModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 90
        }}>
          <div className="glass-card" style={{ width: '400px', padding: '24px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
              Inward Lubricant Stock Receipt
            </h3>

            <form onSubmit={handleStockInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Select Product SKU</label>
                <select
                  value={selectedLube?.id}
                  onChange={(e) => setSelectedLube(lubricants.find(l => l.id === e.target.value))}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {lubricants.map(l => (
                    <option key={l.id} value={l.id}>{l.name} (Current: {l.stockQty})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quantity Received (Pcs)</label>
                <input
                  type="number"
                  min="1"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Update Stock
                </button>
                <button type="button" onClick={() => setAddStockModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
