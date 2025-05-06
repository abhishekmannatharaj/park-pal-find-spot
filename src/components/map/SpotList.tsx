
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";
import { ParkingSpot, useApp } from '@/context/AppContext';
import { formatCurrency } from '@/lib/utils';

interface SpotListProps {
  className?: string;
}

const StatusBadge: React.FC<{ status: ParkingSpot['status'] }> = ({ status }) => {
  let color = 'bg-gray-200 text-gray-800';
  let text = 'Unavailable';

  switch (status) {
    case 'available':
      color = 'bg-green-100 text-green-800';
      text = 'Available';
      break;
    case 'soon':
      color = 'bg-yellow-100 text-yellow-800';
      text = 'Soon Available';
      break;
    case 'filling':
      color = 'bg-red-100 text-red-800';
      text = 'Filling Fast';
      break;
    case 'full':
      color = 'bg-gray-100 text-gray-800';
      text = 'Full';
      break;
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${color}`}>
      {text}
    </span>
  );
};

const SpotCard: React.FC<{ spot: ParkingSpot }> = ({ spot }) => {
  const { setSelectedSpot } = useApp();

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedSpot(spot)}>
      <CardContent className="p-3">
        <div className="flex">
          <div className="w-20 h-20 bg-gray-200 rounded mr-3 overflow-hidden">
            <img 
              src={spot.images[0]} 
              alt={spot.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-medium truncate">{spot.name}</h3>
              <StatusBadge status={spot.status} />
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Star size={14} className="text-yellow-500 mr-1" fill="currentColor" />
              <span>{spot.rating}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{spot.description}</p>
            <div className="flex justify-between items-center mt-2">
              <div className="font-medium">{formatCurrency(spot.price.hourly)}/hr</div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SpotList: React.FC<SpotListProps> = ({ className }) => {
  const { filteredSpots } = useApp();

  return (
    <div className={`bottom-sheet ${className}`} style={{ maxHeight: '60vh' }}>
      <div className="bottom-sheet-handle" />
      
      <div className="p-4">
        <h2 className="font-bold mb-2">Nearby Parking ({filteredSpots.length})</h2>
        
        <ScrollArea className="h-[calc(60vh-65px)]">
          {filteredSpots.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No parking spots found matching your criteria
            </div>
          ) : (
            filteredSpots.map(spot => (
              <SpotCard key={spot.id} spot={spot} />
            ))
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default SpotList;
