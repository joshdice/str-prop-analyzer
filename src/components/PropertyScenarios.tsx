// PropertyScenarios.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScenarioComparisonTable } from './ScenarioComparisonTable';
import { Label } from '@/components/ui/label';
import { ScenarioData } from './types';
import { formatCurrency, formatPercentage } from './utils/formatters';

interface PropertyScenariosProps {
  scenarios: ScenarioData[];
  purchasePrices: number[];
  interestRates: number[];
  capRates: number[];
}

export const PropertyScenarios: React.FC<PropertyScenariosProps> = ({
  scenarios,
  purchasePrices,
  interestRates,
  capRates
}) => {
  // Default values
  const defaultPurchasePrice = 700000;
  const defaultInterestRate = 7.0;
  const defaultCapRate = 10;

  // State for selected values
  const [selectedPurchasePrice, setSelectedPurchasePrice] = useState<number>(defaultPurchasePrice);
  const [selectedInterestRate, setSelectedInterestRate] = useState<number>(defaultInterestRate);
  const [selectedCapRate, setSelectedCapRate] = useState<number>(defaultCapRate);
  const [filteredScenarios, setFilteredScenarios] = useState<ScenarioData[]>([]);

  // Filter scenarios based on selected values
  const filterScenarios = React.useCallback(() => {
    const filtered = scenarios.filter(scenario => 
      scenario.purchasePrice === selectedPurchasePrice && 
      scenario.interestRate === selectedInterestRate && 
      scenario.capRate === selectedCapRate
    );
    
    // Sort by down payment percentage
    filtered.sort((a, b) => a.downPaymentPercentage - b.downPaymentPercentage);
    
    setFilteredScenarios(filtered);
  }, [scenarios, selectedPurchasePrice, selectedInterestRate, selectedCapRate]);

  // Initial filtering and filter when selected values change
  useEffect(() => {
    filterScenarios();
  }, [filterScenarios]);

  // Title for the table
  const getTableTitle = () => {
    return `${formatCurrency(selectedPurchasePrice)} Property Scenarios (${formatPercentage(selectedInterestRate)} Interest, ${formatPercentage(selectedCapRate)} Cap Rate)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Scenarios</CardTitle>
        <CardDescription>Customize and compare different down payment options</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <select
              id="purchasePrice"
              className="w-full p-2 border rounded"
              value={selectedPurchasePrice}
              onChange={(e) => setSelectedPurchasePrice(Number(e.target.value))}
            >
              {purchasePrices.map(price => (
                <option key={price} value={price}>
                  {formatCurrency(price)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate</Label>
            <select
              id="interestRate"
              className="w-full p-2 border rounded"
              value={selectedInterestRate}
              onChange={(e) => setSelectedInterestRate(Number(e.target.value))}
            >
              {interestRates.map(rate => (
                <option key={rate} value={rate}>
                  {formatPercentage(rate)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="capRate">Cap Rate</Label>
            <select
              id="capRate"
              className="w-full p-2 border rounded"
              value={selectedCapRate}
              onChange={(e) => setSelectedCapRate(Number(e.target.value))}
            >
              {capRates.map(rate => (
                <option key={rate} value={rate}>
                  {formatPercentage(rate)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredScenarios.length > 0 ? (
          <ScenarioComparisonTable 
            title={getTableTitle()}
            description="Comparison of different down payment options"
            scenarios={filteredScenarios}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No scenarios match the selected criteria. Try different values.
          </div>
        )}
      </CardContent>
    </Card>
  );
};