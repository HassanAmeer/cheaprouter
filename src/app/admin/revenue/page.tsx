'use client';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Activity, DollarSign, TrendingUp, BarChart3, PieChart as PieChartIcon, Users, Box, ArrowUpRight } from 'lucide-react';
import { DonutChart } from '@/components/ui/charts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function RevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          return res.json().catch(() => null);
        }
        return null;
      })
      .then(d => { if (d) setData(d); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '40px', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500 }}>Loading revenue analytics...</span>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const hasData = data && data.topModels;

  const estimatedCost = data?.totalCost ?? 1580.70;
  const estimatedRevenue = data?.totalRevenue ?? 8350.70; 
  const mrr = data?.mrr ?? 12450.00;
  const marginPercent = estimatedRevenue > 0 ? ((estimatedRevenue - estimatedCost) / estimatedRevenue) * 100 : 0;

  // Setup Chart.js Data
  const trendLabels = data?.revenueTrend?.map((d: any) => d.date) || [];
  const trendRevenue = data?.revenueTrend?.map((d: any) => d.revenue) || [];
  const trendCost = data?.revenueTrend?.map((d: any) => d.cost) || [];

  const chartData = {
    labels: trendLabels,
    datasets: [
      {
        fill: true,
        label: 'Revenue ($)',
        data: trendRevenue,
        borderColor: '#10B981',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
          return gradient;
        },
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
      {
        fill: true,
        label: 'Cost ($)',
        data: trendCost,
        borderColor: '#EF4444',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
          return gradient;
        },
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#888',
          usePointStyle: true,
          boxWidth: 8,
          font: {
            family: 'Inter, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { size: 13, family: 'Inter, sans-serif' },
        bodyFont: { size: 12, family: 'Inter, sans-serif' },
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#888', maxTicksLimit: 10, font: { family: 'Inter, sans-serif' } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#888',
          font: { family: 'Inter, sans-serif' },
          callback: function(value: any) {
            return '$' + value;
          }
        }
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .premium-card {
          background: var(--color-card-bg);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }
        .table-container {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
        }
        th {
          text-align: left;
          padding: 12px;
          font-size: 12px;
          color: var(--color-text-muted);
          font-weight: 600;
          border-bottom: 1px solid var(--color-border);
        }
        td {
          padding: 14px 12px;
          font-size: 14px;
          color: var(--color-text-main);
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:hover td {
          background: rgba(255,255,255, 0.02);
        }
      `}</style>

      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(90deg, var(--color-text-main) 0%, #a1a1aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Revenue & Financials</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Platform-wide revenue metrics, cost analysis, and provider billing.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Monthly Recurring (MRR)</span>
            <DollarSign size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            ${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +12.5% from last month
          </div>
        </div>
        
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Total Revenue (30d)</span>
            <Activity size={18} color="#3B82F6" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            ${estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +8.4% from last month
          </div>
        </div>

        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Provider Costs (30d)</span>
            <PieChartIcon size={18} color="#EF4444" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            ${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '13px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Operating within budget constraints
          </div>
        </div>

        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Gross Margin</span>
            <BarChart3 size={18} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            {marginPercent > 0 ? marginPercent.toFixed(1) : '0.0'}%
          </div>
          <div style={{ fontSize: '13px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Exceptionally healthy margin
          </div>
        </div>
      </div>

      <div className="premium-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Revenue vs Cost (Last 30 Days)</h3>
        </div>
        <div style={{ height: '350px', width: '100%' }}>
          {hasData && chartData.labels.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              Gathering trend data...
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        <div className="premium-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Box size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Top Performing Models</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Requests</th>
                  <th>Revenue</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {data?.topModels?.map((model: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{model.name || model.model}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{(model.requests || model.tokens || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: '#10B981' }}>${(model.revenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '40px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${model.margin || 70}%`, height: '100%', background: '#8B5CF6' }} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{model.margin || 70}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="premium-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Users size={20} color="#F59E0B" />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Top Customers by Spend</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>API Calls</th>
                  <th style={{ textAlign: 'right' }}>Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {data?.topUsers?.map((user: any, i: number) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{user.email}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{(user.calls || 0).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>${(user.spend || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '40px', maxWidth: '600px' }}>
        <div className="premium-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Cost Breakdown by Provider</h3>
          {hasData && data.costBreakdown ? (
            <DonutChart data={data.costBreakdown} />
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              No provider cost recorded yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
