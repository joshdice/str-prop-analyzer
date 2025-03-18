// ScenarioComparisonTable.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScenarioData } from './types';
import { formatCurrency, formatPercentage } from './utils/formatters';

interface ScenarioComparisonTableProps {
  title: string;
  description: string;
  scenarios: ScenarioData[];
}

export const ScenarioComparisonTable: React.FC<ScenarioComparisonTableProps> = ({ 
  title,
  description,
  scenarios 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
                <th className="p-2 text-left">Property Mgmt</th>
                <th className="p-2 text-left">Monthly Cashflow</th>
                <th className="p-2 text-left">Annual Cashflow</th>
                <th className="p-2 text-left">Initial Investment</th>
                <th className="p-2 text-left">ROI</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((scenario, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="p-2">{formatPercentage(scenario.downPaymentPercentage)}</td>
                  <td className="p-2">{formatCurrency(scenario.downPayment)}</td>
                  <td className="p-2">{formatCurrency(scenario.monthlyMortgagePayment)}</td>
                  <td className="p-2">{formatCurrency(scenario.totalMonthlyExpenses)}</td>
                  <td className="p-2">{formatCurrency(scenario.monthlyIncome)}</td>
                  <td className="p-2">{formatCurrency(scenario.monthlyManagementCost)}</td>
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