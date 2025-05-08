
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ParkingSpot } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';

interface BookingFormProps {
  spot: ParkingSpot;
  onBookingDataChange: (startDate: string, startTime: string, endDate: string, endTime: string, totalCost: number) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ spot, onBookingDataChange }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCost, setTotalCost] = useState(0);

  // Calculate total cost when times or dates change
  useEffect(() => {
    if (startDate && startTime && endDate && endTime && spot) {
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
        // Calculate the duration in hours
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        // Calculate the cost
        const cost = spot.price.hourly * durationHours;
        setTotalCost(cost);
        
        // Update parent component with booking data
        onBookingDataChange(startDate, startTime, endDate, endTime, cost);
      } else {
        setTotalCost(0);
        onBookingDataChange('', '', '', '', 0);
      }
    } else {
      setTotalCost(0);
      onBookingDataChange('', '', '', '', 0);
    }
  }, [startDate, startTime, endDate, endTime, spot, onBookingDataChange]);

  return (
    <Card className="animate-fade-in overflow-visible">
      <CardContent className="p-4 space-y-4 overflow-visible">
        <h3 className="font-medium">Book this spot</h3>
        
        <div className="grid grid-cols-2 gap-3 overflow-visible">
          <div className="space-y-1">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <div className="flex justify-between">
            <span>Total Cost:</span>
            <span className="font-bold">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            *Includes any applicable taxes and fees
          </p>
          <p className="text-xs text-amber-600 mt-2 font-medium">
            Note: If your parking time exceeds the booked duration, additional fine amount will be collected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingForm;
