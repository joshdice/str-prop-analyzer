// charts/ROIByCapRateChart.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ROIByCapRateData } from '../types';

interface ROIByCapRateChartProps {
  data: ROIByCapRateData[];
}

export const ROIByCapRateChart: React.FC<ROIByCapRateChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ROI Distribution by Cap Rate</CardTitle>
        <CardDescription>Min, average, and max ROI for each cap rate</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="capRate" 
              label={{ value: 'Cap Rate (%)', position: 'insideBottom', offset: -5 }} 
            />
            <YAxis 
              label={{ value: 'ROI (%)', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip 
              formatter={(value) => {
                const formattedValue = typeof value === 'number' 
                  ? `${value.toFixed(2)}%` 
                  : value;
                return [formattedValue, 'ROI'];
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="minROI" 
              name="Min ROI" 
              stroke="#ff8042" 
              dot={{ r: 3 }} 
            />
            <Line 
              type="monotone" 
              dataKey="avgROI" 
              name="Avg ROI" 
              stroke="#8884d8" 
              dot={{ r: 3 }} 
            />
            <Line 
              type="monotone" 
              dataKey="maxROI" 
              name="Max ROI" 
              stroke="#82ca9d" 
              dot={{ r: 3 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};  