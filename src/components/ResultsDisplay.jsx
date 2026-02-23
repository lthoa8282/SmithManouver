import React from 'react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(value);

const formatPercent = (value) =>
  new Intl.NumberFormat('en-CA', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);

export default function ResultsDisplay({ data, params }) {
  if (!data) return null;

  const { summary, yearlyData } = data;
  const isCapitalized = params.capitalizeInterest;

  return (
    <div className="results-container">
      <div className="glass-panel summary-cards">
        <div className="card">
          <h3>Projected Net Worth</h3>
          <div className="value highlight">{formatCurrency(summary.netWorth)}</div>
          <div className="subtext">After {params.years} years</div>
        </div>

        <div className="card">
          <h3>Total Net Gain</h3>
          <div className="value success">{formatCurrency(summary.totalNetGain)}</div>
          <div className="subtext">Profit from strategy</div>
        </div>

        <div className="card">
          <h3>Return on Capital</h3>
          <div className="value">{formatPercent(summary.returnOnCapital)}</div>
          <div className="subtext">{isCapitalized ? 'Relative to initial investment' : 'Based on net cash flow'}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        <div className="glass-panel stat-card">
          <h4>Investment Value</h4>
          <p className="stat-value">{formatCurrency(summary.finalInvestmentValue)}</p>
        </div>
        <div className="glass-panel stat-card">
          <h4>Final HELOC Balance</h4>
          <p className="stat-value danger">{formatCurrency(summary.finalLoanBalance)}</p>
        </div>
        <div className="glass-panel stat-card">
          <h4>Total Tax Refunds</h4>
          <p className="stat-value success">{formatCurrency(summary.totalTaxRefunds)}</p>
        </div>
        <div className="glass-panel stat-card">
          <h4>Total Interest Paid</h4>
          <p className="stat-value warning">{formatCurrency(summary.totalInterestPaid)}</p>
        </div>
      </div>

      <div className="glass-panel table-container">
        <h3>Yearly Projection</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>HELOC Balance</th>
                <th>Investment Value</th>
                <th>Interest Paid</th>
                <th>Tax Refund</th>
                {!isCapitalized && <th>Out of Pocket</th>}
                <th>Net Worth</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map(row => (
                <tr key={row.year}>
                  <td>{row.year}</td>
                  <td>{formatCurrency(row.loanBalance)}</td>
                  <td>{formatCurrency(row.investmentValue)}</td>
                  <td className="warning">{formatCurrency(row.yearlyInterest)}</td>
                  <td className="success">{formatCurrency(row.yearlyTaxRefund)}</td>
                  {!isCapitalized && <td className="danger">{formatCurrency(row.outOfPocketInterest)}</td>}
                  <td className="highlight">{formatCurrency(row.netWorth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .results-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fade-in 0.6s ease-out;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 2rem;
          text-align: center;
        }

        .card h3 {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .value {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .highlight { color: var(--primary); }
        .success { color: var(--success); }
        .danger { color: #ff7b72; }
        .warning { color: var(--warning); }

        .subtext {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .stat-card {
          padding: 1.5rem;
          text-align: center;
        }
        
        .stat-card h4 {
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .table-container {
          padding: 1.5rem;
        }

        .table-container h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: var(--primary);
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
          font-size: 0.9rem;
        }

        th, td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--glass-border);
        }

        th {
          text-align: right;
          color: var(--text-secondary);
          font-weight: 500;
          position: sticky;
          top: 0;
          background: rgba(22, 27, 34, 0.95);
          backdrop-filter: blur(4px);
        }

        th:first-child, td:first-child {
          text-align: center;
        }

        tbody tr:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
