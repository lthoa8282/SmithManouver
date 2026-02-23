/**
 * Calculates the Smith Manoeuvre projection over a number of years.
 * @param {object} params
 * @param {number} params.initialInvestment Initial HELOC amount drawn and invested.
 * @param {number} params.helocRate Annual HELOC interest rate (e.g., 0.06 for 6%).
 * @param {number} params.marginalTaxRate User's marginal tax rate (e.g., 0.43 for 43%).
 * @param {number} params.annualReturn Expected annual return of the ETF (e.g., 0.08 for 8%).
 * @param {number} params.years Number of years to project.
 * @param {boolean} params.capitalizeInterest True if borrowing to pay interest.
 * @returns {object} { yearlyData: Array, summary: Object }
 */
export function calculateSmithManoeuvre({
    initialInvestment,
    helocRate,
    marginalTaxRate,
    annualReturn,
    years,
    capitalizeInterest
}) {
    const yearlyData = [];
    let currentLoan = initialInvestment;
    let currentInvestment = initialInvestment;

    let totalInterestPaid = 0;
    let totalTaxRefunds = 0;

    for (let year = 1; year <= years; year++) {
        // 1. Calculate Interest for the year based on current loan balance
        const yearlyInterest = currentLoan * helocRate;
        totalInterestPaid += yearlyInterest;

        // 2. Calculate Tax Refund (Interest is tax-deductible)
        const yearlyTaxRefund = yearlyInterest * marginalTaxRate;
        totalTaxRefunds += yearlyTaxRefund;

        // 3. Handle capitalization vs cash flow
        let outOfPocketInterest = 0;
        if (capitalizeInterest) {
            // If capitalized, the loan grows by the amount of interest paid (less tax refund applied if reinvested, but typically SM implies borrowing the full interest)
            // Usually, people borrow the exact interest amount to pay the interest.
            currentLoan += yearlyInterest;

            // The tax refund is normally reinvested to pay down the loan or buy more investments.
            // Standard SM: apply tax refund to mortgage (which then increases available HELOC limit to invest).
            // For simplicity here: we assume tax refund reduces the loan balance at end of year.
            currentLoan -= yearlyTaxRefund;
        } else {
            // Interest is paid from cash flow, loan stays the same
            outOfPocketInterest = yearlyInterest - yearlyTaxRefund; // Net out of pocket after refund
        }

        // 4. Calculate Investment Growth
        const investmentGrowth = currentInvestment * annualReturn;
        currentInvestment += investmentGrowth;

        yearlyData.push({
            year,
            loanBalance: currentLoan,
            investmentValue: currentInvestment,
            yearlyInterest,
            yearlyTaxRefund,
            outOfPocketInterest,
            netWorth: currentInvestment - currentLoan
        });
    }

    // Final Summary Calculations
    const finalNetWorth = currentInvestment - currentLoan;
    const initialNetWorth = 0; // Purely from the SM setup (Investment = Loan initially)
    const totalNetGain = finalNetWorth - initialNetWorth;

    // Return on Capital (ROC)
    // If not capitalizing, user put out cash. ROC = Gain / Total Out of Pocket Cash
    // If capitalizing, out of pocket is technically 0 (or just the initial setup fees), making ROC infinite.
    // We'll calculate a simple "Return on Loan" for capitalized, and standard ROC for cashflow.

    let outOfPocketTotal = 0;
    if (!capitalizeInterest) {
        outOfPocketTotal = yearlyData.reduce((sum, data) => sum + data.outOfPocketInterest, 0);
    }

    const roc = outOfPocketTotal > 0 ? (totalNetGain / outOfPocketTotal) * 100 : ((finalNetWorth / initialInvestment) * 100);

    const summary = {
        finalInvestmentValue: currentInvestment,
        finalLoanBalance: currentLoan,
        netWorth: finalNetWorth,
        totalInterestPaid,
        totalTaxRefunds,
        totalOutOfPocket: outOfPocketTotal,
        totalNetGain,
        returnOnCapital: roc
    };

    return { yearlyData, summary };
}
