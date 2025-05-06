
import React, { useState } from 'react';
import SearchAndFilter from '@/components/map/SearchAndFilter';
import GoogleMap from '@/components/map/GoogleMap';
import SpotList from '@/components/map/SpotList';
import SpotDetail from '@/components/map/SpotDetail';
import { Button } from "@/components/ui/button";
import { List } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import AppLayout from '@/components/layout/AppLayout';

const MapPage: React.FC = () => {
  const { showListView, toggleListView } = useApp();

  return (
    <AppLayout>
      <div className="relative h-screen">
        <div className="overlay-container">
          <SearchAndFilter />
          
          <Button
            variant="outline"
            size="sm"
            className="bg-white shadow-md mt-2"
            onClick={toggleListView}
          >
            <List size={18} className="mr-1" />
            {showListView ? 'Hide List' : 'Show List'}
          </Button>
        </div>
        
        <GoogleMap apiKey="AIzaSyAy71IIAH6wSCX4heLACwywNPzueSpCvk0" />
        
        {/* List view */}
        {showListView && (
          <SpotList className="z-10" />
        )}
        
        {/* Spot Detail Modal */}
        <SpotDetail />
      </div>
    </AppLayout>
  );
};

export default MapPage;
