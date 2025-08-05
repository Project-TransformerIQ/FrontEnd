import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  FileImage,
  Zap,
  MessageSquare,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import thermalSample from "@/assets/thermal-sample.jpg";

interface UploadNewProps {
  userRole: 'Admin' | 'Engineer';
}

export function UploadNew({ userRole }: UploadNewProps) {
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [selectedTransformer, setSelectedTransformer] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [annotations, setAnnotations] = useState<Array<{
    id: number;
    x: number;
    y: number;
    severity: 'Normal' | 'Warning' | 'Critical';
    note: string;
  }>>([]);

  // Mock analysis results
  const [analysisResults] = useState({
    anomaliesDetected: 3,
    maxTemperature: 89.2,
    averageTemperature: 67.8,
    criticalAreas: 2,
    warningAreas: 1,
    confidence: 94.5
  });

  const transformers = [
    { id: 'T-001', name: 'Main Distribution Transformer - Station A' },
    { id: 'T-002', name: 'Secondary Transformer - Station B' },
    { id: 'T-003', name: 'Backup Power Transformer - Station C' }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setAnalysisComplete(false);
        // Simulate AI analysis
        setTimeout(() => {
          setAnalyzing(true);
          setTimeout(() => {
            setAnalyzing(false);
            setAnalysisComplete(true);
            toast({
              title: "Analysis Complete",
              description: `Detected ${analysisResults.anomaliesDetected} thermal anomalies with ${analysisResults.confidence}% confidence.`,
            });
          }, 3000);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!analysisComplete) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    const newAnnotation = {
      id: Date.now(),
      x,
      y,
      severity: 'Warning' as const,
      note: 'Click to edit note'
    };
    
    setAnnotations([...annotations, newAnnotation]);
  };

  const updateAnnotation = (id: number, field: string, value: string) => {
    setAnnotations(annotations.map(ann => 
      ann.id === id ? { ...ann, [field]: value } : ann
    ));
  };

  const removeAnnotation = (id: number) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
  };

  const handleSubmit = () => {
    if (!selectedTransformer || !uploadedImage) {
      toast({
        title: "Missing Information",
        description: "Please select a transformer and upload an image.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report Submitted",
      description: "Your thermal inspection report has been submitted for review.",
    });

    // Reset form
    setUploadedImage(null);
    setAnalysisComplete(false);
    setSelectedTransformer("");
    setFeedback("");
    setAnnotations([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Normal':
        return 'border-success bg-success/20';
      case 'Warning':
        return 'border-warning bg-warning/20';
      case 'Critical':
        return 'border-destructive bg-destructive/20';
      default:
        return 'border-muted bg-muted/20';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload New Thermal Image</h1>
        <p className="text-muted-foreground">
          Upload thermal images for AI-powered anomaly detection and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload and Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transformer Selection */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>Select Transformer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTransformer} onValueChange={setSelectedTransformer}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose transformer to inspect" />
                </SelectTrigger>
                <SelectContent>
                  {transformers.map((transformer) => (
                    <SelectItem key={transformer.id} value={transformer.id}>
                      {transformer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-primary" />
                <span>Thermal Image Upload</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!uploadedImage ? (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <FileImage className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Upload Thermal Image
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Drag and drop your thermal image here, or click to browse
                  </p>
                  <label htmlFor="image-upload">
                    <Button variant="thermal" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    className="relative rounded-lg overflow-hidden cursor-crosshair"
                    onClick={handleImageClick}
                  >
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded thermal image" 
                      className="w-full h-64 object-cover"
                    />
                    
                    {/* Analysis Overlay */}
                    {analyzing && (
                      <div className="absolute inset-0 bg-primary/80 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Analyzing thermal patterns...</p>
                        </div>
                      </div>
                    )}

                    {/* Annotations */}
                    {annotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className={`absolute w-6 h-6 rounded-full border-2 ${getSeverityColor(annotation.severity)} flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
                        style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // In a real app, this would open an edit dialog
                        }}
                      >
                        <span className="text-xs font-bold">!</span>
                      </div>
                    ))}
                  </div>

                  {analysisComplete && (
                    <div className="text-sm text-muted-foreground">
                      Click on the image to add annotations for detected anomalies
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <label htmlFor="image-upload-replace">
                      <Button variant="outline" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Replace Image
                      </Button>
                    </label>
                    <input
                      id="image-upload-replace"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Progress */}
          {(analyzing || analysisComplete) && (
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span>AI Analysis {analyzing ? 'In Progress' : 'Complete'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyzing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Thermal Pattern Recognition</span>
                      <span>Processing...</span>
                    </div>
                    <Progress value={33} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Anomaly Detection</span>
                      <span>Processing...</span>
                    </div>
                    <Progress value={66} className="h-2" />
                    
                    <div className="flex justify-between text-sm">
                      <span>Temperature Analysis</span>
                      <span>Processing...</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Analysis Complete</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {analysisResults.confidence}%
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Max Temperature:</span>
                        <span className="font-medium text-destructive">{analysisResults.maxTemperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Temperature:</span>
                        <span className="font-medium">{analysisResults.averageTemperature}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Anomalies Found:</span>
                        <span className="font-medium text-warning">{analysisResults.anomaliesDetected}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Engineer Feedback */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>Engineer Feedback & Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedback">Inspection Notes</Label>
                <Textarea
                  id="feedback"
                  placeholder="Add your observations, concerns, or recommendations..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              {annotations.length > 0 && (
                <div className="space-y-3">
                  <Label>Annotations ({annotations.length})</Label>
                  {annotations.map((annotation, index) => (
                    <div key={annotation.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <div className={`w-4 h-4 rounded-full border-2 ${getSeverityColor(annotation.severity)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">Annotation #{index + 1}</span>
                          <Badge variant={annotation.severity === 'Critical' ? 'destructive' : annotation.severity === 'Warning' ? 'default' : 'secondary'}>
                            {annotation.severity}
                          </Badge>
                        </div>
                        <input
                          type="text"
                          value={annotation.note}
                          onChange={(e) => updateAnnotation(annotation.id, 'note', e.target.value)}
                          className="w-full text-sm bg-transparent border-none outline-none"
                          placeholder="Add note for this annotation..."
                        />
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeAnnotation(annotation.id)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <Card className="shadow-elegant">
            <CardContent className="p-6">
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                variant="thermal"
                disabled={!selectedTransformer || !uploadedImage}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Inspection Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results Sidebar */}
        <div className="space-y-6">
          {analysisComplete && (
            <>
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Critical Areas</span>
                      <Badge variant="destructive">{analysisResults.criticalAreas}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Warning Areas</span>
                      <Badge variant="default">{analysisResults.warningAreas}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Confidence Level</span>
                      <span className="text-sm font-medium">{analysisResults.confidence}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                      <span>Immediate inspection required for high-temperature areas</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span>Schedule maintenance for warning zones within 2 weeks</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Continue regular monitoring schedule</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg">Sample Thermal Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img 
                src={thermalSample} 
                alt="Sample thermal image" 
                className="w-full rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Example of thermal imaging analysis showing temperature variations
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}