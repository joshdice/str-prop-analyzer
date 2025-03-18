// utils/calculations.ts
import { 
  CalculationInputs, 
  CalculationResults, 
  ScenarioData,
  YearlyData,
  CashflowByDownPaymentData,
  ROIByCapRateData,
  ROIByPurchasePriceData
} from '../types';

/**
 * Calculate all scenarios based on input parameters
 */
export const calculateScenarios = (inputs: CalculationInputs): CalculationResults => {
  const {
    purchasePrices,
    downPaymentPercentages,
    interestRates,
    capRates,
    annualPropertyTax,
    annualInsurance,
    monthlyHOA,
    onboardingCosts,
    propertyManagementRate
  } = inputs;

  const allScenarios: ScenarioData[] = [];
  
  purchasePrices.forEach(purchasePrice => {
    downPaymentPercentages.forEach(downPaymentPercentage => {
      interestRates.forEach(interestRate => {
        capRates.forEach(capRate => {
          // Calculate down payment
          const downPayment = purchasePrice * (downPaymentPercentage / 100);
          
          // Calculate loan amount
          const loanAmount = purchasePrice - downPayment;
          
          // Calculate monthly mortgage payment
          const monthlyInterestRate = interestRate / 100 / 12;
          const loanTermMonths = 30 * 12;
          const monthlyMortgagePayment = 
            loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTermMonths)) / 
            (Math.pow(1 + monthlyInterestRate, loanTermMonths) - 1);
          
          // Calculate monthly costs
          const monthlyPropertyTax = annualPropertyTax / 12;
          const monthlyInsurance = annualInsurance / 12;
          const totalMonthlyExpenses = monthlyMortgagePayment + monthlyPropertyTax + monthlyInsurance + monthlyHOA;
          
          // Calculate income based on cap rate
          const annualGrossIncome = purchasePrice * (capRate / 100);
          const monthlyIncome = annualGrossIncome / 12;
          
          // Calculate property management costs
          const monthlyManagementCost = monthlyIncome * (propertyManagementRate / 100);

          // Calculate cashflow
          const monthlyCashflow = monthlyIncome - totalMonthlyExpenses - monthlyManagementCost;
          const annualCashflow = monthlyCashflow * 12;
          
          // Calculate ROI
          const initialInvestment = downPayment + onboardingCosts;
          const annualROI = (annualCashflow / initialInvestment) * 100;
          
          // Calculate 5-year data
          const fiveYearData: YearlyData[] = [];
          for (let year = 1; year <= 5; year++) {
            const yearlyData: YearlyData = {
              year,
              monthlyExpenses: totalMonthlyExpenses,
              monthlyManagementCost,
              monthlyIncome,
              monthlyCashflow,
              annualExpenses: totalMonthlyExpenses * 12,
              annualManagementCost: monthlyManagementCost * 12,
              annualIncome: monthlyIncome * 12,
              annualCashflow,
              cumulativeCashflow: annualCashflow * year
            };
            fiveYearData.push(yearlyData);
          }
          
          // Store the scenario
          allScenarios.push({
            purchasePrice,
            downPaymentPercentage,
            interestRate,
            capRate,
            downPayment,
            loanAmount,
            monthlyMortgagePayment,
            monthlyPropertyTax,
            monthlyInsurance,
            monthlyHOA,
            monthlyManagementCost,
            totalMonthlyExpenses,
            monthlyIncome,
            monthlyCashflow,
            annualCashflow,
            initialInvestment,
            annualROI,
            fiveYearData,
            isPositiveCashflow: monthlyCashflow > 0
          });
        });
      });
    });
  });
  
  // Sort scenarios by ROI
  allScenarios.sort((a, b) => b.annualROI - a.annualROI);
  
  // Get top 10 scenarios
  const topScenarios = allScenarios.slice(0, 10);
  
  // Set best and worst scenarios
  const bestScenario = allScenarios.length > 0 ? allScenarios[0] : null;
  const worstScenario = allScenarios.length > 0 ? allScenarios[allScenarios.length - 1] : null;
  
  // Get specific scenarios
  const specificScenariosFiltered = allScenarios.filter(scenario => 
    scenario.purchasePrice === 900000 && 
    scenario.interestRate === 7.0 && 
    scenario.capRate === 10
  );
  
  // Sort by down payment percentage
  specificScenariosFiltered.sort((a, b) => a.downPaymentPercentage - b.downPaymentPercentage);
  
  // Generate chart data
  const cashflowByDownPayment = generateCashflowByDownPayment(allScenarios);
  const roiByCapRate = generateRoiByCapRate(allScenarios);
  const roiByPurchasePrice = generateRoiByPurchasePrice(allScenarios);
  
  return {
    allScenarios,
    topScenarios,
    bestScenario,
    worstScenario,
    specificScenarios: specificScenariosFiltered,
    cashflowByDownPayment,
    roiByCapRate,
    roiByPurchasePrice
  };
};

