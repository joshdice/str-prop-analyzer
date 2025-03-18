// PropertyAnalyzer.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { InputControls } from './InputControls';
import { ScenarioCard } from './ScenarioCard';
import { TopScenariosTable } from './TopScenariosTable';
import { PropertyScenarios } from './PropertyScenarios';
import { ROIByPurchaseChart } from './charts/ROIByPurchaseChart';
import { CashflowByDownPaymentChart } from './charts/CashflowByDownPaymentChart';
import { ROIByCapRateChart } from './charts/ROIByCapRateChart';
import { ScenarioDistributionChart } from './charts/ScenarioDistributionChart';
import { calculateScenarios } from './utils/calculations';
import { downloadRawData } from './utils/exporters';
import { 
  ScenarioData, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ChartData,
  CashflowByDownPaymentData,
  ROIByCapRateData, 
  ROIByPurchasePriceData 
} from './types';

const PropertyAnalyzer = () => {
  // Configuration values - use useMemo to prevent recreation on each render
  const purchasePrices = useMemo(() => [500000, 600000, 700000, 800000, 900000], []);
  const downPaymentPercentages = useMemo(() => [25, 35, 45, 55, 65, 75], []);
  const interestRates = useMemo(() => [6.0, 6.5, 7.0, 7.5, 8.0], []);
  const capRates = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], []);

  // Fixed costs
  const [annualPropertyTax, setAnnualPropertyTax] = useState(5000);
  const [annualInsurance, setAnnualInsurance] = useState(2400);
  const [monthlyHOA, setMonthlyHOA] = useState(300);
  const [onboardingCosts, setOnboardingCosts] = useState(25000);
  const [propertyManagementRate, setPropertyManagementRate] = useState(25);

  // Calculated values
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [topScenarios, setTopScenarios] = useState<ScenarioData[]>([]);
  const [cashflowByDownPayment, setCashflowByDownPayment] = useState<CashflowByDownPaymentData[]>([]);
  const [roiByCapRate, setRoiByCapRate] = useState<ROIByCapRateData[]>([]);
  const [roiByPurchasePrice, setRoiByPurchasePrice] = useState<ROIByPurchasePriceData[]>([]);
  const [bestScenario, setBestScenario] = useState<ScenarioData | null>(null);
  const [worstScenario, setWorstScenario] = useState<ScenarioData | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Define calculation function
  const handleCalculate = useCallback(() => {
    console.log("handleCalculate called with values:", {
      annualPropertyTax,
      annualInsurance,
      monthlyHOA,
      onboardingCosts,
      propertyManagementRate
    });
    
    const results = calculateScenarios({
      purchasePrices,
      downPaymentPercentages,
      interestRates,
      capRates,
      annualPropertyTax,
      annualInsurance,
      monthlyHOA,
      onboardingCosts,
      propertyManagementRate
    });
    
    console.log("Calculation results:", {
      scenariosCount: results.allScenarios.length,
      topScenariosCount: results.topScenarios.length,
      hasBestScenario: !!results.bestScenario,
      hasWorstScenario: !!results.worstScenario
    });
    
    setScenarios(results.allScenarios);
    setTopScenarios(results.topScenarios);
    setBestScenario(results.bestScenario);
    setWorstScenario(results.worstScenario);
    setCashflowByDownPayment(results.cashflowByDownPayment);
    setRoiByCapRate(results.roiByCapRate);
    setRoiByPurchasePrice(results.roiByPurchasePrice);
    setHasCalculated(true);
  }, [
    purchasePrices, 
    downPaymentPercentages, 
    interestRates, 
    capRates, 
    annualPropertyTax, 
    annualInsurance, 
    monthlyHOA, 
    onboardingCosts, 
    propertyManagementRate
  ]);

  // Initial calculation on load
  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  // Fixed costs updating functions
  const updateFixedCosts = {
    setAnnualPropertyTax,
    setAnnualInsurance,
    setMonthlyHOA,
    setOnboardingCosts,
    setPropertyManagementRate
  };

  const handleDownloadData = () => {
    downloadRawData(scenarios);
  };

  return (
    <div className="flex flex-col space-y-8 w-full p-4">
      <h1 className="text-3xl font-bold">STR Investment Property Analysis Tool</h1>
      
      <InputControls 
        annualPropertyTax={annualPropertyTax}
        annualInsurance={annualInsurance}
        monthlyHOA={monthlyHOA}
        onboardingCosts={onboardingCosts}
        propertyManagementRate={propertyManagementRate}
        updateFixedCosts={updateFixedCosts}
        onCalculate={handleCalculate}
        hasCalculated={hasCalculated}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bestScenario && (
          <ScenarioCard 
            scenario={bestScenario} 
            type="best" 
            propertyManagementRate={propertyManagementRate} 
          />
        )}
        
        {worstScenario && (
          <ScenarioCard 
            scenario={worstScenario} 
            type="worst" 
            propertyManagementRate={propertyManagementRate} 
          />
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ROIByPurchaseChart data={roiByPurchasePrice} />
        <CashflowByDownPaymentChart data={cashflowByDownPayment} />
        <ROIByCapRateChart data={roiByCapRate} />
        <ScenarioDistributionChart data={scenarios} />
      </div>
      
      <TopScenariosTable scenarios={topScenarios} />
      
      <PropertyScenarios
        scenarios={scenarios}
        purchasePrices={purchasePrices}
        interestRates={interestRates}
        capRates={capRates}
      />
      
      <div className="flex justify-center mt-8 mb-8">
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
          onClick={handleDownloadData}
          disabled={scenarios.length === 0}
        >
          Download All Raw Data
        </button>
      </div>
    </div>
  );
};

export default PropertyAnalyzer;