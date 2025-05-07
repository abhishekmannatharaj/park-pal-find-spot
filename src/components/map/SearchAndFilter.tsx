
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter as FilterIcon, X } from "lucide-react";
import { useApp, VehicleType } from '@/context/AppContext';

const SearchAndFilter: React.FC = () => {
  const { filters, updateFilters } = useApp();
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters('search', e.target.value);
  };

  const handleVehicleTypeChange = (type: VehicleType) => {
    updateFilters('vehicleType', filters.vehicleType === type ? null : type);
  };

  const handleMaxPriceChange = (value: number[]) => {
    updateFilters('maxPrice', value[0]);
  };

  const handleRatingChange = (value: number[]) => {
    updateFilters('minRating', value[0]);
  };

  const clearFilters = () => {
    updateFilters('search', '');
    updateFilters('vehicleType', null);
    updateFilters('maxPrice', 100);
    updateFilters('minRating', 0);
    setShowFilters(false);
  };

  // Reduced list of vehicle types as requested
  const vehicleTypes: VehicleType[] = ['car', 'bike', 'sedan', 'hatchback', 'suv'];

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder="Search parking spots..."
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        <Button 
          variant={showFilters ? "secondary" : "outline"} 
          size="icon" 
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? "bg-primary text-white" : ""}
        >
          <FilterIcon size={18} />
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-3 animate-slide-up">
          <CardContent className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Filters</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X size={16} className="mr-1" /> Clear
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Vehicle Type Filter */}
              <div>
                <label className="text-sm font-medium">Vehicle Type:</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {vehicleTypes.map(type => (
                    <Button 
                      key={type}
                      size="sm" 
                      variant={filters.vehicleType === type ? "default" : "outline"}
                      onClick={() => handleVehicleTypeChange(type)}
                      className={filters.vehicleType === type ? "bg-primary" : ""}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Price Filter */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Max Price (hourly):</label>
                  <span className="text-sm">₹{filters.maxPrice}</span>
                </div>
                <Slider
                  className="mt-2"
                  defaultValue={[filters.maxPrice]}
                  max={100}
                  min={0}
                  step={5}
                  onValueChange={handleMaxPriceChange}
                />
              </div>
              
              {/* Rating Filter */}
              <div>
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Min Rating:</label>
                  <span className="text-sm">{filters.minRating} ★</span>
                </div>
                <Slider
                  className="mt-2"
                  defaultValue={[filters.minRating]}
                  max={5}
                  min={0}
                  step={0.5}
                  onValueChange={handleRatingChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchAndFilter;
