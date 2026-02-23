// Source: Estimated 2024 Canadian Tax Brackets (Simplified for calculation purposes)
export const TAX_BRACKETS = {
  federal: [
    { upTo: 55867, rate: 0.15 },
    { upTo: 111733, rate: 0.205 },
    { upTo: 173205, rate: 0.26 },
    { upTo: 246752, rate: 0.29 },
    { upTo: Infinity, rate: 0.33 }
  ],
  ON: [
    { upTo: 51446, rate: 0.0505 },
    { upTo: 102894, rate: 0.0915 },
    { upTo: 150000, rate: 0.1116 },
    { upTo: 220000, rate: 0.1216 },
    { upTo: Infinity, rate: 0.1316 }
  ],
  BC: [
    { upTo: 47937, rate: 0.0506 },
    { upTo: 95875, rate: 0.077 },
    { upTo: 110076, rate: 0.105 },
    { upTo: 133792, rate: 0.1229 },
    { upTo: 181232, rate: 0.147 },
    { upTo: 252752, rate: 0.168 },
    { upTo: Infinity, rate: 0.205 }
  ],
  AB: [
    { upTo: 148269, rate: 0.10 },
    { upTo: 177922, rate: 0.12 },
    { upTo: 237230, rate: 0.13 },
    { upTo: 355845, rate: 0.14 },
    { upTo: Infinity, rate: 0.15 }
  ],
  QC: [
    { upTo: 51059, rate: 0.14 },
    { upTo: 102114, rate: 0.19 },
    { upTo: 125359, rate: 0.24 },
    { upTo: Infinity, rate: 0.2575 }
  ],
  MB: [
    { upTo: 47000, rate: 0.108 },
    { upTo: 100000, rate: 0.1275 },
    { upTo: Infinity, rate: 0.174 }
  ],
  SK: [
    { upTo: 52057, rate: 0.105 },
    { upTo: 148734, rate: 0.125 },
    { upTo: Infinity, rate: 0.145 }
  ],
  NS: [
    { upTo: 29590, rate: 0.0879 },
    { upTo: 59180, rate: 0.1495 },
    { upTo: 93000, rate: 0.1667 },
    { upTo: 150000, rate: 0.175 },
    { upTo: Infinity, rate: 0.21 }
  ],
  NB: [
    { upTo: 49958, rate: 0.094 },
    { upTo: 99916, rate: 0.1482 },
    { upTo: 185064, rate: 0.1652 },
    { upTo: Infinity, rate: 0.195 }
  ],
  NL: [
    { upTo: 43198, rate: 0.087 },
    { upTo: 86395, rate: 0.145 },
    { upTo: 154244, rate: 0.158 },
    { upTo: 215950, rate: 0.173 },
    { upTo: 275870, rate: 0.183 },
    { upTo: 551739, rate: 0.198 },
    { upTo: 1103478, rate: 0.208 },
    { upTo: Infinity, rate: 0.218 }
  ],
  PE: [
    { upTo: 32656, rate: 0.0965 },
    { upTo: 64313, rate: 0.1363 },
    { upTo: 105000, rate: 0.1665 },
    { upTo: 140000, rate: 0.18 },
    { upTo: Infinity, rate: 0.1875 }
  ]
};

export const PROVINCES = [
  { value: 'ON', label: 'Ontario' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'AB', label: 'Alberta' },
  { value: 'QC', label: 'Quebec' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'PE', label: 'Prince Edward Island' },
];

/**
 * Calculates the total tax and average or marginal tax rate
 * @param {number} income Total annual income
 * @param {string} province Province abbreviation
 * @returns {object} { totalTax, marginalRate, details }
 */
export function calculateTax(income, province) {
  if (!income || income <= 0 || !TAX_BRACKETS[province]) {
    return { totalTax: 0, marginalRate: 0, details: [] };
  }

  let totalTax = 0;
  let prevLimit = 0;
  let marginalRate = 0;
  let details = [];

  // Calculate Federal Tax
  const federalBrackets = TAX_BRACKETS.federal;
  let fedTax = 0;
  let currentFedMarginal = 0;
  
  for (const b of federalBrackets) {
    if (income > prevLimit) {
      const taxableInBracket = Math.min(income - prevLimit, b.upTo - prevLimit);
      const taxInBracket = taxableInBracket * b.rate;
      fedTax += taxInBracket;
      currentFedMarginal = b.rate;
      details.push({
        level: 'Federal',
        bracket: `up to ${b.upTo}`,
        taxable: taxableInBracket,
        rate: b.rate,
        tax: taxInBracket
      });
    }
    prevLimit = b.upTo;
  }

  // Calculate Provincial Tax
  prevLimit = 0;
  const provBrackets = TAX_BRACKETS[province];
  let provTax = 0;
  let currentProvMarginal = 0;

  for (const b of provBrackets) {
    if (income > prevLimit) {
      const taxableInBracket = Math.min(income - prevLimit, b.upTo - prevLimit);
      const taxInBracket = taxableInBracket * b.rate;
      provTax += taxInBracket;
      currentProvMarginal = b.rate;
      details.push({
        level: 'Provincial',
        bracket: `up to ${b.upTo}`,
        taxable: taxableInBracket,
        rate: b.rate,
        tax: taxInBracket
      });
    }
    prevLimit = b.upTo;
  }

  totalTax = fedTax + provTax;
  marginalRate = currentFedMarginal + currentProvMarginal;

  return { totalTax, marginalRate, details };
}
