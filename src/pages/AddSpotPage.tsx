
import React from 'react';
import AddNewSpot from '@/components/space-owner/AddNewSpot';
import AppLayout from '@/components/layout/AppLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AddSpotPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            className="mb-2"
            onClick={() => navigate('/spots')}
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Spots
          </Button>
          <h1 className="text-2xl font-bold">Add New Parking Spot</h1>
        </div>
        <AddNewSpot />
      </div>
    </AppLayout>
  );
};

export default AddSpotPage;
