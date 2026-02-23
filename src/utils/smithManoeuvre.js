/**
 * Calculates the Smith Manoeuvre projection over a number of years.
 * @param {object} params
 * @param {number} params.initialInvestment Initial HELOC amount drawn and invested.
 * @param {number} params.helocRate Annual HELOC interest rate (e.g., 0.06 for 6%).
 * @param {number} params.marginalTaxRate User's marginal tax rate (e.g., 0.43 for 43%).
 * @param {number} params.annualReturn Expected annual return of the ETF (e.g., 0.08 for 8%).
 * @param {number} params.years Number of years to project.
 * @param {boolean} params.capitalizeInterest True if borrowing to pay interest.
 * @param {number} params.periodicContribution Amount to add to HELOC and invest periodically.
 * @param {string} params.contributionFrequency 'monthly' or 'annually'.
 * @returns {object} { yearlyData: Array, summary: Object }
 */
export function calculateSmithManoeuvre({
    initialInvestment,
    helocRate,
    marginalTaxRate,
    annualReturn,
    years,
    capitalizeInterest,
    periodicContribution = 0,
    contributionFrequency = 'annually'
}) {
    const yearlyData = [];
    let currentLoan = initialInvestment;
    let currentInvestment = initialInvestment;

    let totalInterestPaid = 0;
    let totalTaxRefunds = 0;

    // Calculate total annual contribution
    const totalAnnualContribution = contributionFrequency === 'monthly' ? periodicContribution * 12 : periodicContribution;

    for (let year = 1; year <= years; year++) {
        // 1. Calculate Interest for the year based on current loan balance (before this year's new contributions)
        const yearlyInterest = currentLoan * helocRate;
        totalInterestPaid += yearlyInterest;

        // 2. Calculate Tax Refund (Interest is tax-deductible)
        const yearlyTaxRefund = yearlyInterest * marginalTaxRate;
        totalTaxRefunds += yearlyTaxRefund;

        // 3. Handle capitalization vs cash flow
        let outOfPocketInterest = 0;
        if (capitalizeInterest) {
            currentLoan += yearlyInterest;
            currentLoan -= yearlyTaxRefund;
        } else {
            outOfPocketInterest = yearlyInterest - yearlyTaxRefund;
        }

        // 4. Calculate Investment Growth (on the balance before this year's new contributions)
        const investmentGrowth = currentInvestment * annualReturn;
        currentInvestment += investmentGrowth;

        // 5. Process new contributions at the END of the year
        currentLoan += totalAnnualContribution;
        currentInvestment += totalAnnualContribution;

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
    // If not capitalizing, user put out cash for interest. ROC = Gain / Total Out of Pocket Cash
    // If capitalizing, out of pocket is technically 0 (or just the initial setup fees), making ROC infinite.
    // However, if they are making periodic contributions, that IS out of pocket cash going into the strategy.

    let outOfPocketTotal = 0;
    if (!capitalizeInterest) {
        outOfPocketTotal = yearlyData.reduce((sum, data) => sum + data.outOfPocketInterest, 0);
    }

    // Add the total periodic contributions to the out of pocket cost base
    const totalPeriodicContributions = totalAnnualContribution * years;
    outOfPocketTotal += totalPeriodicContributions;

    let roc = 0;
    if (outOfPocketTotal > 0) {
        roc = (totalNetGain / outOfPocketTotal) * 100;
    } else {
        // If they capitalized and contributed $0 periodically, calculate ROC based on the initial HELOC draw
        roc = (finalNetWorth / initialInvestment) * 100;
    }

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
