import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';

const PropertyAnalyzer = () => {
  // Configuration values
  const [purchasePrices, setPurchasePrices] = useState([500000, 600000, 700000, 800000, 900000]);
  const [downPaymentPercentages, setDownPaymentPercentages] = useState([25, 35, 45, 55, 65, 75]);
  const [interestRates, setInterestRates] = useState([6.0, 6.5, 7.0, 7.5, 8.0]);
  const [capRates, setCapRates] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);

  // Fixed costs
  const [annualPropertyTax, setAnnualPropertyTax] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2400);
  const [monthlyHOA, setMonthlyHOA] = useState(300);
  const [onboardingCosts, setOnboardingCosts] = useState(25000);

  // Calculated values
  const [scenarios, setScenarios] = useState([]);
  const [topScenarios, setTopScenarios] = useState([]);
  const [cashflowByDownPayment, setCashflowByDownPayment] = useState([]);
  const [roiByCapRate, setRoiByCapRate] = useState([]);
  const [roiByPurchasePrice, setRoiByPurchasePrice] = useState([]);
  const [bestScenario, setBestScenario] = useState(null);
  const [worstScenario, setWorstScenario] = useState(null);
  const [specificScenarios, setSpecificScenarios] = useState([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Initial calculation on load
  useEffect(() => {
    calculateScenarios();
  }, []);

  const calculateScenarios = () => {
    const allScenarios = [];
    
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
            
            // Calculate cashflow
            const monthlyCashflow = monthlyIncome - totalMonthlyExpenses;
            const annualCashflow = monthlyCashflow * 12;
            
            // Calculate ROI
            const initialInvestment = downPayment + onboardingCosts;
            const annualROI = (annualCashflow / initialInvestment) * 100;
            
            // Calculate 5-year data
            const fiveYearData = [];
            for (let year = 1; year <= 5; year++) {
              const yearlyData = {
                year,
                monthlyExpenses: totalMonthlyExpenses,
                monthlyIncome,
                monthlyCashflow,
                annualExpenses: totalMonthlyExpenses * 12,
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
    
    // Store all calculated scenarios
    setScenarios(allScenarios);
    
    // Get top 10 scenarios
    setTopScenarios(allScenarios.slice(0, 10));
    
    // Set best and worst scenarios
    setBestScenario(allScenarios[0]);
    setWorstScenario(allScenarios[allScenarios.length - 1]);
    
    // Get specific scenarios
    const specificScenariosFiltered = allScenarios.filter(scenario => 
      scenario.purchasePrice === 900000 && 
      scenario.interestRate === 6.0 && 
      scenario.capRate === 10
    );
    
    // Sort by down payment percentage
    specificScenariosFiltered.sort((a, b) => a.downPaymentPercentage - b.downPaymentPercentage);
    
    setSpecificScenarios(specificScenariosFiltered);
    
    // Set that calculations have been performed
    setHasCalculated(true);
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Download raw data as CSV
  const downloadRawData = () => {
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

  return (
    <div className="flex flex-col space-y-8 w-full p-4">
      <h1 className="text-3xl font-bold">Investment Property Analysis Tool</h1>
      
      {/* Input Controls - Moved to top */}
      <Card>
        <CardHeader>
          <CardTitle>Adjust Fixed Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="propertyTax">Annual Property Tax</Label>
              <Input
                id="propertyTax"
                type="number"
                value={annualPropertyTax}
                onChange={(e) => setAnnualPropertyTax(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="insurance">Annual Insurance</Label>
              <Input
                id="insurance"
                type="number"
                value={annualInsurance}
                onChange={(e) => setAnnualInsurance(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="hoa">Monthly HOA</Label>
              <Input
                id="hoa"
                type="number"
                value={monthlyHOA}
                onChange={(e) => setMonthlyHOA(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="onboarding">Onboarding Costs</Label>
              <Input
                id="onboarding"
                type="number"
                value={onboardingCosts}
                onChange={(e) => setOnboardingCosts(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={calculateScenarios}
            >
              {hasCalculated ? 'Recalculate Results' : 'Calculate Results'}
            </button>
          </div>
        </CardContent>
      </Card>
      
      {/* Best and Worst Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bestScenario && (
          <Card className="bg-green-50">
            <CardHeader>
              <CardTitle>Best ROI Scenario</CardTitle>
              <CardDescription>Highest return on investment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><span className="font-semibold">Purchase Price:</span> {formatCurrency(bestScenario.purchasePrice)}</div>
                <div><span className="font-semibold">Down Payment:</span> {formatPercentage(bestScenario.downPaymentPercentage)} ({formatCurrency(bestScenario.downPayment)})</div>
                <div><span className="font-semibold">Interest Rate:</span> {formatPercentage(bestScenario.interestRate)}</div>
                <div><span className="font-semibold">Cap Rate:</span> {formatPercentage(bestScenario.capRate)}</div>
                <div><span className="font-semibold">Monthly Cashflow:</span> {formatCurrency(bestScenario.monthlyCashflow)}</div>
                <div><span className="font-semibold">Annual Cashflow:</span> {formatCurrency(bestScenario.annualCashflow)}</div>
                <div><span className="font-semibold">Initial Investment:</span> {formatCurrency(bestScenario.initialInvestment)}</div>
                <div className="font-bold"><span>ROI:</span> {formatPercentage(bestScenario.annualROI)}</div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {worstScenario && (
          <Card className="bg-red-50">
            <CardHeader>
              <CardTitle>Worst ROI Scenario</CardTitle>
              <CardDescription>Lowest return on investment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><span className="font-semibold">Purchase Price:</span> {formatCurrency(worstScenario.purchasePrice)}</div>
                <div><span className="font-semibold">Down Payment:</span> {formatPercentage(worstScenario.downPaymentPercentage)} ({formatCurrency(worstScenario.downPayment)})</div>
                <div><span className="font-semibold">Interest Rate:</span> {formatPercentage(worstScenario.interestRate)}</div>
                <div><span className="font-semibold">Cap Rate:</span> {formatPercentage(worstScenario.capRate)}</div>
                <div><span className="font-semibold">Monthly Cashflow:</span> {formatCurrency(worstScenario.monthlyCashflow)}</div>
                <div><span className="font-semibold">Annual Cashflow:</span> {formatCurrency(worstScenario.annualCashflow)}</div>
                <div><span className="font-semibold">Initial Investment:</span> {formatCurrency(worstScenario.initialInvestment)}</div>
                <div className="font-bold"><span>ROI:</span> {formatPercentage(worstScenario.annualROI)}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ROI by Purchase Price */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Distribution by Purchase Price</CardTitle>
            <CardDescription>Average ROI and positive cashflow percentage</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={roiByPurchasePrice}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="purchasePrice" label={{ value: 'Purchase Price ($K)', position: 'insideBottom', offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: 'Avg ROI (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: '% Positive Cashflow', angle: 90, position: 'insideRight' }} />
                <Tooltip formatter={(value, name) => [value.toFixed(2) + (name === 'avgROI' ? '%' : '%'), name === 'avgROI' ? 'Average ROI' : '% Positive Cashflow']} />
                <Legend />
                <Bar yAxisId="left" dataKey="avgROI" name="Average ROI" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="positiveCashflowPercentage" name="% Positive Cashflow" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Average Monthly Cashflow by Down Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cashflow by Down Payment</CardTitle>
            <CardDescription>Average monthly cashflow based on down payment percentage</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cashflowByDownPayment}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="downPaymentPercentage" label={{ value: 'Down Payment (%)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Avg Monthly Cashflow ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Average Monthly Cashflow']} />
                <Legend />
                <Line type="monotone" dataKey="avgMonthlyCashflow" name="Average Monthly Cashflow" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* ROI Distribution by Cap Rate */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Distribution by Cap Rate</CardTitle>
            <CardDescription>Min, average, and max ROI for each cap rate</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={roiByCapRate}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="capRate" label={{ value: 'Cap Rate (%)', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'ROI']} />
                <Legend />
                <Line type="monotone" dataKey="minROI" name="Min ROI" stroke="#ff8042" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="avgROI" name="Avg ROI" stroke="#8884d8" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="maxROI" name="Max ROI" stroke="#82ca9d" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Scenario Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Scenario Distribution</CardTitle>
            <CardDescription>All scenarios plotted by ROI and initial investment</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="initialInvestment" name="Initial Investment" label={{ value: 'Initial Investment ($)', position: 'insideBottom', offset: -5 }} />
                <YAxis type="number" dataKey="annualROI" name="ROI" label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} />
                <ZAxis type="number" range={[50, 50]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [name === 'annualROI' ? `${value.toFixed(2)}%` : `$${value.toLocaleString()}`, name === 'annualROI' ? 'Annual ROI' : 'Initial Investment']} />
                <Legend />
                <Scatter name="All Scenarios" data={scenarios.map((s, index) => ({ ...s, index }))} fill="#8884d8">
                  {scenarios.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isPositiveCashflow ? "#82ca9d" : "#ff8042"} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Top 10 Scenarios Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Scenarios by ROI</CardTitle>
          <CardDescription>Best return on investment scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Purchase Price</th>
                  <th className="p-2 text-left">Down Payment</th>
                  <th className="p-2 text-left">Interest Rate</th>
                  <th className="p-2 text-left">Cap Rate</th>
                  <th className="p-2 text-left">Monthly Cashflow</th>
                  <th className="p-2 text-left">Annual Cashflow</th>
                  <th className="p-2 text-left">Initial Investment</th>
                  <th className="p-2 text-left">ROI</th>
                </tr>
              </thead>
              <tbody>
                {topScenarios.map((scenario, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="p-2">{formatCurrency(scenario.purchasePrice)}</td>
                    <td className="p-2">{formatPercentage(scenario.downPaymentPercentage)} ({formatCurrency(scenario.downPayment)})</td>
                    <td className="p-2">{formatPercentage(scenario.interestRate)}</td>
                    <td className="p-2">{formatPercentage(scenario.capRate)}</td>
                    <td className="p-2">{formatCurrency(scenario.monthlyCashflow)}</td>
                    <td className="p-2">{formatCurrency(scenario.annualCashflow)}</td>
                    <td className="p-2">{formatCurrency(scenario.initialInvestment)}</td>
                    <td className="p-2 font-bold">{formatPercentage(scenario.annualROI)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Specific Scenarios Table */}
      <Card>
        <CardHeader>
          <CardTitle>$900K Property Scenarios (6.0% Interest, 10% Cap Rate)</CardTitle>
          <CardDescription>Comparison of different down payment options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Down Payment %</th>
                  <th className="p-2 text-left">Down Payment $</th>
                  <th className="p-2 text-left">Monthly Mortgage</th>
                  <th className="p-2 text-left">Monthly Expenses</th>
                  <th className="p-2 text-left">Monthly Income</th>
                  <th className="p-2 text-left">Monthly Cashflow</th>
                  <th className="p-2 text-left">Annual Cashflow</th>
                  <th className="p-2 text-left">Initial Investment</th>
                  <th className="p-2 text-left">ROI</th>
                </tr>
              </thead>
              <tbody>
                {specificScenarios.map((scenario, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                    <td className="p-2">{formatPercentage(scenario.downPaymentPercentage)}</td>
                    <td className="p-2">{formatCurrency(scenario.downPayment)}</td>
                    <td className="p-2">{formatCurrency(scenario.monthlyMortgagePayment)}</td>
                    <td className="p-2">{formatCurrency(scenario.totalMonthlyExpenses)}</td>
                    <td className="p-2">{formatCurrency(scenario.monthlyIncome)}</td>
                    <td className="p-2">{formatCurrency(scenario.monthlyCashflow)}</td>
                    <td className="p-2">{formatCurrency(scenario.annualCashflow)}</td>
                    <td className="p-2">{formatCurrency(scenario.initialInvestment)}</td>
                    <td className="p-2 font-bold">{formatPercentage(scenario.annualROI)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Download Raw Data Button */}
      <div className="flex justify-center mt-8 mb-8">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          onClick={downloadRawData}
          disabled={scenarios.length === 0}
        >
          Download All Raw Data
        </button>
      </div>
    </div>
  );
};

export default PropertyAnalyzer;