/**
 * Generate data for Cashflow by Down Payment chart
 */
export const generateCashflowByDownPayment = (scenarios: ScenarioData[]): CashflowByDownPaymentData[] => {
  const groupedByDownPayment: { [key: number]: ScenarioData[] } = {};
  
  // Group scenarios by down payment percentage
  scenarios.forEach(scenario => {
    const { downPaymentPercentage } = scenario;
    if (!groupedByDownPayment[downPaymentPercentage]) {
      groupedByDownPayment[downPaymentPercentage] = [];
    }
    groupedByDownPayment[downPaymentPercentage].push(scenario);
  });
  
  // Calculate average monthly cashflow for each down payment percentage
  return Object.keys(groupedByDownPayment).map(key => {
    const downPaymentPercentage = Number(key);
    const scenariosInGroup = groupedByDownPayment[downPaymentPercentage];
    const totalCashflow = scenariosInGroup.reduce((sum, scenario) => sum + scenario.monthlyCashflow, 0);
    const avgMonthlyCashflow = totalCashflow / scenariosInGroup.length;
    
    return {
      downPaymentPercentage,
      avgMonthlyCashflow
    };
  }).sort((a, b) => a.downPaymentPercentage - b.downPaymentPercentage);
};

/**
 * Generate data for ROI by Cap Rate chart
 */
export const generateRoiByCapRate = (scenarios: ScenarioData[]): ROIByCapRateData[] => {
  const groupedByCapRate: { [key: number]: ScenarioData[] } = {};
  
  // Group scenarios by cap rate
  scenarios.forEach(scenario => {
    const { capRate } = scenario;
    if (!groupedByCapRate[capRate]) {
      groupedByCapRate[capRate] = [];
    }
    groupedByCapRate[capRate].push(scenario);
  });
  
  // Calculate min, max, and average ROI for each cap rate
  return Object.keys(groupedByCapRate).map(key => {
    const capRate = Number(key);
    const scenariosInGroup = groupedByCapRate[capRate];
    
    const rois = scenariosInGroup.map(scenario => scenario.annualROI);
    const minROI = Math.min(...rois);
    const maxROI = Math.max(...rois);
    const totalROI = scenariosInGroup.reduce((sum, scenario) => sum + scenario.annualROI, 0);
    const avgROI = totalROI / scenariosInGroup.length;
    
    return {
      capRate,
      minROI,
      avgROI,
      maxROI
    };
  }).sort((a, b) => a.capRate - b.capRate);
};

/**
 * Generate data for ROI by Purchase Price chart
 */
export const generateRoiByPurchasePrice = (scenarios: ScenarioData[]): ROIByPurchasePriceData[] => {
  const groupedByPurchasePrice: { [key: number]: ScenarioData[] } = {};
  
  // Group scenarios by purchase price
  scenarios.forEach(scenario => {
    const { purchasePrice } = scenario;
    if (!groupedByPurchasePrice[purchasePrice]) {
      groupedByPurchasePrice[purchasePrice] = [];
    }
    groupedByPurchasePrice[purchasePrice].push(scenario);
  });
  
  // Calculate average ROI and percentage of positive cashflow for each purchase price
  return Object.keys(groupedByPurchasePrice).map(key => {
    const purchasePrice = Number(key);
    const scenariosInGroup = groupedByPurchasePrice[purchasePrice];
    
    const totalROI = scenariosInGroup.reduce((sum, scenario) => sum + scenario.annualROI, 0);
    const avgROI = totalROI / scenariosInGroup.length;
    
    const positiveCashflowCount = scenariosInGroup.filter(scenario => scenario.isPositiveCashflow).length;
    const positiveCashflowPercentage = (positiveCashflowCount / scenariosInGroup.length) * 100;
    
    return {
      purchasePrice: purchasePrice / 1000, // Convert to K for display
      avgROI,
      positiveCashflowPercentage
    };
  }).sort((a, b) => a.purchasePrice - b.purchasePrice);
};