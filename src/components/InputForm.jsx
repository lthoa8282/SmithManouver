import React, { useState } from 'react';
import { PROVINCES } from '../utils/taxCalculator';
import { DEFAULT_ETFS, fetchETFReturn } from '../services/api';
import { Plus, Info, Loader } from 'lucide-react';

export default function InputForm({ onCalculate }) {
    const [formData, setFormData] = useState({
        name: 'Investor',
        province: 'ON',
        income: 120000,
        helocAmount: 100000,
        helocRate: 6.5,
        etfSymbol: 'XEQT.TO',
        years: 15,
        capitalizeInterest: true,
        periodicContribution: 0,
        contributionFrequency: 'monthly'
    });

    const [customETF, setCustomETF] = useState('');
    const [isAddingETF, setIsAddingETF] = useState(false);
    const [isLoadingFetch, setIsLoadingFetch] = useState(false);
    const [availableETFs, setAvailableETFs] = useState(DEFAULT_ETFS);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddETF = async () => {
        if (!customETF) return;

        setIsLoadingFetch(true);
        try {
            // Attempt to fetch to see if it's real
            const expectedReturn = await fetchETFReturn(customETF);

            const newETF = {
                symbol: customETF.toUpperCase(),
                name: `Custom ETF (${customETF.toUpperCase()})`,
                defaultReturn: expectedReturn,
                description: 'User Added'
            };

            setAvailableETFs([...availableETFs, newETF]);
            setFormData(prev => ({ ...prev, etfSymbol: newETF.symbol }));
            setIsAddingETF(false);
            setCustomETF('');
        } catch (err) {
            alert(`Could not add ETF: ${err.message}`);
        } finally {
            setIsLoadingFetch(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pass raw data up to parent
        onCalculate({
            ...formData,
            income: Number(formData.income),
            helocAmount: Number(formData.helocAmount),
            helocRate: Number(formData.helocRate) / 100, // convert percentage
            years: Number(formData.years),
            periodicContribution: Number(formData.periodicContribution),
            selectedETF: availableETFs.find(e => e.symbol === formData.etfSymbol)
        });
    };

    return (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            className="input-control"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>Province</label>
                        <select
                            name="province"
                            className="input-control"
                            value={formData.province}
                            onChange={handleChange}
                        >
                            {PROVINCES.map(p => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label>Annual Income ($) <Info size={14} style={{ display: 'inline', opacity: 0.6 }} /></label>
                    <input
                        type="number"
                        name="income"
                        className="input-control"
                        value={formData.income}
                        onChange={handleChange}
                        min="0"
                        step="1000"
                        required
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Used to determine marginal tax rate.</small>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <label>Available HELOC Limit ($)</label>
                        <input
                            type="number"
                            name="helocAmount"
                            className="input-control"
                            value={formData.helocAmount}
                            onChange={handleChange}
                            min="0"
                            step="5000"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label>HELOC Interest Rate (%)</label>
                        <input
                            type="number"
                            name="helocRate"
                            className="input-control"
                            value={formData.helocRate}
                            onChange={handleChange}
                            min="0"
                            max="30"
                            step="0.1"
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                        <label>Periodic HELOC Addition ($)</label>
                        <input
                            type="number"
                            name="periodicContribution"
                            className="input-control"
                            value={formData.periodicContribution}
                            onChange={handleChange}
                            min="0"
                            step="100"
                        />
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Amount to add to HELOC and invest.</small>
                    </div>

                    <div className="input-group">
                        <label>Contribution Frequency</label>
                        <select
                            name="contributionFrequency"
                            className="input-control"
                            value={formData.contributionFrequency}
                            onChange={handleChange}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="annually">Annually</option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Target ETF Investment</span>
                        {!isAddingETF && (
                            <button
                                type="button"
                                onClick={() => setIsAddingETF(true)}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}
                            >
                                <Plus size={14} /> Add Symbol
                            </button>
                        )}
                    </label>

                    {isAddingETF ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="e.g. AAPL, QQQ, TSLA"
                                className="input-control"
                                value={customETF}
                                onChange={(e) => setCustomETF(e.target.value)}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddETF}
                                disabled={isLoadingFetch}
                                style={{ padding: '0 1rem' }}
                            >
                                {isLoadingFetch ? <Loader className="spin" size={16} /> : 'Search'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setIsAddingETF(false)}
                                style={{ padding: '0 1rem' }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <select
                            name="etfSymbol"
                            className="input-control"
                            value={formData.etfSymbol}
                            onChange={handleChange}
                        >
                            {availableETFs.map(etf => (
                                <option key={etf.symbol} value={etf.symbol}>
                                    {etf.symbol} - {etf.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="input-group">
                    <label>Investment Horizon (Years)</label>
                    <input
                        type="number"
                        name="years"
                        className="input-control"
                        value={formData.years}
                        onChange={handleChange}
                        min="1"
                        max="40"
                        required
                    />
                </div>

                <div className="checkbox-group">
                    <input
                        type="checkbox"
                        id="capitalizeInterest"
                        name="capitalizeInterest"
                        checked={formData.capitalizeInterest}
                        onChange={handleChange}
                    />
                    <div>
                        <label htmlFor="capitalizeInterest" style={{ fontWeight: 600 }}>Capitalize Interest</label>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                            Borrow more from HELOC to cover interest payments (Zero out-of-pocket). Uncheck to pay interest from cash flow.
                        </div>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
                    Calculate Projections
                </button>

            </form>

            <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}
