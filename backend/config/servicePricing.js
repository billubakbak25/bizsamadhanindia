const { buildServicePricingMap } = require('./serviceCatalog');

module.exports = {
  'GST Registration': {
    amount: 199900,
    currency: 'INR',
    description: 'GST registration service package',
  },
  'Income Tax Return': {
    amount: 99900,
    currency: 'INR',
    description: 'Income tax return filing package',
  },
  'Income Tax Return (ITR)': {
    amount: 99900,
    currency: 'INR',
    description: 'Income tax return filing package',
  },
  'Company Registration': {
    amount: 499900,
    currency: 'INR',
    description: 'Company registration service package',
  },
  'Trademark Registration': {
    amount: 249900,
    currency: 'INR',
    description: 'Trademark registration service package',
  },
  ...buildServicePricingMap(),
};
