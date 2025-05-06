
import React from 'react';
import AddNewSpot from '@/components/space-owner/AddNewSpot';
import AppLayout from '@/components/layout/AppLayout';

const AddSpotPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Add New Parking Spot</h1>
        <AddNewSpot />
      </div>
    </AppLayout>
  );
};

export default AddSpotPage;
