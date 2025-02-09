import { useState, useEffect } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Mic, MicOff } from "lucide-react";
import { CPTCodeCard } from "./CPTCodeCard";
import { CollapsibleSidebar } from "./CollapsibleSidebar";
import { useToast } from "../hooks/use-toast";

export function CPTRecorder() {
  const [cptCodes, setCPTCodes] = useState<string[]>([]);
  const { isListening, transcript, error, startListening, stopListening, cptHistory } = useSpeechRecognition();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadStatusColor, setUploadStatusColor] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (cptHistory) {
      const codes = [];
      for (const key of Object.keys(cptHistory)) {
        // @ts-ignore
        codes.push(`${key} - ${cptHistory[key]}`);
      }
      setCPTCodes(codes);
    }
  }, [cptHistory]);

  const filteredCodes = cptCodes.filter((code) => code.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "CPT Code Copied",
      description: `${code} has been copied to your clipboard.`,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      // Preview the selected image immediately
      const previewUrl = URL.createObjectURL(event.target.files[0]);
      setImagePreviewUrl(previewUrl);
    } else {
      setFile(null);
      setImagePreviewUrl(null); // Clear preview if no file selected
    }
  };


  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("⚠️ Please select an image first.");
      setUploadStatusColor("orange");
      return;
    }
  
    const formData = new FormData();
    formData.append("file", file);
  
    setUploadStatus("Uploading..."); 
    setUploadStatusColor("gray");
    setIsLoading(true);
    setImageUrl(null);
  
    try {
      const response = await fetch("http://localhost:5000/upload-image", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin'
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
  
      if (data.imageUrl) {
        // Show preview of original image
        if (file) {
          const previewUrl = URL.createObjectURL(file);
          setImagePreviewUrl(previewUrl);
        }
  
        // Show processed image with full URL
        setImageUrl(`http://localhost:5000${data.imageUrl}`);
        setUploadStatus("✅ Image processed successfully!");
        setUploadStatusColor("green");
      } else {
        setUploadStatus("⚠️ Image upload failed: No URL returned");
        setUploadStatusColor("orange");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
      setUploadStatusColor("red");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add error handling for processed image
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onerror = () => {
        console.error("Failed to load processed image:", imageUrl);
        setUploadStatus("⚠️ File uploaded but failed to load processed image");
        setUploadStatusColor("orange");
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen gap-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex-grow space-y-4 overflow-auto p-4 h-full">
        <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text">
          CPT Code Recorder
        </h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recording Controls
              {isListening && <span className="text-sm text-cyan-400 animate-pulse">Recording...</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={isListening ? stopListening : startListening} variant={isListening ? "destructive" : "default"}>
              {isListening ? <><MicOff className="mr-2" /> Stop Recording</> : <><Mic className="mr-2" /> Start Recording</>}
            </Button>
            {error && <p className="text-rose-400 mt-2">{error}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Extracted CPT Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="text" placeholder="Search CPT codes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            {filteredCodes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCodes.map((code, index) => (
                  <CPTCodeCard key={index} code={code} onCopy={handleCopy} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No CPT codes extracted yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upload Image for Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            <Button onClick={handleUpload} className="mt-2">Upload</Button>

            {isLoading && <div id="loading-spinner">Loading...</div>}  {/* Show loading spinner */}

            {uploadStatus && (
              <p style={{ color: uploadStatusColor }} className="mt-2">
                {uploadStatus}
              </p>
            )}

            {/* Image Preview before processing */}
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Image Preview"
                className="mt-4 rounded-lg shadow"
                style={{ display: imagePreviewUrl ? "block" : "none" }}
              />
            )}

            {/* Processed image after successful upload */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Processed Image"
                id="processed-image"
                className="mt-4 rounded-lg shadow"
                style={{ display: imageUrl ? "block" : "none" }}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <div className="w-1/3">
        <CollapsibleSidebar transcript={transcript} />
      </div>
    </div>
  );
};