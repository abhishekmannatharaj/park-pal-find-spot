
import React from 'react';
import { useApp } from '@/context/AppContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

const SpotsPage: React.FC = () => {
  const { mySpots, deleteSpot } = useApp();
  const navigate = useNavigate();

  const handleAddNewSpot = () => {
    navigate('/add-spot');
  };

  const handleDeleteSpot = (spotId: string) => {
    if (window.confirm('Are you sure you want to delete this spot?')) {
      deleteSpot(spotId);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Parking Spots</h1>
          <Button onClick={handleAddNewSpot} className="bg-primary hover:bg-primary/90">
            <Plus size={16} className="mr-1" />
            Add New Spot
          </Button>
        </div>

        {mySpots.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-600 mb-2">No parking spots yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first parking spot</p>
            <Button onClick={handleAddNewSpot} className="bg-primary hover:bg-primary/90">
              <Plus size={16} className="mr-1" />
              Add New Spot
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySpots.map((spot) => (
              <Card key={spot.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 overflow-hidden">
                  <img
                    src={spot.images[0]} 
                    alt={spot.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{spot.name}</h3>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      spot.status === 'available' ? 'bg-green-100 text-green-800' :
                      spot.status === 'soon' ? 'bg-yellow-100 text-yellow-800' :
                      spot.status === 'filling' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {spot.status.charAt(0).toUpperCase() + spot.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="truncate">{spot.address || 'Location set on map'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <p className="text-sm font-medium">{formatCurrency(spot.price.hourly)}/hr</p>
                      {spot.price.monthly && (
                        <p className="text-xs text-gray-500">{formatCurrency(spot.price.monthly)}/month</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteSpot(spot.id)}
                    >
                      <Trash size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SpotsPage;
