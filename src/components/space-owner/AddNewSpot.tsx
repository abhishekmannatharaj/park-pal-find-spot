
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp, VehicleType } from '@/context/AppContext';
import GoogleMap from '@/components/map/GoogleMap';
import { toast } from 'sonner';
import { Trash, Upload, Cctv, Search } from 'lucide-react';

// Mock AI analysis function
const analyzeSpot = () => {
  const safety = Math.floor(Math.random() * 3) + 3; // Random number between 3-5
  const pros = [
    'Well-lit area',
    '24/7 security cameras',
    'Easy access from main road',
    'Good visibility from surroundings',
    'Weather protected'
  ];
  const cons = [
    'Limited entrance/exit points',
    'Narrow parking spaces',
    'Limited operational hours',
    'No covered parking',
    'Distance from public transportation'
  ];
  
  // Randomly select 2-3 pros and 1-2 cons
  const selectedPros = [...pros].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 2);
  const selectedCons = [...cons].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
  
  // Generate random tags
  const allTags = ['Indoor', 'Outdoor', 'Covered', 'Uncovered', 'Safe', 'Well-lit', 'CCTV', 'Security'];
  const selectedTags = [...allTags].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
  
  return {
    safety,
    tags: selectedTags,
    analysis: {
      pros: selectedPros,
      cons: selectedCons,
      summary: `This parking spot has a safety rating of ${safety}/5. It's ${safety >= 4 ? 'generally safe' : 'moderately safe'} for parking.`
    }
  };
};

