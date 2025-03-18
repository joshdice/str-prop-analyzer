// charts/CashflowByDownPaymentChart.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CashflowByDownPaymentData } from '../types';

interface CashflowByDownPaymentChartProps {
  data: CashflowByDownPaymentData[];
}

export const CashflowByDownPaymentChart: React.FC<CashflowByDownPaymentChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cashflow by Down Payment</CardTitle>
        <CardDescription>Average monthly cashflow based on down payment percentage</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="downPaymentPercentage" 
              label={{ value: 'Down Payment (%)', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              label={{ value: 'Avg Monthly Cashflow ($)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value) => {
                const formattedValue = typeof value === 'number' ? `${value.toFixed(2)}` : value;
                return [formattedValue, 'Average Monthly Cashflow'];
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avgMonthlyCashflow" 
              name="Average Monthly Cashflow" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};