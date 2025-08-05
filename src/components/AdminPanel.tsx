import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  Thermometer,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import thermalSample from "@/assets/thermal-sample.jpg";

export function AdminPanel() {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  // Mock pending feedback data
  const pendingReports = [
    {
      id: 1,
      transformerId: 'T-003',
      transformerName: 'Backup Power Transformer',
      engineer: 'Mike Johnson',
      submittedAt: '2024-01-15 09:15',
      status: 'Critical',
      anomaliesDetected: 5,
      maxTemperature: 92.5,
      engineerNotes: 'Detected significant overheating in the primary coil area. Temperature readings exceed normal operating limits. Recommend immediate inspection and possible maintenance shutdown.',
      annotations: [
        { id: 1, severity: 'Critical', note: 'Primary coil hotspot - 92.5°C' },
        { id: 2, severity: 'Critical', note: 'Secondary connection point - 89.2°C' },
        { id: 3, severity: 'Warning', note: 'Oil temperature elevated - 78°C' }
      ],
      aiConfidence: 96.8,
      priority: 'High'
    },
    {
      id: 2,
      transformerId: 'T-002',
      transformerName: 'Secondary Transformer',
      engineer: 'Sarah Wilson',
      submittedAt: '2024-01-14 14:45',
      status: 'Warning',
      anomaliesDetected: 2,
      maxTemperature: 76.3,
      engineerNotes: 'Minor temperature elevation observed in cooling system. May indicate partial blockage in ventilation. Suggest monitoring and scheduled maintenance check.',
      annotations: [
        { id: 1, severity: 'Warning', note: 'Cooling fan area warm - 76.3°C' },
        { id: 2, severity: 'Normal', note: 'Core temperature stable - 65°C' }
      ],
      aiConfidence: 89.2,
      priority: 'Medium'
    },
    {
      id: 3,
      transformerId: 'T-001',
      transformerName: 'Main Distribution Transformer',
      engineer: 'John Smith',
      submittedAt: '2024-01-13 11:30',
      status: 'Normal',
      anomaliesDetected: 0,
      maxTemperature: 58.9,
      engineerNotes: 'All systems operating within normal parameters. No anomalies detected. Regular inspection completed successfully.',
      annotations: [],
      aiConfidence: 94.5,
      priority: 'Low'
    }
  ];

  // Mock completed reviews
  const completedReviews = [
    {
      id: 4,
      transformerId: 'T-001',
      engineer: 'John Smith',
      reviewedAt: '2024-01-10 16:20',
      status: 'Approved',
      adminNotes: 'Report approved. Maintenance scheduled for next week.',
      priority: 'Medium'
    },
    {
      id: 5,
      transformerId: 'T-002',
      engineer: 'Sarah Wilson',
      reviewedAt: '2024-01-09 13:45',
      status: 'Approved',
      adminNotes: 'Good analysis. Recommend increased monitoring frequency.',
      priority: 'Low'
    }
  ];

  // Analytics data
  const analyticsData = {
    totalReports: 127,
    pendingReview: 8,
    approvedReports: 98,
    rejectedReports: 5,
    averageReviewTime: '2.4 hours',
    criticalIssues: 12,
    resolvedIssues: 45,
    engineerPerformance: [
      { name: 'John Smith', reports: 42, accuracy: 96.8, avgResponseTime: '1.8 hrs' },
      { name: 'Sarah Wilson', reports: 38, accuracy: 94.2, avgResponseTime: '2.1 hrs' },
      { name: 'Mike Johnson', reports: 35, accuracy: 92.5, avgResponseTime: '2.8 hrs' },
      { name: 'Emily Davis', reports: 12, accuracy: 95.1, avgResponseTime: '1.9 hrs' }
    ]
  };

  const handleApproveReport = (reportId: number) => {
    toast({
      title: "Report Approved",
      description: "The inspection report has been approved and marked as complete.",
    });
  };

  const handleRejectReport = (reportId: number) => {
    if (!adminResponse.trim()) {
      toast({
        title: "Response Required",
        description: "Please provide feedback before rejecting the report.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Report Rejected",
      description: "The report has been sent back to the engineer with your feedback.",
    });
    setAdminResponse("");
  };

  const handleRequestRevision = (reportId: number) => {
    if (!adminResponse.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide specific feedback for the revision request.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Revision Requested",
      description: "The engineer has been notified of the revision requirements.",
    });
    setAdminResponse("");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-destructive';
      case 'Medium':
        return 'text-warning';
      case 'Low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Critical':
        return <Badge className="bg-destructive text-destructive-foreground">{status}</Badge>;
      case 'Warning':
        return <Badge className="bg-warning text-warning-foreground">{status}</Badge>;
      case 'Normal':
        return <Badge className="bg-success text-success-foreground">{status}</Badge>;
      case 'Approved':
        return <Badge className="bg-success text-success-foreground">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground">
            Review and manage inspection reports and system analytics
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending Review ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">System Reports</TabsTrigger>
        </TabsList>

        {/* Pending Review Tab */}
        <TabsContent value="pending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reports List */}
            <div className="lg:col-span-1 space-y-4">
              {pendingReports.map((report) => (
                <Card 
                  key={report.id}
                  className={`cursor-pointer transition-all hover:shadow-elegant ${
                    selectedReport === report.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedReport(report.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{report.transformerId}</span>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-3 w-3" />
                          <span>{report.engineer}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>{report.submittedAt}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-3 w-3" />
                          <span>{report.maxTemperature}°C</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${getPriorityColor(report.priority)}`}>
                          {report.priority} Priority
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {report.anomaliesDetected} anomalies
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Report Details */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <div className="space-y-6">
                  {(() => {
                    const report = pendingReports.find(r => r.id === selectedReport)!;
                    return (
                      <>
                        <Card className="shadow-elegant">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span>{report.transformerName}</span>
                              {getStatusBadge(report.status)}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Engineer:</span>
                                <span className="ml-2 font-medium">{report.engineer}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Submitted:</span>
                                <span className="ml-2">{report.submittedAt}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Max Temperature:</span>
                                <span className="ml-2 font-medium text-destructive">{report.maxTemperature}°C</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">AI Confidence:</span>
                                <span className="ml-2 font-medium">{report.aiConfidence}%</span>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Thermal Image</h4>
                              <img 
                                src={thermalSample} 
                                alt="Thermal inspection" 
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Engineer Notes</h4>
                              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                {report.engineerNotes}
                              </p>
                            </div>

                            {report.annotations.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2">Annotations ({report.annotations.length})</h4>
                                <div className="space-y-2">
                                  {report.annotations.map((annotation, index) => (
                                    <div key={annotation.id} className="flex items-center space-x-3 text-sm">
                                      <Badge variant={annotation.severity === 'Critical' ? 'destructive' : annotation.severity === 'Warning' ? 'default' : 'secondary'}>
                                        {annotation.severity}
                                      </Badge>
                                      <span>{annotation.note}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Admin Response */}
                        <Card className="shadow-elegant">
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <MessageSquare className="h-5 w-5" />
                              <span>Admin Response</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <Textarea
                              placeholder="Provide feedback, additional instructions, or approval notes..."
                              value={adminResponse}
                              onChange={(e) => setAdminResponse(e.target.value)}
                              rows={4}
                            />
                            
                            <div className="flex space-x-3">
                              <Button 
                                variant="success" 
                                onClick={() => handleApproveReport(report.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button 
                                variant="warning" 
                                onClick={() => handleRequestRevision(report.id)}
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Request Revision
                              </Button>
                              <Button 
                                variant="destructive" 
                                onClick={() => handleRejectReport(report.id)}
                              >
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    );
                  })()}
                </div>
              ) : (
                <Card className="shadow-elegant">
                  <CardContent className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Select a Report to Review
                    </h3>
                    <p className="text-muted-foreground">
                      Choose a pending report from the list to view details and provide feedback
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="space-y-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Completed Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedReviews.map((review) => (
                  <div key={review.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{review.transformerId} - {review.engineer}</div>
                      <div className="text-sm text-muted-foreground">Reviewed on {review.reviewedAt}</div>
                      <div className="text-sm">{review.adminNotes}</div>
                    </div>
                    <div className="text-right space-y-1">
                      {getStatusBadge(review.status)}
                      <div className={`text-sm ${getPriorityColor(review.priority)}`}>
                        {review.priority} Priority
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                    <p className="text-2xl font-bold">{analyticsData.totalReports}</p>
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
                    <p className="text-2xl font-bold">{analyticsData.pendingReview}</p>
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
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{analyticsData.approvedReports}</p>
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
                    <p className="text-sm text-muted-foreground">Avg Review Time</p>
                    <p className="text-2xl font-bold">{analyticsData.averageReviewTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Engineer Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.engineerPerformance.map((engineer) => (
                  <div key={engineer.name} className="grid grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                    <div>
                      <div className="font-medium">{engineer.name}</div>
                      <div className="text-sm text-muted-foreground">Engineer</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{engineer.reports}</div>
                      <div className="text-sm text-muted-foreground">Reports</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{engineer.accuracy}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{engineer.avgResponseTime}</div>
                      <div className="text-sm text-muted-foreground">Avg Time</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>System Performance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Critical Issues</h4>
                    <div className="text-2xl font-bold text-destructive">{analyticsData.criticalIssues}</div>
                    <p className="text-sm text-muted-foreground">Requiring immediate attention</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Resolved Issues</h4>
                    <div className="text-2xl font-bold text-success">{analyticsData.resolvedIssues}</div>
                    <p className="text-sm text-muted-foreground">Successfully addressed</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Resolution Rate</h4>
                    <div className="text-2xl font-bold text-primary">78.9%</div>
                    <p className="text-sm text-muted-foreground">Overall system efficiency</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}