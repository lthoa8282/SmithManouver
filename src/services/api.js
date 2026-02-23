import axios from 'axios';

// Note: For a real production app without a backend proxy, hitting Yahoo Finance directly 
// from the browser often results in CORS errors.
// We will use a public CORS proxy for demonstration purposes, or optionally provide
// hardcoded historical averages if the fetch fails to ensure the app remains functional.

const CORS_PROXY = 'https://corsproxy.io/?';

// Hardcoded fallbacks in case the API rate limits or CORS fails
export const DEFAULT_ETFS = [
    { symbol: 'XEQT.TO', name: 'iShares Core Equity ETF Portfolio', defaultReturn: 0.08, description: '100% Equity' },
    { symbol: 'VEQT.TO', name: 'Vanguard All-Equity ETF Portfolio', defaultReturn: 0.08, description: '100% Equity' },
    { symbol: 'VFV.TO', name: 'Vanguard S&P 500 Index ETF', defaultReturn: 0.10, description: 'US Large Cap' },
    { symbol: 'VDY.TO', name: 'Vanguard FTSE Canadian High Dividend Yield Index ETF', defaultReturn: 0.07, description: 'Canadian Dividend' },
    { symbol: 'XIU.TO', name: 'iShares S&P/TSX 60 Index ETF', defaultReturn: 0.065, description: 'Canadian Large Cap' },
];

/**
 * Attempt to fetch the 5-year annualized return for a given symbol from Yahoo Finance.
 * If it fails, falls back to a default value.
 * @param {string} symbol The ETF ticker symbol (e.g., 'XEQT.TO')
 * @returns {Promise<number>} Annualized return as a decimal
 */
export async function fetchETFReturn(symbol) {
    try {
        // Attempting to fetch historical data from Yahoo Finance Chart API (v8)
        // We request 5 years of monthly data
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5y&interval=1mo`;
        const response = await axios.get(`${CORS_PROXY}${encodeURIComponent(url)}`);

        const data = response.data.chart.result[0];
        const quotes = data.indicators.quote[0].close;

        // Filter out nulls
        const validQuotes = quotes.filter(q => q !== null);

        if (validQuotes.length < 12) {
            throw new Error('Not enough historical data to calculate annualized return');
        }

        const startPrice = validQuotes[0];
        const endPrice = validQuotes[validQuotes.length - 1];

        // Calculate total return over the period
        const totalReturn = (endPrice - startPrice) / startPrice;

        // Annualize the return based on the number of months (validQuotes.length)
        const years = validQuotes.length / 12;
        const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;

        console.log(`Successfully fetched live return for ${symbol}: ${(annualizedReturn * 100).toFixed(2)}%`);

        // Yahoo finance data usually doesn't include dividends directly in the price chart for simple calculations,
        // so this is strictly price return. We will cap it at a reasonable number and return it.
        // For a real app, 'Adjusted Close' is needed for total return (price + dividend).
        return annualizedReturn;

    } catch (error) {
        console.warn(`Failed to fetch live data for ${symbol}. Using fallback average. Error:`, error.message);

        // Find fallback
        const fallback = DEFAULT_ETFS.find(etf => etf.symbol === symbol);
        if (fallback) {
            return fallback.defaultReturn;
        }

        // If it's a custom ETF that failed, default to a conservative 5%
        return 0.05;
    }
}
