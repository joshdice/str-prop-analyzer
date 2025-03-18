// utils/exporters.ts
import { ScenarioData } from '../types';

/**
 * Generate and download a CSV file with all scenarios data
 */
export const downloadRawData = (scenarios: ScenarioData[]): void => {
  if (scenarios.length === 0) return;
  
  // Create CSV header
  const headers = [
    'Purchase Price',
    'Down Payment %',
    'Down Payment $',
    'Interest Rate',
    'Cap Rate',
    'Loan Amount',
    'Monthly Mortgage',
    'Monthly Property Tax',
    'Monthly Insurance',
    'Monthly HOA',
    'Monthly Management',
    'Total Monthly Expenses',
    'Monthly Income',
    'Monthly Cashflow',
    'Annual Cashflow',
    'Initial Investment',
    'ROI'
  ];
  
  // Create CSV content
  let csvContent = headers.join(',') + '\n';
  
  scenarios.forEach(scenario => {
    const row = [
      scenario.purchasePrice,
      scenario.downPaymentPercentage,
      scenario.downPayment,
      scenario.interestRate,
      scenario.capRate,
      scenario.loanAmount,
      scenario.monthlyMortgagePayment,
      scenario.monthlyPropertyTax,
      scenario.monthlyInsurance,
      scenario.monthlyHOA,
      scenario.monthlyManagementCost,
      scenario.totalMonthlyExpenses,
      scenario.monthlyIncome,
      scenario.monthlyCashflow,
      scenario.annualCashflow,
      scenario.initialInvestment,
      scenario.annualROI
    ];
    
    csvContent += row.join(',') + '\n';
  });
  
  // Create blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'property_investment_scenarios.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};