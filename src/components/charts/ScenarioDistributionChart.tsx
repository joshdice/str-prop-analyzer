// charts/ScenarioDistributionChart.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { ScenarioData } from '../types';

interface ScenarioDistributionChartProps {
  data: ScenarioData[];
}

export const ScenarioDistributionChart: React.FC<ScenarioDistributionChartProps> = ({ data }) => {
  const chartData = data.map((scenario, index) => ({ ...scenario, index }));

  return (
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
            <XAxis 
              type="number" 
              dataKey="initialInvestment" 
              name="Initial Investment" 
              label={{ value: 'Initial Investment ($)', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              type="number" 
              dataKey="annualROI" 
              name="ROI" 
              label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} 
            />
            <ZAxis type="number" range={[50, 50]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }} 
              formatter={(value, name) => {
                let formattedValue;
                if (typeof value === 'number') {
                  formattedValue = name === 'annualROI' 
                    ? `${value.toFixed(2)}%` 
                    : `${value.toLocaleString()}`;
                } else {
                  formattedValue = value;
                }
                return [formattedValue, name === 'annualROI' ? 'Annual ROI' : 'Initial Investment'];
              }} 
            />
            <Legend />
            <Scatter name="All Scenarios" data={chartData} fill="#8884d8">
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPositiveCashflow ? "#82ca9d" : "#ff8042"} 
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};