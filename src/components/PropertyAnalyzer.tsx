import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, LineChart, Line
} from 'recharts';

const PropertyAnalyzer = () => {
  // Define default fixed costs
  const [fixedCosts, setFixedCosts] = useState({
    propertyTax: 5000,  // Annual property tax
    insurance: 2400,    // Annual insurance
    hoa: 300,           // Monthly HOA
    onboarding: 5000    // One-time onboarding costs
  });

  // State for calculation results
  const [results, setResults] = useState([]);
  const [topScenarios, setTopScenarios] = useState([]);
  const [bestScenario, setBestScenario] = useState(null);
  const [worstScenario, setWorstScenario] = useState(null);
  const [roiByPrice, setRoiByPrice] = useState([]);
  const [cashflowByDownpayment, setCashflowByDownpayment] = useState([]);
  const [roiByCapRate, setRoiByCapRate] = useState([]);

  // Define ranges based on user requirements
  const purchasePrices = [500000, 600000, 700000, 800000, 900000];
  const downPaymentPercentages = [25, 35, 45, 55, 65, 75];
  const interestRates = [6.0, 6.5, 7.0, 7.5, 8.0];
  const capRates = Array.from({ length: 15 }, (_, i) => i + 1);
  
  // Advanced parameters with defaults
  const [advancedParams, setAdvancedParams] = useState({
    propertyAppreciationRate: 3.0,  // Annual appreciation in percentage
    rentIncreaseRate: 2.0,          // Annual rent increase in percentage
    vacancyRate: 5.0,               // Vacancy rate in percentage
    maintenancePercent: 1.0,        // Maintenance as percentage of property value
    propertyManagementPercent: 8.0, // Property management fee as percentage of rental income
    inflationRate: 2.5,             // Annual inflation rate for expenses
    yearsToHold: 10,                // Investment horizon in years
    sellingCostPercent: 6.0,        // Selling costs as percentage of sale price
    taxRate: 25.0                   // Income tax rate for rental income
  });
  
  // Calculate mortgage payment
  const calculateMortgagePayment = (loanAmount, interestRate, loanTermYears) => {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    return loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  // Generate all scenarios and calculate metrics
  useEffect(() => {
    const allScenarios = [];
    
    purchasePrices.forEach(purchasePrice => {
      downPaymentPercentages.forEach(downPaymentPercentage => {
        interestRates.forEach(interestRate => {
          capRates.forEach(capRate => {
            // Calculate downpayment amount
            const downPayment = (downPaymentPercentage / 100) * purchasePrice;
            
            // Calculate loan amount
            const loanAmount = purchasePrice - downPayment;
            
            // Calculate mortgage payment (30-year fixed)
            const monthlyMortgagePayment = calculateMortgagePayment(loanAmount, interestRate, 30);
            
            // Calculate monthly rental income based on cap rate
            // Cap rate = Net Operating Income / Property Value
            // Monthly rental income = (Cap Rate * Property Value / 12) + Monthly Expenses
            const annualExpenses = fixedCosts.propertyTax + fixedCosts.insurance + (fixedCosts.hoa * 12);
            const netOperatingIncome = (capRate / 100) * purchasePrice;
            const monthlyRentalIncome = (netOperatingIncome + annualExpenses) / 12;
            
            // Calculate monthly and annual cash flows
            const monthlyCosts = monthlyMortgagePayment + fixedCosts.hoa + (fixedCosts.propertyTax / 12) + (fixedCosts.insurance / 12);
            const monthlyCashflow = monthlyRentalIncome - monthlyCosts;
            const annualCashflow = monthlyCashflow * 12;
            
            // Calculate ROI
            const initialInvestment = downPayment + fixedCosts.onboarding;
            const roi = (annualCashflow / initialInvestment) * 100;
            
            // Calculate cash flow for the first 5 years (simplified, no appreciation or rent increases)
            const cashflowByYear = Array(5).fill().map((_, i) => ({
              year: i + 1,
              monthlyCashflow,
              annualCashflow
            }));

            allScenarios.push({
              purchasePrice,
              downPaymentPercentage,
              downPayment,
              interestRate,
              capRate,
              loanAmount,
              monthlyMortgagePayment,
              monthlyRentalIncome,
              monthlyCosts,
              monthlyCashflow,
              annualCashflow,
              roi,
              initialInvestment,
              cashflowByYear,
              isPositiveCashflow: monthlyCashflow > 0
            });
          });
        });
      });
    });
    
    // Sort scenarios by ROI (descending)
    const sortedScenarios = [...allScenarios].sort((a, b) => b.roi - a.roi);
    
    // Set results
    setResults(allScenarios);
    setTopScenarios(sortedScenarios.slice(0, 10));
    setBestScenario(sortedScenarios[0]);
    setWorstScenario(sortedScenarios[sortedScenarios.length - 1]);
    
    // Prepare data for ROI by purchase price chart
    const roiByPriceData = purchasePrices.map(price => {
      const relevantScenarios = allScenarios.filter(s => s.purchasePrice === price);
      const avgRoi = relevantScenarios.reduce((sum, s) => sum + s.roi, 0) / relevantScenarios.length;
      const positiveCount = relevantScenarios.filter(s => s.monthlyCashflow > 0).length;
      const negativeCount = relevantScenarios.length - positiveCount;
      
      return {
        purchasePrice: price / 1000 + 'k',
        averageRoi: avgRoi,
        positiveCount,
        negativeCount,
        totalScenarios: relevantScenarios.length
      };
    });
    setRoiByPrice(roiByPriceData);
    
    // Prepare data for cashflow by downpayment chart
    const cashflowByDownpaymentData = downPaymentPercentages.map(percentage => {
      const relevantScenarios = allScenarios.filter(s => s.downPaymentPercentage === percentage);
      const avgMonthlyCashflow = relevantScenarios.reduce((sum, s) => sum + s.monthlyCashflow, 0) / relevantScenarios.length;
      
      return {
        downPaymentPercentage: percentage + '%',
        averageMonthlyCashflow: avgMonthlyCashflow
      };
    });
    setCashflowByDownpayment(cashflowByDownpaymentData);
    
    // Prepare data for ROI by cap rate chart
    const roiByCapRateData = capRates.map(rate => {
      const relevantScenarios = allScenarios.filter(s => s.capRate === rate);
      const avgRoi = relevantScenarios.reduce((sum, s) => sum + s.roi, 0) / relevantScenarios.length;
      const minRoi = Math.min(...relevantScenarios.map(s => s.roi));
      const maxRoi = Math.max(...relevantScenarios.map(s => s.roi));
      
      return {
        capRate: rate + '%',
        averageRoi: avgRoi,
        minRoi,
        maxRoi
      };
    });
    setRoiByCapRate(roiByCapRateData);
    
  }, [fixedCosts]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Custom tooltip for ROI by price chart
  const RoiTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-white border rounded shadow">
          <p className="font-bold">{data.purchasePrice}</p>
          <p>Average ROI: {data.averageRoi.toFixed(2)}%</p>
          <p>Positive cashflow scenarios: {data.positiveCount} ({((data.positiveCount / data.totalScenarios) * 100).toFixed(1)}%)</p>
          <p>Negative cashflow scenarios: {data.negativeCount} ({((data.negativeCount / data.totalScenarios) * 100).toFixed(1)}%)</p>
        </div>
      );
    }
    return null;
  };

  // Toggle for advanced settings
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    minCashflow: -5000,
    minRoi: -20,
    maxPrice: 1000000
  });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Apply filters to results
  const filteredResults = results.filter(scenario => 
    scenario.monthlyCashflow >= filters.minCashflow && 
    scenario.roi >= filters.minRoi &&
    scenario.purchasePrice <= filters.maxPrice
  );
  
  // Calculate additional metrics for best scenario
  const calculateMetrics = (scenario) => {
    if (!scenario) return null;
    
    const metrics = {
      cashOnCash: scenario.roi,
      totalReturnOnInvestment: 0,
      internalRateOfReturn: 0,
      breakEvenPoint: 0
    };
    
    // Calculate break-even point (months)
    metrics.breakEvenPoint = scenario.initialInvestment / (scenario.monthlyCashflow > 0 ? scenario.monthlyCashflow : 1);
    
    // Calculate future value after holding period
    const futurePropertyValue = scenario.purchasePrice * Math.pow(1 + advancedParams.propertyAppreciationRate / 100, advancedParams.yearsToHold);
    const sellingCosts = futurePropertyValue * (advancedParams.sellingCostPercent / 100);
    const netSaleProceeds = futurePropertyValue - sellingCosts - scenario.loanAmount;
    
    // Calculate cumulative cashflow over holding period
    let cumulativeCashflow = 0;
    const futureCashflows = [];
    let currentRent = scenario.monthlyRentalIncome;
    let currentExpenses = scenario.monthlyCosts - scenario.monthlyMortgagePayment;
    let yearlyTaxes = 0;
    
    for (let year = 1; year <= advancedParams.yearsToHold; year++) {
      // Increase rent by rent increase rate
      if (year > 1) {
        currentRent *= (1 + advancedParams.rentIncreaseRate / 100);
        currentExpenses *= (1 + advancedParams.inflationRate / 100);
      }
      
      // Calculate annual cash flow considering vacancy
      const effectiveAnnualRent = currentRent * 12 * (1 - advancedParams.vacancyRate / 100);
      const maintenanceCost = (advancedParams.maintenancePercent / 100) * scenario.purchasePrice;
      const propertyManagement = (advancedParams.propertyManagementPercent / 100) * effectiveAnnualRent;
      const annualExpenses = (currentExpenses * 12) + maintenanceCost + propertyManagement;
      const mortgagePayments = scenario.monthlyMortgagePayment * 12;
      
      const annualOperatingIncome = effectiveAnnualRent - annualExpenses;
      const annualCashflow = annualOperatingIncome - mortgagePayments;
      
      // Tax considerations
      const interestPortion = calculateInterestPortion(scenario.loanAmount, scenario.interestRate, 30, year);
      const depreciation = scenario.purchasePrice * 0.8 / 27.5; // Building value depreciated over 27.5 years
      const taxableIncome = annualOperatingIncome - interestPortion - depreciation;
      const taxAmount = Math.max(0, taxableIncome * (advancedParams.taxRate / 100));
      yearlyTaxes = taxAmount;
      
      const afterTaxCashflow = annualCashflow - taxAmount;
      cumulativeCashflow += afterTaxCashflow;
      
      futureCashflows.push({
        year,
        effectiveRent: effectiveAnnualRent,
        operatingExpenses: annualExpenses,
        operatingIncome: annualOperatingIncome,
        mortgagePayments,
        cashflowBeforeTax: annualCashflow,
        taxableIncome,
        taxAmount,
        afterTaxCashflow,
        cumulativeCashflow
      });
    }
    
    // Calculate total return
    metrics.totalReturnOnInvestment = ((netSaleProceeds + cumulativeCashflow) / scenario.initialInvestment - 1) * 100;
    
    // Calculate approximate IRR (simplified)
    const initialOutflow = -scenario.initialInvestment;
    const yearlyInflows = futureCashflows.map(cf => cf.afterTaxCashflow);
    yearlyInflows[yearlyInflows.length - 1] += netSaleProceeds;
    
    // Simplified IRR calculation
    let irr = 0;
    for (let r = 0.01; r <= 0.5; r += 0.01) {
      const npv = initialOutflow + yearlyInflows.reduce((sum, inflow, i) => sum + inflow / Math.pow(1 + r, i + 1), 0);
      if (npv >= 0) {
        irr = r * 100;
        break;
      }
    }
    metrics.internalRateOfReturn = irr;
    
    return {
      ...metrics,
      futureCashflows,
      netSaleProceeds,
      futurePropertyValue,
      yearlyTaxes
    };
  };
  
  // Helper function to calculate interest portion of mortgage payment for a given year
  const calculateInterestPortion = (loanAmount, interestRate, loanTermYears, currentYear) => {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;
    const monthlyPayment = calculateMortgagePayment(loanAmount, interestRate, loanTermYears);
    
    let remainingBalance = loanAmount;
    let totalInterestThisYear = 0;
    
    // Calculate for previous years
    for (let year = 1; year < currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingBalance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        remainingBalance -= principalPayment;
      }
    }
    
    // Calculate for current year
    for (let month = 1; month <= 12; month++) {
      const interestPayment = remainingBalance * monthlyRate;
      totalInterestThisYear += interestPayment;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
    }
    
    return totalInterestThisYear;
  };
  
  // Calculate advanced metrics for best scenario
  const bestScenarioMetrics = bestScenario ? calculateMetrics(bestScenario) : null;
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Advanced Investment Property Analysis Tool</h1>
      
      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'detailed' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('detailed')}
        >
          Detailed Analysis
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'projections' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('projections')}
        >
          Long-term Projections
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {/* Filter Controls */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Min Monthly Cashflow</label>
            <input 
              type="number" 
              className="w-32 p-2 border rounded"
              value={filters.minCashflow}
              onChange={(e) => setFilters({...filters, minCashflow: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Min ROI (%)</label>
            <input 
              type="number" 
              className="w-32 p-2 border rounded"
              value={filters.minRoi}
              onChange={(e) => setFilters({...filters, minRoi: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Price</label>
            <input 
              type="number" 
              className="w-32 p-2 border rounded"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
            />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-600">Showing {filteredResults.length} of {results.length} scenarios</p>
          </div>
        </div>
      </div>
      
      {/* Projections Tab */}
      {activeTab === 'projections' && bestScenario && bestScenarioMetrics && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Long-term Investment Projections</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4">Property Value Projection</h3>
              <p className="mb-4 text-gray-600">Property value over {advancedParams.yearsToHold} years with {advancedParams.propertyAppreciationRate}% annual appreciation.</p>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={Array.from({ length: advancedParams.yearsToHold + 1 }, (_, i) => ({
                      year: i,
                      propertyValue: bestScenario.purchasePrice * Math.pow(1 + advancedParams.propertyAppreciationRate / 100, i),
                      mortgageBalance: i === 0 ? bestScenario.loanAmount : 
                        calculateMortgageBalance(bestScenario.loanAmount, bestScenario.interestRate, 30, i),
                      equity: (bestScenario.purchasePrice * Math.pow(1 + advancedParams.propertyAppreciationRate / 100, i)) - 
                        (i === 0 ? bestScenario.loanAmount : 
                          calculateMortgageBalance(bestScenario.loanAmount, bestScenario.interestRate, 30, i))
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                    <Legend />
                    <Line type="monotone" dataKey="propertyValue" name="Property Value" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="mortgageBalance" name="Mortgage Balance" stroke="#ff8042" />
                    <Line type="monotone" dataKey="equity" name="Owner's Equity" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4">Cumulative Cash Flow</h3>
              <p className="mb-4 text-gray-600">Cumulative after-tax cash flow over {advancedParams.yearsToHold} years.</p>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={bestScenarioMetrics.futureCashflows}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Cumulative Cash Flow ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                    <Legend />
                    <Line type="monotone" dataKey="cumulativeCashflow" name="Cumulative Cash Flow" stroke="#8884d8" strokeWidth={2} />
                    <Line 
                      type="monotone" 
                      dataKey="afterTaxCashflow" 
                      name="Annual Cash Flow" 
                      stroke="#82ca9d" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border mb-8">
            <h3 className="text-xl font-bold mb-4">Total Return Breakdown</h3>
            <p className="mb-4 text-gray-600">Breakdown of returns over {advancedParams.yearsToHold} year holding period.</p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      name: 'Initial Investment',
                      value: -bestScenario.initialInvestment
                    },
                    {
                      name: 'Cumulative Cash Flow',
                      value: bestScenarioMetrics.futureCashflows[bestScenarioMetrics.futureCashflows.length - 1].cumulativeCashflow
                    },
                    {
                      name: 'Net Sale Proceeds',
                      value: bestScenarioMetrics.netSaleProceeds
                    },
                    {
                      name: 'Total Return',
                      value: bestScenarioMetrics.netSaleProceeds + 
                        bestScenarioMetrics.futureCashflows[bestScenarioMetrics.futureCashflows.length - 1].cumulativeCashflow - 
                        bestScenario.initialInvestment
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                  <Bar 
                    dataKey="value" 
                    fill={(entry) => entry.value < 0 ? '#ff8042' : '#82ca9d'} 
                    name="Amount" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4">Return Metrics Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-lg text-blue-800 mb-2">Cash-on-Cash ROI</h4>
                <p className="text-3xl font-bold text-blue-600">{bestScenario.roi.toFixed(2)}%</p>
                <p className="text-sm text-gray-600 mt-2">First year return on investment based on annual cash flow.</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-bold text-lg text-green-800 mb-2">Total ROI</h4>
                <p className="text-3xl font-bold text-green-600">{bestScenarioMetrics.totalReturnOnInvestment.toFixed(2)}%</p>
                <p className="text-sm text-gray-600 mt-2">Total return including cash flow and equity appreciation over {advancedParams.yearsToHold} years.</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-bold text-lg text-purple-800 mb-2">Internal Rate of Return</h4>
                <p className="text-3xl font-bold text-purple-600">{bestScenarioMetrics.internalRateOfReturn.toFixed(2)}%</p>
                <p className="text-sm text-gray-600 mt-2">Annualized rate of return accounting for the time value of money.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'dashboard' && bestScenario && worstScenario && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <h2 className="text-xl font-bold text-green-800 mb-3">Best ROI Scenario</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Purchase Price:</div>
              <div className="font-semibold">{formatCurrency(bestScenario.purchasePrice)}</div>
              
              <div>Down Payment:</div>
              <div className="font-semibold">{bestScenario.downPaymentPercentage}% ({formatCurrency(bestScenario.downPayment)})</div>
              
              <div>Interest Rate:</div>
              <div className="font-semibold">{bestScenario.interestRate}%</div>
              
              <div>Cap Rate:</div>
              <div className="font-semibold">{bestScenario.capRate}%</div>
              
              <div>Monthly Cashflow:</div>
              <div className="font-semibold text-green-700">{formatCurrency(bestScenario.monthlyCashflow)}</div>
              
              <div>ROI:</div>
              <div className="font-semibold text-green-700">{bestScenario.roi.toFixed(2)}%</div>
              
              {bestScenarioMetrics && (
                <>
                  <div>Total ROI (10yr):</div>
                  <div className="font-semibold text-green-700">{bestScenarioMetrics.totalReturnOnInvestment.toFixed(2)}%</div>
                  
                  <div>IRR:</div>
                  <div className="font-semibold text-green-700">{bestScenarioMetrics.internalRateOfReturn.toFixed(2)}%</div>
                  
                  <div>Break-even (months):</div>
                  <div className="font-semibold">{bestScenarioMetrics.breakEvenPoint.toFixed(1)}</div>
                </>
              )}
            </div>
          </div>
          
          <div className="p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-bold text-red-800 mb-3">Worst ROI Scenario</h2>
            <div className="grid grid-cols-2 gap-2">
              <div>Purchase Price:</div>
              <div className="font-semibold">{formatCurrency(worstScenario.purchasePrice)}</div>
              
              <div>Down Payment:</div>
              <div className="font-semibold">{worstScenario.downPaymentPercentage}% ({formatCurrency(worstScenario.downPayment)})</div>
              
              <div>Interest Rate:</div>
              <div className="font-semibold">{worstScenario.interestRate}%</div>
              
              <div>Cap Rate:</div>
              <div className="font-semibold">{worstScenario.capRate}%</div>
              
              <div>Monthly Cashflow:</div>
              <div className="font-semibold text-red-700">{formatCurrency(worstScenario.monthlyCashflow)}</div>
              
              <div>ROI:</div>
              <div className="font-semibold text-red-700">{worstScenario.roi.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'dashboard' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">ROI Distribution by Purchase Price</h2>
          <p className="mb-4 text-gray-600">This chart shows the average ROI for each purchase price point, along with the number of positive and negative cashflow scenarios.</p>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roiByPrice} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="purchasePrice" />
                <YAxis yAxisId="left" orientation="left" label={{ value: 'Average ROI (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Scenario Count', angle: 90, position: 'insideRight' }} />
                <Tooltip content={<RoiTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="averageRoi" fill="#8884d8" name="Average ROI (%)" />
                <Bar yAxisId="right" dataKey="positiveCount" stackId="a" fill="#82ca9d" name="Positive Cashflow Scenarios" />
                <Bar yAxisId="right" dataKey="negativeCount" stackId="a" fill="#ff8042" name="Negative Cashflow Scenarios" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {activeTab === 'dashboard' && (
        <>
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Average Monthly Cashflow by Down Payment Percentage</h2>
            <p className="mb-4 text-gray-600">This chart shows how the average monthly cashflow changes with different down payment percentages.</p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashflowByDownpayment} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="downPaymentPercentage" />
                  <YAxis label={{ value: 'Average Monthly Cashflow ($)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => ['
      
      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Analysis Settings</h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Fixed Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Annual Property Tax</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={fixedCosts.propertyTax}
                  onChange={(e) => setFixedCosts({...fixedCosts, propertyTax: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Annual Insurance</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={fixedCosts.insurance}
                  onChange={(e) => setFixedCosts({...fixedCosts, insurance: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly HOA</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={fixedCosts.hoa}
                  onChange={(e) => setFixedCosts({...fixedCosts, hoa: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Onboarding Costs</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={fixedCosts.onboarding}
                  onChange={(e) => setFixedCosts({...fixedCosts, onboarding: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Advanced Settings</h3>
              <button 
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              >
                {showAdvancedSettings ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
              </button>
            </div>
            
            {showAdvancedSettings && (
              <div className="bg-gray-50 p-6 rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Property Appreciation Rate (%)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.propertyAppreciationRate}
                      onChange={(e) => setAdvancedParams({...advancedParams, propertyAppreciationRate: Number(e.target.value)})}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Annual Rent Increase (%)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.rentIncreaseRate}
                      onChange={(e) => setAdvancedParams({...advancedParams, rentIncreaseRate: Number(e.target.value)})}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vacancy Rate (%)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.vacancyRate}
                      onChange={(e) => setAdvancedParams({...advancedParams, vacancyRate: Number(e.target.value)})}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Maintenance (% of Property Value)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.maintenancePercent}
                      onChange={(e) => setAdvancedParams({...advancedParams, maintenancePercent: Number(e.target.value)})}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Property Management (% of Rent)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.propertyManagementPercent}
                      onChange={(e) => setAdvancedParams({...advancedParams, propertyManagementPercent: Number(e.target.value)})}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expense Inflation Rate (%)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.inflationRate}
                      onChange={(e) => setAdvancedParams({...advancedParams, inflationRate: Number(e.target.value)})}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Years to Hold</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.yearsToHold}
                      onChange={(e) => setAdvancedParams({...advancedParams, yearsToHold: Number(e.target.value)})}
                      min="1"
                      max="30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Selling Costs (% of Sale Price)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.sellingCostPercent}
                      onChange={(e) => setAdvancedParams({...advancedParams, sellingCostPercent: Number(e.target.value)})}
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Income Tax Rate (%)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded"
                      value={advancedParams.taxRate}
                      onChange={(e) => setAdvancedParams({...advancedParams, taxRate: Number(e.target.value)})}
                      step="0.1"
                    />
      
      <div className="text-sm text-gray-500">
        <p>Note: This tool calculates 5-year projections with fixed costs and no appreciation or rent increases.</p>
      </div>
    </div>
  );
};

export default PropertyAnalyzer;
 + value.toFixed(2), 'Avg Monthly Cashflow']} />
                  <Legend />
                  <Line type="monotone" dataKey="averageMonthlyCashflow" stroke="#8884d8" activeDot={{ r: 8 }} name="Avg Monthly Cashflow" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">ROI Distribution by Cap Rate</h2>
            <p className="mb-4 text-gray-600">This chart shows how ROI varies with different cap rates, including minimum, average, and maximum values.</p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={roiByCapRate} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="capRate" />
                  <YAxis label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="minRoi" stroke="#ff8042" name="Minimum ROI (%)" />
                  <Line type="monotone" dataKey="averageRoi" stroke="#8884d8" name="Average ROI (%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="maxRoi" stroke="#82ca9d" name="Maximum ROI (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Top 10 Scenarios by ROI</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border">Purchase Price</th>
                    <th className="py-2 px-4 border">Down Payment</th>
                    <th className="py-2 px-4 border">Interest Rate</th>
                    <th className="py-2 px-4 border">Cap Rate</th>
                    <th className="py-2 px-4 border">Monthly Cashflow</th>
                    <th className="py-2 px-4 border">Annual Cashflow</th>
                    <th className="py-2 px-4 border">Initial Investment</th>
                    <th className="py-2 px-4 border">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {topScenarios.map((scenario, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-4 border">{formatCurrency(scenario.purchasePrice)}</td>
                      <td className="py-2 px-4 border">{scenario.downPaymentPercentage}% ({formatCurrency(scenario.downPayment)})</td>
                      <td className="py-2 px-4 border">{scenario.interestRate}%</td>
                      <td className="py-2 px-4 border">{scenario.capRate}%</td>
                      <td className="py-2 px-4 border">{formatCurrency(scenario.monthlyCashflow)}</td>
                      <td className="py-2 px-4 border">{formatCurrency(scenario.annualCashflow)}</td>
                      <td className="py-2 px-4 border">{formatCurrency(scenario.initialInvestment)}</td>
                      <td className="py-2 px-4 border">{scenario.roi.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Detailed Analysis Tab */}
      {activeTab === 'detailed' && bestScenario && bestScenarioMetrics && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Detailed Analysis of Best Scenario</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4">Financial Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="font-medium">Purchase Price:</div>
                <div>{formatCurrency(bestScenario.purchasePrice)}</div>
                
                <div className="font-medium">Down Payment:</div>
                <div>{formatCurrency(bestScenario.downPayment)} ({bestScenario.downPaymentPercentage}%)</div>
                
                <div className="font-medium">Loan Amount:</div>
                <div>{formatCurrency(bestScenario.loanAmount)}</div>
                
                <div className="font-medium">Interest Rate:</div>
                <div>{bestScenario.interestRate}%</div>
                
                <div className="font-medium">Monthly Mortgage:</div>
                <div>{formatCurrency(bestScenario.monthlyMortgagePayment)}</div>
                
                <div className="font-medium">Monthly Rental Income:</div>
                <div>{formatCurrency(bestScenario.monthlyRentalIncome)}</div>
                
                <div className="font-medium">Monthly Expenses:</div>
                <div>{formatCurrency(bestScenario.monthlyCosts - bestScenario.monthlyMortgagePayment)}</div>
                
                <div className="font-medium">Monthly Cashflow:</div>
                <div className={bestScenario.monthlyCashflow > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {formatCurrency(bestScenario.monthlyCashflow)}
                </div>
                
                <div className="font-medium">Annual Cashflow:</div>
                <div className={bestScenario.annualCashflow > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {formatCurrency(bestScenario.annualCashflow)}
                </div>
                
                <div className="font-medium">Cash-on-Cash ROI:</div>
                <div className={bestScenario.roi > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {bestScenario.roi.toFixed(2)}%
                </div>
                
                <div className="font-medium">10-Year Total ROI:</div>
                <div className={bestScenarioMetrics.totalReturnOnInvestment > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {bestScenarioMetrics.totalReturnOnInvestment.toFixed(2)}%
                </div>
                
                <div className="font-medium">Internal Rate of Return:</div>
                <div className={bestScenarioMetrics.internalRateOfReturn > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {bestScenarioMetrics.internalRateOfReturn.toFixed(2)}%
                </div>
                
                <div className="font-medium">Break-even Point:</div>
                <div>{Math.round(bestScenarioMetrics.breakEvenPoint)} months</div>
                
                <div className="font-medium">Future Property Value:</div>
                <div>{formatCurrency(bestScenarioMetrics.futurePropertyValue)} (after {advancedParams.yearsToHold} years)</div>
                
                <div className="font-medium">Net Sale Proceeds:</div>
                <div>{formatCurrency(bestScenarioMetrics.netSaleProceeds)}</div>
                
                <div className="font-medium">Estimated Annual Taxes:</div>
                <div>{formatCurrency(bestScenarioMetrics.yearlyTaxes)}</div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4">Investment Assumptions</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="font-medium">Property Appreciation:</div>
                <div>{advancedParams.propertyAppreciationRate}% annually</div>
                
                <div className="font-medium">Rent Increases:</div>
                <div>{advancedParams.rentIncreaseRate}% annually</div>
                
                <div className="font-medium">Vacancy Rate:</div>
                <div>{advancedParams.vacancyRate}%</div>
                
                <div className="font-medium">Maintenance:</div>
                <div>{advancedParams.maintenancePercent}% of property value</div>
                
                <div className="font-medium">Property Management:</div>
                <div>{advancedParams.propertyManagementPercent}% of rental income</div>
                
                <div className="font-medium">Expense Inflation:</div>
                <div>{advancedParams.inflationRate}% annually</div>
                
                <div className="font-medium">Investment Horizon:</div>
                <div>{advancedParams.yearsToHold} years</div>
                
                <div className="font-medium">Selling Costs:</div>
                <div>{advancedParams.sellingCostPercent}% of sale price</div>
                
                <div className="font-medium">Income Tax Rate:</div>
                <div>{advancedParams.taxRate}%</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Cash Flow Projections</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-3 border">Year</th>
                    <th className="py-2 px-3 border">Effective Rent</th>
                    <th className="py-2 px-3 border">Operating Expenses</th>
                    <th className="py-2 px-3 border">Operating Income</th>
                    <th className="py-2 px-3 border">Mortgage Payments</th>
                    <th className="py-2 px-3 border">Cashflow Before Tax</th>
                    <th className="py-2 px-3 border">Taxable Income</th>
                    <th className="py-2 px-3 border">Tax Amount</th>
                    <th className="py-2 px-3 border">After-Tax Cashflow</th>
                    <th className="py-2 px-3 border">Cumulative Cashflow</th>
                  </tr>
                </thead>
                <tbody>
                  {bestScenarioMetrics.futureCashflows.map((cf, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-2 px-3 border">{cf.year}</td>
                      <td className="py-2 px-3 border">{formatCurrency(cf.effectiveRent)}</td>
                      <td className="py-2 px-3 border">{formatCurrency(cf.operatingExpenses)}</td>
                      <td className="py-2 px-3 border">{formatCurrency(cf.operatingIncome)}</td>
                      <td className="py-2 px-3 border">{formatCurrency(cf.mortgagePayments)}</td>
                      <td className="py-2 px-3 border">{formatCurrency(cf.cashflowBeforeTax)}</td>
                      <td className="py-2 px-3 border">{formatCurrency(cf.taxableIncome)}</td>
                      <td className="py-2 px-3 border">{formatCurrency(cf.taxAmount)}</td>
                      <td className="py-2 px-3 border" className={cf.afterTaxCashflow > 0 ? 'py-2 px-3 border text-green-600 font-semibold' : 'py-2 px-3 border text-red-600 font-semibold'}>
                        {formatCurrency(cf.afterTaxCashflow)}
                      </td>
                      <td className="py-2 px-3 border" className={cf.cumulativeCashflow > 0 ? 'py-2 px-3 border text-green-600 font-semibold' : 'py-2 px-3 border text-red-600 font-semibold'}>
                        {formatCurrency(cf.cumulativeCashflow)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Fixed Costs Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Annual Property Tax</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded"
              value={fixedCosts.propertyTax}
              onChange={(e) => setFixedCosts({...fixedCosts, propertyTax: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Annual Insurance</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded"
              value={fixedCosts.insurance}
              onChange={(e) => setFixedCosts({...fixedCosts, insurance: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monthly HOA</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded"
              value={fixedCosts.hoa}
              onChange={(e) => setFixedCosts({...fixedCosts, hoa: Number(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Onboarding Costs</label>
            <input 
              type="number" 
              className="w-full p-2 border rounded"
              value={fixedCosts.onboarding}
              onChange={(e) => setFixedCosts({...fixedCosts, onboarding: Number(e.target.value)})}
            />
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Note: This tool calculates 5-year projections with fixed costs and no appreciation or rent increases.</p>
      </div>
    </div>
  );
};

export default PropertyAnalyzer;