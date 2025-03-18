// InputControls.tsx
import React from 'react';
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
  const {
    setAnnualPropertyTax,
    setAnnualInsurance,
    setMonthlyHOA,
    setOnboardingCosts,
    setPropertyManagementRate
  } = updateFixedCosts;

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
          <div>
            <Label htmlFor="propertyManagement">Property Management (%)</Label>
            <Input
              id="propertyManagement"
              type="number"
              min="0"
              max="100"
              value={propertyManagementRate}
              onChange={(e) => setPropertyManagementRate(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={onCalculate}
          >
            {hasCalculated ? 'Recalculate Results' : 'Calculate Results'}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};