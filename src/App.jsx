import React, { useState } from 'react';
import { calculateTax } from './utils/taxCalculator';
import { calculateSmithManoeuvre } from './utils/smithManoeuvre';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { TrendingUp } from 'lucide-react';
import './App.css';

function App() {
  const [resultsData, setResultsData] = useState(null);
  const [currentParams, setCurrentParams] = useState(null);

  const handleCalculate = (params) => {
    // 1. Calculate Tax Rate based on Income & Province
    const { marginalRate } = calculateTax(params.income, params.province);

    // 2. Calculate Smith Manoeuvre Strategy
    const data = calculateSmithManoeuvre({
      initialInvestment: params.helocAmount,
      helocRate: params.helocRate,
      marginalTaxRate: marginalRate,
      annualReturn: params.selectedETF ? params.selectedETF.defaultReturn : 0.08,
      years: params.years,
      capitalizeInterest: params.capitalizeInterest,
      periodicContribution: params.periodicContribution,
      contributionFrequency: params.contributionFrequency,
      income: params.income,
      province: params.province
    });

    setResultsData({ ...data, marginalRate });
    setCurrentParams(params);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>
          <TrendingUp size={36} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--primary)' }} />
          Smith Manoeuvre Calculator
        </h1>
        <p>Turn your non-deductible mortgage into a tax-deductible investment loan.</p>
      </header>

      <main className="main-content">
        <section className="form-section">
          <InputForm onCalculate={handleCalculate} />
        </section>

        <section className="results-section">
          {resultsData ? (
            <ResultsDisplay data={resultsData} params={currentParams} />
          ) : (
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              <TrendingUp size={64} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <h3>Awaiting Input</h3>
              <p>Enter your details and click calculate to see your projected Smith Manoeuvre gains over time.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
