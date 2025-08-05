import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  TrendingUp,
  Clock
} from "lucide-react";

export function Team() {
  // Static team data
  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Emily Davis',
      role: 'Admin',
      department: 'Engineering Management',
      email: 'emily.davis@company.com',
      phone: '+1 (555) 123-4567',
      location: 'Station A - Main Office',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6523006?w=150',
      joinDate: '2020-03-15',
      certifications: ['Professional Engineer', 'Thermal Imaging Level III', 'Safety Management'],
      stats: {
        reportsReviewed: 156,
        avgReviewTime: '1.8 hours',
        accuracy: '98.5%'
      },
      specializations: ['Transformer Analysis', 'Risk Assessment', 'Team Management']
    },
    {
      id: 2,
      name: 'John Smith',
      role: 'Engineer',
      department: 'Field Operations',
      email: 'john.smith@company.com',
      phone: '+1 (555) 234-5678',
      location: 'Station A - Field Office',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      joinDate: '2021-06-20',
      certifications: ['Thermography Level II', 'Electrical Safety', 'Hazmat Certified'],
      stats: {
        inspectionsCompleted: 142,
        avgResponseTime: '1.8 hours',
        accuracy: '96.8%'
      },
      specializations: ['Thermal Imaging', 'Preventive Maintenance', 'Emergency Response']
    },
    {
      id: 3,
      name: 'Sarah Wilson',
      role: 'Engineer',
      department: 'Quality Assurance',
      email: 'sarah.wilson@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Station B - Technical Center',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      joinDate: '2021-09-10',
      certifications: ['Quality Management', 'Thermal Analysis', 'ISO 9001 Lead Auditor'],
      stats: {
        inspectionsCompleted: 128,
        avgResponseTime: '2.1 hours',
        accuracy: '94.2%'
      },
      specializations: ['Quality Control', 'Data Analysis', 'Process Improvement']
    },
    {
      id: 4,
      name: 'Mike Johnson',
      role: 'Engineer',
      department: 'Maintenance',
      email: 'mike.johnson@company.com',
      phone: '+1 (555) 456-7890',
      location: 'Station C - Maintenance Hub',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      joinDate: '2022-01-15',
      certifications: ['Maintenance Specialist', 'Thermography Level I', 'Equipment Repair'],
      stats: {
        inspectionsCompleted: 98,
        avgResponseTime: '2.8 hours',
        accuracy: '92.5%'
      },
      specializations: ['Equipment Maintenance', 'Repair Operations', 'Technical Support']
    },
    {
      id: 5,
      name: 'Lisa Chen',
      role: 'Engineer',
      department: 'Research & Development',
      email: 'lisa.chen@company.com',
      phone: '+1 (555) 567-8901',
      location: 'Station A - R&D Lab',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      joinDate: '2022-08-01',
      certifications: ['Advanced Thermography', 'AI/ML Certification', 'Research Methods'],
      stats: {
        inspectionsCompleted: 65,
        avgResponseTime: '1.9 hours',
        accuracy: '95.1%'
      },
      specializations: ['AI Development', 'Algorithm Design', 'Technology Innovation']
    },
    {
      id: 6,
      name: 'Robert Martinez',
      role: 'Engineer',
      department: 'Safety & Compliance',
      email: 'robert.martinez@company.com',
      phone: '+1 (555) 678-9012',
      location: 'Station B - Safety Office',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      joinDate: '2023-02-20',
      certifications: ['Safety Engineering', 'OSHA 30', 'Risk Management'],
      stats: {
        inspectionsCompleted: 47,
        avgResponseTime: '2.3 hours',
        accuracy: '93.7%'
      },
      specializations: ['Safety Protocols', 'Compliance Auditing', 'Risk Mitigation']
    }
  ];

  const getRoleBadge = (role: string) => {
    return role === 'Admin' ? (
      <Badge className="bg-primary text-primary-foreground">Admin</Badge>
    ) : (
      <Badge variant="secondary">Engineer</Badge>
    );
  };

  const getPerformanceColor = (accuracy: string) => {
    const num = parseFloat(accuracy);
    if (num >= 95) return 'text-success';
    if (num >= 90) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground">
            Meet our thermal inspection specialists and their expertise
          </p>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Team Members</p>
                <p className="text-2xl font-bold text-foreground">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Team Accuracy</p>
                <p className="text-2xl font-bold text-foreground">95.1%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inspections</p>
                <p className="text-2xl font-bold text-foreground">680</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="shadow-elegant hover:shadow-thermal transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleBadge(member.role)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{member.department}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{member.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{member.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{member.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Joined {member.joinDate}</span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Performance</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted rounded">
                    <div className="font-medium">
                      {member.role === 'Admin' ? member.stats.reportsReviewed : member.stats.inspectionsCompleted}
                    </div>
                    <div className="text-muted-foreground">
                      {member.role === 'Admin' ? 'Reviews' : 'Inspections'}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded">
                    <div className={`font-medium ${getPerformanceColor(member.stats.accuracy)}`}>
                      {member.stats.accuracy}
                    </div>
                    <div className="text-muted-foreground">Accuracy</div>
                  </div>
                </div>
                <div className="text-center p-2 bg-muted rounded text-xs">
                  <div className="font-medium">
                    {member.role === 'Admin' ? member.stats.avgReviewTime : member.stats.avgResponseTime}
                  </div>
                  <div className="text-muted-foreground">
                    Avg {member.role === 'Admin' ? 'Review' : 'Response'} Time
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Certifications</h4>
                <div className="flex flex-wrap gap-1">
                  {member.certifications.slice(0, 2).map((cert, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                  {member.certifications.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{member.certifications.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Specializations</h4>
                <div className="text-xs text-muted-foreground">
                  {member.specializations.join(' • ')}
                </div>
              </div>

              {/* Contact Button */}
              <Button variant="outline" className="w-full" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Department Breakdown */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { dept: 'Field Operations', count: 2, color: 'bg-primary' },
              { dept: 'Engineering Management', count: 1, color: 'bg-accent' },
              { dept: 'Quality Assurance', count: 1, color: 'bg-success' },
              { dept: 'Maintenance', count: 1, color: 'bg-warning' },
              { dept: 'Research & Development', count: 1, color: 'bg-destructive' },
              { dept: 'Safety & Compliance', count: 1, color: 'bg-muted' }
            ].map((dept, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded ${dept.color}`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{dept.dept}</div>
                  <div className="text-xs text-muted-foreground">{dept.count} member{dept.count > 1 ? 's' : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}