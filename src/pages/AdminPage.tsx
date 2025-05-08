
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Check, X, Star } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

// Types for verification requests
interface OwnerVerificationRequest {
  id: string;
  ownerName: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

interface SpotVerificationRequest {
  id: string;
  ownerName: string;
  spotName: string;
  spotImages: string[];
  status: 'pending' | 'approved' | 'rejected';
  appealReason?: string;
}

const AdminPage: React.FC = () => {
  // Mock owner verification requests
  const [ownerRequests, setOwnerRequests] = useState<OwnerVerificationRequest[]>([
    {
      id: '1',
      ownerName: 'John Doe',
      documents: ['/placeholder.svg', '/placeholder.svg'],
      status: 'pending',
    },
    {
      id: '2',
      ownerName: 'Jane Smith',
      documents: ['/placeholder.svg', '/placeholder.svg'],
      status: 'pending',
    },
    {
      id: '3',
      ownerName: 'Bob Johnson',
      documents: ['/placeholder.svg', '/placeholder.svg'],
      status: 'pending',
    },
  ]);

  // Mock spot verification requests
  const [spotRequests, setSpotRequests] = useState<SpotVerificationRequest[]>([
    {
      id: '1',
      ownerName: 'John Doe',
      spotName: 'Downtown Parking A',
      spotImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      status: 'pending',
      appealReason: 'I believe this spot deserves a higher rating',
    },
    {
      id: '2',
      ownerName: 'Jane Smith',
      spotName: 'City Center Parking',
      spotImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
      status: 'pending',
      appealReason: 'The automated system missed security features',
    },
  ]);

  // State for admin rating inputs
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [pros, setPros] = useState<Record<string, string>>({});
  const [cons, setCons] = useState<Record<string, string>>({});

  const handleApproveOwner = (id: string) => {
    setOwnerRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
    toast.success("Owner approved to use the app");
  };

  const handleRejectOwner = (id: string) => {
    setOwnerRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    );
    toast.error("Owner verification request declined");
  };

  const handleApproveSpot = (id: string) => {
    if (!ratings[id]) {
      toast.error("Please provide a rating before approving");
      return;
    }

    setSpotRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
    toast.success("Parking spot verified successfully");
  };

  const handleRejectSpot = (id: string) => {
    setSpotRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    );
    toast.error("Parking spot verification declined");
  };

  const handleRatingChange = (id: string, value: string) => {
    const rating = parseInt(value);
    if (rating >= 1 && rating <= 5) {
      setRatings(prev => ({ ...prev, [id]: rating }));
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Verifications</h1>
        
        <Tabs defaultValue="owners" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="owners">Owner Verifications</TabsTrigger>
            <TabsTrigger value="spots">Spot Verifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="owners">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Pending Owner Verification Requests</h2>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Owner Name</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ownerRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.ownerName}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {request.documents.map((doc, index) => (
                              <div key={index} className="w-16 h-16 border rounded overflow-hidden">
                                <img 
                                  src={doc} 
                                  alt={`Document ${index + 1}`}
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : request.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                                onClick={() => handleApproveOwner(request.id)}
                              >
                                <Check className="mr-1 h-4 w-4" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                onClick={() => handleRejectOwner(request.id)}
                              >
                                <X className="mr-1 h-4 w-4" /> Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {ownerRequests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                          No pending verification requests.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="spots">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Pending Spot Verification Requests</h2>
              </div>
              
              <div className="space-y-8 p-4">
                {spotRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{request.spotName}</h3>
                        <p className="text-sm text-gray-600">Owner: {request.ownerName}</p>
                        {request.appealReason && (
                          <p className="mt-2 text-sm italic bg-gray-50 p-2 rounded">
                            "Appeal reason: {request.appealReason}"
                          </p>
                        )}
                      </div>
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {request.spotImages.map((img, index) => (
                        <div key={index} className="border rounded overflow-hidden">
                          <img 
                            src={img} 
                            alt={`Spot Image ${index + 1}`}
                            className="w-full h-48 object-cover" 
                          />
                        </div>
                      ))}
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rating (1-5) <Star className="inline-block ml-1 h-4 w-4" />
                            </label>
                            <Input 
                              type="number" 
                              min="1" 
                              max="5"
                              value={ratings[request.id] || ''} 
                              onChange={(e) => handleRatingChange(request.id, e.target.value)}
                              className="w-full"
                              placeholder="Enter rating from 1 to 5"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Pros
                            </label>
                            <Textarea 
                              value={pros[request.id] || ''} 
                              onChange={(e) => setPros(prev => ({ ...prev, [request.id]: e.target.value }))}
                              className="w-full"
                              placeholder="Enter pros of this parking spot"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cons
                            </label>
                            <Textarea 
                              value={cons[request.id] || ''} 
                              onChange={(e) => setCons(prev => ({ ...prev, [request.id]: e.target.value }))}
                              className="w-full"
                              placeholder="Enter cons of this parking spot"
                              rows={3}
                            />
                          </div>
                        </div>
                        
                        <div className="flex space-x-3 justify-end mt-4">
                          <Button 
                            variant="outline" 
                            className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                            onClick={() => handleApproveSpot(request.id)}
                          >
                            <Check className="mr-1 h-4 w-4" /> Approve Spot
                          </Button>
                          <Button 
                            variant="outline" 
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                            onClick={() => handleRejectSpot(request.id)}
                          >
                            <X className="mr-1 h-4 w-4" /> Reject Spot
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {spotRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending spot verification requests.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;
