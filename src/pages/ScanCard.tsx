import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseFunction } from "@/hooks/useSupabaseFunction";
import { v4 as uuidv4 } from 'uuid';

interface ScanResult {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  position: string;
}

const ScanCard = () => {
  const [step, setStep] = useState<'upload' | 'preview' | 'details' | 'notes'>('upload');
  const [isScanning, setIsScanning] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult>({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    position: ''
  });
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addContact } = useData();
  const { user } = useAuth();
  
  const processBusinessCard = useSupabaseFunction<{
    success: boolean;
    contact?: ScanResult;
    extraction?: ScanResult;
  }>('process-business-card');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (file: File) => {
    setIsScanning(true);
    
    try {
      const fileName = `${user!.id}/${uuidv4()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business_cards')
        .upload(fileName, file);
      
      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('business_cards')
        .getPublicUrl(fileName);
      
      console.log("Public URL:", publicUrl);
      const payload = { imageUrl: publicUrl, userId: user!.id };
      console.log("Payload sent to Edge Function:", payload);
      
      const { execute } = processBusinessCard;
      const response = await execute(payload);
      
      if (!response || typeof response.success !== 'boolean') {
        throw new Error('Invalid or no response from Edge Function');
      }
      
      if (response.success && (response.contact || response.extraction)) {
        const extractedData = response.contact || response.extraction;
        if (extractedData) {
          setScanResult({
            full_name: extractedData.full_name || '',
            email: extractedData.email || '',
            phone: extractedData.phone || '',
            company: extractedData.company || '',
            website: extractedData.website || '',
            position: extractedData.position || ''
          });
          setStep('preview');
        }
      } else {
        throw new Error(`Failed to process business card: ${response.message || 'No valid data returned'}`);
      }
    } catch (error) {
      console.error('Error processing card:', error);
      toast({
        variant: 'destructive',
        title: 'Processing failed',
        description: error instanceof Error ? error.message : 'Failed to process business card'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleCameraCapture = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        toast({
          title: "Camera activated",
          description: "Position the business card within the frame and tap to capture.",
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: 'destructive',
        title: 'Camera access failed',
        description: 'Could not access your camera. Please check permissions.'
      });
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
   

 const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        toast({
          variant: 'destructive',
          title: 'Capture failed',
          description: 'Failed to capture image'
        });
        return;
      }
      
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCapturing(false);
      
      const file = new File([blob], `card-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        processImage(file);
      };
      reader.readAsDataURL(file);
    }, 'image/jpeg', 0.95);
  };

  const handleScanAgain = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setStep('upload');
    setUploadedImage(null);
    setImageFile(null);
    setIsCapturing(false);
    setScanResult({
      full_name: '',
      email: '',
      phone: '',
      company: '',
      website: '',
      position: ''
    });
    setNotes('');
  };

  const handleContinue = () => {
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    setStep('notes');
  };

  const handleSaveContact = async () => {
    try {
      await addContact({
        name: scanResult.full_name,
        email: scanResult.email,
        phone: scanResult.phone,
        company: scanResult.company,
        website: scanResult.website,
        position: scanResult.position,
        notes,
        tags: []
      });
      toast({
        title: "Contact saved",
        description: "The contact has been added to your network."
      });
      navigate("/contacts");
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to save contact',
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    }
  };
  
  const cancelCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Scan Business Card</h1>
      
      {step === 'upload' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="text-center">
                <p className="mb-4 text-muted-foreground">
                  Scan a business card to quickly add a new contact
                </p>
              </div>
              
              {isCapturing ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={cancelCamera}
                    >
                      Cancel
                    </Button>
                    <Button onClick={capturePhoto}>
                      Capture
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <Button 
                    className="h-32 flex flex-col gap-2"
                    onClick={handleCameraCapture}
                  >
                    <Camera className="h-6 w-6" />
                    <span>Use Camera</span>
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="h-32 flex flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-6 w-6" />
                    <span>Upload Image</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </Button>
                </div>
              )}
              
              <p className="text-sm text-center text-muted-foreground">
                Supports JPEG, PNG, and most image formats.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-6">
              {isScanning ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium">Scanning...</p>
                  <p className="text-muted-foreground">Extracting information from the card</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    {uploadedImage && (
                      <div className="relative">
                        <img 
                          src={uploadedImage} 
                          alt="Scanned card" 
                          className="max-h-48 object-contain rounded border" 
                        />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h3 className="font-medium mb-2">Extracted Information</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{scanResult.full_name}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{scanResult.email}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-medium">{scanResult.phone}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Company:</span>
                        <span className="font-medium">{scanResult.company}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span className="font-medium">{scanResult.position}</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span className="text-muted-foreground">Website:</span>
                        <span className="font-medium">{scanResult.website}</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleScanAgain}
                    >
                      Scan Again
                    </Button>
                    <Button onClick={handleContinue}>
                      Continue
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'details' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Edit Contact Details</h2>
              <p className="text-muted-foreground">
                Please verify the extracted information and make any needed corrections.
              </p>
              
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      value={scanResult.full_name} 
                      onChange={e => setScanResult({...scanResult, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={scanResult.email} 
                      onChange={e => setScanResult({...scanResult, email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={scanResult.phone} 
                      onChange={e => setScanResult({...scanResult, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      value={scanResult.company} 
                      onChange={e => setScanResult({...scanResult, company: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input 
                      id="position" 
                      value={scanResult.position} 
                      onChange={e => setScanResult({...scanResult, position: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={scanResult.website} 
                      onChange={e => setScanResult({...scanResult, website: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('preview')}
                >
                  Back
                </Button>
                <Button onClick={handleDetailsSubmit}>
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'notes' && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Add Synergy Notes</h2>
              <p className="text-muted-foreground">
                Capture why you want to follow up with {scanResult.full_name}. These notes will help generate personalized follow-up emails.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Examples: Discussed potential collaboration on project X, Interested in our services, Mentioned expertise in digital marketing..."
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('details')}
                >
                  Back
                </Button>
                <Button onClick={handleSaveContact}>
                  Save Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScanCard;