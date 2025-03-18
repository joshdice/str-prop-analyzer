// types.ts
export interface YearlyData {
  year: number;
  monthlyExpenses: number;
  monthlyManagementCost: number;
  monthlyIncome: number;
  monthlyCashflow: number;
  annualExpenses: number;
  annualManagementCost: number;
  annualIncome: number;
  annualCashflow: number;
  cumulativeCashflow: number;
}

export interface ScenarioData {
  purchasePrice: number;
  downPaymentPercentage: number;
  interestRate: number;
  capRate: number;
  downPayment: number;
  loanAmount: number;
  monthlyMortgagePayment: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyManagementCost: number;
  totalMonthlyExpenses: number;
  monthlyIncome: number;
  monthlyCashflow: number;
  annualCashflow: number;
  initialInvestment: number;
  annualROI: number;
  fiveYearData: YearlyData[];
  isPositiveCashflow: boolean;
}

export interface CalculationInputs {
  purchasePrices: number[];
  downPaymentPercentages: number[];
  interestRates: number[];
  capRates: number[];
  annualPropertyTax: number;
  annualInsurance: number;
  monthlyHOA: number;
  onboardingCosts: number;
  propertyManagementRate: number;
}

export interface CalculationResults {
  allScenarios: ScenarioData[];
  topScenarios: ScenarioData[];
  bestScenario: ScenarioData | null;
  worstScenario: ScenarioData | null;
  specificScenarios: ScenarioData[];
  cashflowByDownPayment: CashflowByDownPaymentData[];
  roiByCapRate: ROIByCapRateData[];
  roiByPurchasePrice: ROIByPurchasePriceData[];
}

export interface ChartData {
  [key: string]: number | string;
}

export interface CashflowByDownPaymentData extends ChartData {
  downPaymentPercentage: number;
  avgMonthlyCashflow: number;
}

export interface ROIByCapRateData extends ChartData {
  capRate: number;
  minROI: number;
  avgROI: number;
  maxROI: number;
}

export interface ROIByPurchasePriceData extends ChartData {
  purchasePrice: number;
  avgROI: number;
  positiveCashflowPercentage: number;
}

export interface UpdateFixedCostsFunctions {
  setAnnualPropertyTax: (value: number) => void;
  setAnnualInsurance: (value: number) => void;
  setMonthlyHOA: (value: number) => void;
  setOnboardingCosts: (value: number) => void;
  setPropertyManagementRate: (value: number) => void;
}