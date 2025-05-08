
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
import AppLayout from '@/components/layout/AppLayout';
import { Check, X } from 'lucide-react';

interface VerificationRequest {
  id: string;
  ownerName: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

const AdminPage: React.FC = () => {
  // Mock verification requests
  const [requests, setRequests] = useState<VerificationRequest[]>([
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

  const handleApprove = (id: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'approved' } : req
      )
    );
    toast.success("Owner approved to use the app");
  };

  const handleReject = (id: string) => {
    setRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: 'rejected' } : req
      )
    );
    toast.error("Request declined");
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Pending Verification Requests</h2>
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
                {requests.map((request) => (
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
                            onClick={() => handleApprove(request.id)}
                          >
                            <Check className="mr-1 h-4 w-4" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="mr-1 h-4 w-4" /> Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                
                {requests.length === 0 && (
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
      </div>
    </AppLayout>
  );
};

export default AdminPage;