const AddNewSpot: React.FC = () => {
  const { addNewSpot } = useApp();
  const [location, setLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [photos, setPhotos] = useState<{id: string, src: string}[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [hasCctv, setHasCctv] = useState(false);
  const [hasLiveAccess, setHasLiveAccess] = useState(false);
  
  // Handle vehicle type selection
  const handleVehicleTypeChange = (type: VehicleType) => {
    setVehicleTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  
  // Handle location selection
  const handleLocationPicked = (location: google.maps.LatLngLiteral) => {
    setLocation(location);
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    if (photos.length + files.length > 3) {
      toast.error("Maximum 3 photos allowed");
      return;
    }
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            src: event.target.result as string
          };
          
          setPhotos(prev => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // Handle photo deletion
  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (step < 3) {
      // Validate current step
      if (step === 1) {
        if (!name || !description || !hourlyPrice || vehicleTypes.length === 0) {
          toast.error("Please fill all required fields");
          return;
        }
        if (name.length > 30) {
          toast.error("Name must be 30 characters or less");
          return;
        }
        if (description.length > 150) {
          toast.error("Description must be 150 characters or less");
          return;
        }
      } else if (step === 2) {
        if (!startDate || !endDate || !startTime || !endTime || !location || !address) {
          toast.error("Please fill all required fields");
          return;
        }
        
        const start = new Date(`${startDate}T${startTime}`);
        const end = new Date(`${endDate}T${endTime}`);
        
        if (end <= start) {
          toast.error("End date/time must be after start date/time");
          return;
        }
      }
      
      setStep(step + 1);
      return;
    }
    
    // If we're at the final step, submit the form
    if (photos.length < 3) {
      toast.error("Please upload 3 photos");
      return;
    }
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    
    // Create price object conditionally
    const price: { hourly: number; monthly?: number } = {
      hourly: parseFloat(hourlyPrice)
    };
    
    if (monthlyPrice) {
      price.monthly = parseFloat(monthlyPrice);
    }
    
    // Add CCTV info to description if applicable
    let fullDescription = description;
    if (hasCctv) {
      fullDescription += ` [CCTV equipped${hasLiveAccess ? ' with live access' : ''}]`;
    }
    
    addNewSpot({
      name,
      description: fullDescription,
      address,
      location: location || { lat: 12.9716, lng: 77.5946 },
      price,
      rating: analysis ? analysis.safety : 0,
      vehicleTypes,
      images: photos.map(photo => photo.src),
      availability: {
        startDate: startDateTime,
        endDate: endDateTime,
      },
      status: 'available'
    });
    
    toast.success("Spot added successfully!");
    
    // Reset form
    setName('');
    setDescription('');
    setAddress('');
    setHourlyPrice('');
    setMonthlyPrice('');
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setVehicleTypes([]);
    setPhotos([]);
    setLocation(null);
    setStep(1);
    setShowAnalysis(false);
    setAnalysis(null);
    setHasCctv(false);
    setHasLiveAccess(false);
  };
  
  // Handle analyze
  const handleAnalyze = () => {
    const result = analyzeSpot();
    setAnalysis(result);
    setShowAnalysis(true);
  };
  
  // Handle manual review
  const handleManualReview = () => {
    toast.success("Applied for manual analysis");
    // In a real app, this would send a request for manual review
  };
  
  const handleCctvChange = (checked: boolean) => {
    setHasCctv(checked);
    if (!checked) {
      setHasLiveAccess(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Add New Parking Spot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <div className="flex">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 ${
                    step === s 
                      ? 'bg-primary text-white' 
                      : step > s 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
              ))}
            </div>
            <div className="text-sm text-gray-500">
              Step {step} of 3
            </div>
          </div>
          
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (max 30 chars)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={30}
                  placeholder="e.g. MG Road Basement Parking"
                  required
                />
                <div className="text-xs text-right text-gray-500">
                  {name.length}/30
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (max 150 chars)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={150}
                  placeholder="Describe your parking space"
                  required
                  className="min-h-[80px]"
                />
                <div className="text-xs text-right text-gray-500">
                  {description.length}/150
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyPrice">Hourly Price (₹)</Label>
                  <Input
                    id="hourlyPrice"
                    type="number"
                    min="0"
                    step="1"
                    value={hourlyPrice}
                    onChange={(e) => setHourlyPrice(e.target.value)}
                    placeholder="e.g. 50"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="monthlyPrice">Monthly Price (₹) (Optional)</Label>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    min="0"
                    step="100"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    placeholder="e.g. 3000"
                  />
                </div>
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cctv" 
                    checked={hasCctv}
                    onCheckedChange={handleCctvChange}
                  />
                  <label
                    htmlFor="cctv"
                    className="text-sm font-medium leading-none flex items-center"
                  >
                    <Cctv size={16} className="mr-1" />
                    CCTV Available
                  </label>
                </div>
                
                {hasCctv && (
                  <div className="pl-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="liveAccess" 
                        checked={hasLiveAccess}
                        onCheckedChange={(checked) => setHasLiveAccess(!!checked)}
                      />
                      <label
                        htmlFor="liveAccess"
                        className="text-sm font-medium leading-none"
                      >
                        Live access available
                      </label>
                    </div>
                    <p className="text-xs text-amber-600 mt-1">
                      Note: You can charge a higher price if CCTV with live access is available
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Vehicle Types</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="car"
                      checked={vehicleTypes.includes('car')}
                      onCheckedChange={() => handleVehicleTypeChange('car')}
                    />
                    <label
                      htmlFor="car"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Car
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="bike"
                      checked={vehicleTypes.includes('bike')}
                      onCheckedChange={() => handleVehicleTypeChange('bike')}
                    />
                    <label
                      htmlFor="bike"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Bike
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sedan"
                      checked={vehicleTypes.includes('sedan')}
                      onCheckedChange={() => handleVehicleTypeChange('sedan')}
                    />
                    <label
                      htmlFor="sedan"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Sedan
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hatchback"
                      checked={vehicleTypes.includes('hatchback')}
                      onCheckedChange={() => handleVehicleTypeChange('hatchback')}
                    />
                    <label
                      htmlFor="hatchback"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Hatchback
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="suv"
                      checked={vehicleTypes.includes('suv')}
                      onCheckedChange={() => handleVehicleTypeChange('suv')}
                    />
                    <label
                      htmlFor="suv"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      SUV
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Complete Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter the complete address of the parking spot"
                  required
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Location (Select on map)</Label>
                <div className="h-[300px] rounded-md overflow-hidden border">
                  <GoogleMap 
                    apiKey="AIzaSyAy71IIAH6wSCX4heLACwywNPzueSpCvk0" 
                    pickLocation={true}
                    onLocationPicked={handleLocationPicked}
                  />
                </div>
                {location && (
                  <div className="text-xs text-gray-500">
                    Selected: Lat {location.lat.toFixed(6)}, Lng {location.lng.toFixed(6)}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
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
                <div className="space-y-2">
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
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Photos (Upload 3 photos)</Label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <input 
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <label 
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm font-medium">Click to upload photos</span>
                    <span className="text-xs text-gray-500 mt-1">
                      JPG, PNG or GIF (max. 3 files)
                    </span>
                  </label>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {photos.map((photo, index) => (
                    <div 
                      key={photo.id} 
                      className="aspect-square bg-gray-100 rounded-md flex items-center justify-center relative overflow-hidden border"
                    >
                      <img 
                        src={photo.src} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                        onClick={() => handleDeletePhoto(photo.id)}
                        type="button"
                      >
                        <Trash size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                  
                  {/* Empty placeholders */}
                  {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, i) => (
                    <div 
                      key={`empty-${i}`}
                      className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border border-dashed"
                    >
                      <label 
                        htmlFor="photo-upload" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">Upload</span>
                      </label>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-1">
                  {photos.length}/3 photos uploaded
                </p>
              </div>
              
              {photos.length === 3 && !showAnalysis && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAnalyze}
                  type="button"
                >
                  Analyze Spot
                </Button>
              )}
              
              {showAnalysis && analysis && (
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-2">Safety Analysis</h3>
                    
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= analysis.safety ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{analysis.analysis.summary}</p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {analysis.tags.map((tag: string, i: number) => (
                        <span key={i} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      {analysis.analysis.pros.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-green-600">Pros:</h4>
                          <ul className="list-disc list-inside text-sm pl-2">
                            {analysis.analysis.pros.map((pro: string, i: number) => (
                              <li key={i} className="text-gray-600">{pro}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {analysis.analysis.cons.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-600">Cons:</h4>
                          <ul className="list-disc list-inside text-sm pl-2">
                            {analysis.analysis.cons.map((con: string, i: number) => (
                              <li key={i} className="text-gray-600">{con}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      className="mt-4 w-full"
                      onClick={handleManualReview}
                    >
                      <Search size={16} className="mr-1" />
                      Appeal for Manual Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            <div className="flex-1" />
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSubmit}
            >
              {step < 3 ? 'Next' : 'Submit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddNewSpot;
