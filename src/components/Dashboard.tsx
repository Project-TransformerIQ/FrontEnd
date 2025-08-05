import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Thermometer, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Camera,
  FileText,
  Zap
} from "lucide-react";
import heroImage from "@/assets/hero-transformer.jpg";
import thermalSample from "@/assets/thermal-sample.jpg";

interface DashboardProps {
  userRole: 'Admin' | 'Engineer';
}

export function Dashboard({ userRole }: DashboardProps) {
  // Static data for transformers
  const transformers = [
    {
      id: 'T-001',
      name: 'Main Distribution Transformer',
      location: 'Station A - Building 1',
      status: 'Normal',
      lastInspection: '2024-01-15',
      temperature: 45,
      maxTemp: 85,
      anomalies: 0,
      nextInspection: '2024-02-15'
    },
    {
      id: 'T-002',
      name: 'Secondary Transformer',
      location: 'Station B - Building 2',
      status: 'Warning',
      lastInspection: '2024-01-10',
      temperature: 72,
      maxTemp: 85,
      anomalies: 2,
      nextInspection: '2024-02-10'
    },
    {
      id: 'T-003',
      name: 'Backup Power Transformer',
      location: 'Station C - Building 1',
      status: 'Critical',
      lastInspection: '2024-01-08',
      temperature: 89,
      maxTemp: 85,
      anomalies: 5,
      nextInspection: '2024-01-25'
    }
  ];

  // Static feedback summary
  const feedbackStats = {
    totalInspections: 127,
    pendingReview: userRole === 'Admin' ? 8 : 3,
    resolvedIssues: 45,
    averageResponseTime: '2.4 hours'
  };

  // Recent thermal images
  const recentImages = [
    {
      id: 1,
      transformerId: 'T-001',
      timestamp: '2024-01-15 10:30',
      status: 'Normal',
      engineer: 'John Smith',
      anomaliesDetected: 0
    },
    {
      id: 2,
      transformerId: 'T-002',
      timestamp: '2024-01-14 14:45',
      status: 'Warning',
      engineer: 'Sarah Wilson',
      anomaliesDetected: 2
    },
    {
      id: 3,
      transformerId: 'T-003',
      timestamp: '2024-01-13 09:15',
      status: 'Critical',
      engineer: 'Mike Johnson',
      anomaliesDetected: 5
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Normal':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'Critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Normal':
        return <Badge className="bg-success text-success-foreground">{status}</Badge>;
      case 'Warning':
        return <Badge className="bg-warning text-warning-foreground">{status}</Badge>;
      case 'Critical':
        return <Badge className="bg-destructive text-destructive-foreground">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-elegant">
        <img 
          src={heroImage} 
          alt="Transformer facility" 
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent flex items-center">
          <div className="px-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Thermal Inspection Dashboard
            </h1>
            <p className="text-white/90 text-lg">
              Real-time monitoring and analysis of transformer thermal conditions
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Thermometer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inspections</p>
                <p className="text-2xl font-bold text-foreground">{feedbackStats.totalInspections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-foreground">{feedbackStats.pendingReview}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved Issues</p>
                <p className="text-2xl font-bold text-foreground">{feedbackStats.resolvedIssues}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold text-foreground">{feedbackStats.averageResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transformer Details */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Transformer Status Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {transformers.map((transformer) => (
              <Card key={transformer.id} className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{transformer.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{transformer.id}</p>
                    </div>
                    {getStatusIcon(transformer.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{transformer.location}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    {getStatusBadge(transformer.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Temperature:</span>
                      <span className="font-medium">{transformer.temperature}°C</span>
                    </div>
                    <Progress 
                      value={(transformer.temperature / transformer.maxTemp) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Max: {transformer.maxTemp}°C
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Anomalies:</span>
                      <span className={`font-medium ${transformer.anomalies > 0 ? 'text-destructive' : 'text-success'}`}>
                        {transformer.anomalies}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Inspection:</span>
                      <span>{transformer.lastInspection}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Inspection:</span>
                      <span>{transformer.nextInspection}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Image History */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-primary" />
            <span>Recent Thermal Images</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentImages.map((image) => (
              <Card key={image.id} className="border-border">
                <CardContent className="p-4">
                  <img 
                    src={thermalSample} 
                    alt={`Thermal image for ${image.transformerId}`}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{image.transformerId}</span>
                      {getStatusBadge(image.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{image.timestamp}</p>
                    <p className="text-sm">Engineer: {image.engineer}</p>
                    <p className="text-sm">
                      Anomalies: <span className={`font-medium ${image.anomaliesDetected > 0 ? 'text-destructive' : 'text-success'}`}>
                        {image.anomaliesDetected}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedback Summary */}
      {userRole === 'Admin' && (
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Admin Feedback Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Recent Feedback Trends</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical Issues</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-destructive h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Warnings</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-warning h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Normal</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div className="bg-success h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Action Required</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
                    5 Critical reports pending review
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2 text-warning" />
                    3 Overdue inspections
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    12 Reports ready for approval
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}