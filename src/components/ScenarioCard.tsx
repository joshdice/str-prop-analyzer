// ScenarioCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScenarioData } from './types';
import { formatCurrency, formatPercentage } from './utils/formatters';

interface ScenarioCardProps {
  scenario: ScenarioData;
  type: 'best' | 'worst';
  propertyManagementRate: number;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  type,
  propertyManagementRate
}) => {
  const bgColor = type === 'best' ? 'bg-green-50' : 'bg-red-50';
  const title = type === 'best' ? 'Best ROI Scenario' : 'Worst ROI Scenario';
  const description = type === 'best' 
    ? 'Highest return on investment' 
    : 'Lowest return on investment';

  return (
    <Card className={bgColor}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Purchase Price:</span> {formatCurrency(scenario.purchasePrice)}
          </div>
          <div>
            <span className="font-semibold">Down Payment:</span> {formatPercentage(scenario.downPaymentPercentage)} ({formatCurrency(scenario.downPayment)})
          </div>
          <div>
            <span className="font-semibold">Interest Rate:</span> {formatPercentage(scenario.interestRate)}
          </div>
          <div>
            <span className="font-semibold">Cap Rate:</span> {formatPercentage(scenario.capRate)}
          </div>
          <div>
            <span className="font-semibold">Monthly Income:</span> {formatCurrency(scenario.monthlyIncome)}
          </div>
          <div>
            <span className="font-semibold">Property Management:</span> {formatCurrency(scenario.monthlyManagementCost)} ({formatPercentage(propertyManagementRate)})
          </div>
          <div>
            <span className="font-semibold">Monthly Cashflow:</span> {formatCurrency(scenario.monthlyCashflow)}
          </div>
          <div>
            <span className="font-semibold">Annual Cashflow:</span> {formatCurrency(scenario.annualCashflow)}
          </div>
          <div>
            <span className="font-semibold">Initial Investment:</span> {formatCurrency(scenario.initialInvestment)}
          </div>
          <div className="font-bold">
            <span>ROI:</span> {formatPercentage(scenario.annualROI)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};