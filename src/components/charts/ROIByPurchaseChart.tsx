// charts/ROIByPurchaseChart.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ROIByPurchasePriceData } from '../types';

interface ROIByPurchaseChartProps {
  data: ROIByPurchasePriceData[];
}

export const ROIByPurchaseChart: React.FC<ROIByPurchaseChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI Distribution by Purchase Price</CardTitle>
        <CardDescription>Average ROI and positive cashflow percentage</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="purchasePrice" 
              label={{ value: 'Purchase Price ($K)', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              yAxisId="left" 
              label={{ value: 'Avg ROI (%)', angle: -90, position: 'insideLeft' }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              label={{ value: '% Positive Cashflow', angle: 90, position: 'insideRight' }} 
            />
            <Tooltip 
              formatter={(value, name) => {
                const formattedValue = typeof value === 'number' 
                  ? value.toFixed(2) + (name === 'avgROI' ? '%' : '%')
                  : value;
                return [formattedValue, name === 'avgROI' ? 'Average ROI' : '% Positive Cashflow'];
              }} 
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="avgROI" 
              name="Average ROI" 
              fill="#8884d8" 
            />
            <Bar 
              yAxisId="right" 
              dataKey="positiveCashflowPercentage" 
              name="% Positive Cashflow" 
              fill="#82ca9d" 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};