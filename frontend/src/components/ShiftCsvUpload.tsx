import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import axios from "axios"; // Make sure axios is installed

// Assuming you have an axios instance configured elsewhere
import { axiosInstance } from '../api/axios-instance'; // Update this import to match your project structure


const CsvUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    success?: boolean;
    message?: string;
    details?: any;
  } | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file is CSV
      if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
        setUploadStatus({
          success: false,
          message: "Please select a CSV file"
        });
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus({
        success: false,
        message: "Please select a file first"
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post("/admin/shifts/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = progressEvent.total 
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setProgress(percentCompleted);
        },
      });

      setUploadStatus({
        success: true,
        message: response.data.message || "Shifts imported successfully",
        details: response.data.shifts,
      });
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setUploadStatus({
        success: false,
        message: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadStatus(null);
    setProgress(0);
    
    // Reset the file input
    const fileInput = document.getElementById("csv-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Import Shifts</CardTitle>
        <CardDescription>
          Upload a CSV file to import shifts into the system. <br></br>
          It needs the columns "day", "starttime" (HH:mm), "name", "description", "headcount" (int), "points" (int). <br></br>
          Value for Day can be any of [Montag, Freitag, Samstag, Sonntag].
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="csv-upload">CSV File</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <p className="text-sm text-gray-500 mt-1">
            {file ? `Selected: ${file.name}` : "No file selected"}
          </p>
        </div>

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Uploading... {progress}%</span>
            </div>
          </div>
        )}

        {uploadStatus && (
          <Alert variant={uploadStatus.success ? "default" : "destructive"}>
            {uploadStatus.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {uploadStatus.success ? "Success" : "Error"}
            </AlertTitle>
            <AlertDescription>{uploadStatus.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={resetUpload}
          disabled={uploading}
        >
          Clear
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!file || uploading || uploadStatus?.success}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CsvUpload;