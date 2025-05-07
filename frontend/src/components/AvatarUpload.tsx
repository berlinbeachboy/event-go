import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { axiosInstance } from '../api/axios-instance'; // Update this path to match your project structure
import { Upload, Camera, X, Save, Loader2 } from "lucide-react";
import Cropper from "react-easy-crop"; // You'll need to install this package: npm install react-easy-crop
import { User } from "@/models/models";
import { getInitials } from '@/lib/utils';

// Helper function to create a rounded crop
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  // Set canvas size to the desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Canvas is empty");
      resolve(blob);
    }, "image/jpeg", 0.95);
  });
};

interface AvatarUploadProps {
  currentUser?: User
  onAvatarUpdate?: (avatarUrl: string) => void;
}

const AvatarUpload = ({ currentUser, onAvatarUpdate}: AvatarUploadProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser?.avatarUrlLg);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    if (croppedArea){
      console.log("bla")
    }
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
        setIsDialogOpen(true);
      });
      
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleSaveAvatar = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Get the cropped image as a blob
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      // Create a File object from the blob
      const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
      
      const formData = new FormData();
      formData.append("avatar", file);
      
      // If we have a user ID, add it to the request
      // if (currentUser?.id) {
      //   formData.append("userId", currentUser.id);
      // }
      
      // Send the image to the server
      const response = await axiosInstance.put("/user/me/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      // Update the avatar URL
      if (response.data.avatarUrl) {
        setAvatarUrl(response.data.avatarUrl);
        if (onAvatarUpdate) {
          onAvatarUpdate(response.data.avatarUrl);
        }
      }
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setUploadError("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="h-48 w-48 border-2 border-gray-200">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {getInitials(currentUser?.fullName)}
          </AvatarFallback>
        </Avatar>
        
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={triggerFileInput}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <Button variant="outline" size="sm" onClick={triggerFileInput} className="mt-2">
        <Upload className="h-4 w-4 mr-2" />
        Gib Foto
      </Button>
      
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Crop</DialogTitle>
            <DialogDescription>
              Hier gucke wie aussieht.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {imageSrc && (
              <div className="relative h-64 w-full">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
            )}
            
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zoom">Zoom</Label>
                <Slider
                  id="zoom"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0])}
                />
              </div>
              
              {uploadError && (
                <div className="text-sm text-red-500">{uploadError}</div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={closeDialog}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSaveAvatar} disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Avatar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvatarUpload;