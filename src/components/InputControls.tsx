// InputControls.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UpdateFixedCostsFunctions } from './types';

interface InputControlsProps {
  annualPropertyTax: number;
  annualInsurance: number;
  monthlyHOA: number;
  onboardingCosts: number;
  propertyManagementRate: number;
  updateFixedCosts: UpdateFixedCostsFunctions;
  onCalculate: () => void;
  hasCalculated: boolean;
}

export const InputControls: React.FC<InputControlsProps> = ({
  annualPropertyTax,
  annualInsurance,
  monthlyHOA,
  onboardingCosts,
  propertyManagementRate,
  updateFixedCosts,
  onCalculate,
  hasCalculated
}) => {
  // Local state for input fields - for immediate feedback
  const [localPropertyTax, setLocalPropertyTax] = useState(annualPropertyTax.toString());
  const [localInsurance, setLocalInsurance] = useState(annualInsurance.toString());
  const [localHOA, setLocalHOA] = useState(monthlyHOA.toString());
  const [localOnboarding, setLocalOnboarding] = useState(onboardingCosts.toString());
  const [localManagementRate, setLocalManagementRate] = useState(propertyManagementRate.toString());
  
  // Sync local state with props when they change
  useEffect(() => {
    setLocalPropertyTax(annualPropertyTax.toString());
    setLocalInsurance(annualInsurance.toString());
    setLocalHOA(monthlyHOA.toString());
    setLocalOnboarding(onboardingCosts.toString());
    setLocalManagementRate(propertyManagementRate.toString());
  }, [annualPropertyTax, annualInsurance, monthlyHOA, onboardingCosts, propertyManagementRate]);

  const {
    setAnnualPropertyTax,
    setAnnualInsurance,
    setMonthlyHOA,
    setOnboardingCosts,
    setPropertyManagementRate
  } = updateFixedCosts;

  // Handle calculation with local state values
  const handleCalculateClick = () => {
    // Update parent state with local values
    setAnnualPropertyTax(Number(localPropertyTax) || 0);
    setAnnualInsurance(Number(localInsurance) || 0);
    setMonthlyHOA(Number(localHOA) || 0);
    setOnboardingCosts(Number(localOnboarding) || 0);
    setPropertyManagementRate(Number(localManagementRate) || 0);
    
    // Trigger calculation
    onCalculate();
  };

  return (
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
              type="text"
              value={localPropertyTax}
              onChange={(e) => setLocalPropertyTax(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="insurance">Annual Insurance</Label>
            <Input
              id="insurance"
              type="text"
              value={localInsurance}
              onChange={(e) => setLocalInsurance(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hoa">Monthly HOA</Label>
            <Input
              id="hoa"
              type="text"
              value={localHOA}
              onChange={(e) => setLocalHOA(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="onboarding">Onboarding Costs</Label>
            <Input
              id="onboarding"
              type="text"
              value={localOnboarding}
              onChange={(e) => setLocalOnboarding(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="propertyManagement">Property Management (%)</Label>
            <Input
              id="propertyManagement"
              type="text"
              value={localManagementRate}
              onChange={(e) => setLocalManagementRate(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCalculateClick}
          >
            {hasCalculated ? 'Recalculate Results' : 'Calculate Results'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};