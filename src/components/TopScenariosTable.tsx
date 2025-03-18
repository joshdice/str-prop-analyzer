// TopScenariosTable.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScenarioData } from './types';
import { formatCurrency, formatPercentage } from './utils/formatters';

interface TopScenariosTableProps {
  scenarios: ScenarioData[];
}

export const TopScenariosTable: React.FC<TopScenariosTableProps> = ({ scenarios }) => {
  return (
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
              {scenarios.map((scenario, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-2">{formatCurrency(scenario.purchasePrice)}</td>
                  <td className="p-2">
                    {formatPercentage(scenario.downPaymentPercentage)} ({formatCurrency(scenario.downPayment)})
                  </td>
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
  );
};