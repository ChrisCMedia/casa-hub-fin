import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Target,
  TrendingUp
} from "lucide-react";

const activities = [
  {
    id: '1',
    type: 'todo-completed',
    title: 'Instagram Stories für Green Living erstellt',
    user: 'Michael Schmidt',
    userAvatar: '/api/placeholder/32/32',
    time: '2 Stunden',
    status: 'completed',
    icon: CheckCircle2
  },
  {
    id: '2', 
    type: 'lead-new',
    title: 'Neuer Lead: Andreas Bauer',
    user: 'System',
    userAvatar: null,
    time: '3 Stunden',
    status: 'new',
    icon: TrendingUp,
    details: 'Interesse an Villa Bogenhausen'
  },
  {
    id: '3',
    type: 'campaign-update',
    title: 'Villa Bogenhausen Kampagne Update',
    user: 'Lisa Müller',
    userAvatar: '/api/placeholder/32/32',
    time: '5 Stunden',
    status: 'info',
    icon: Target,
    details: 'Budget zu 58% ausgeschöpft'
  },
  {
    id: '4',
    type: 'deadline-approaching',
    title: 'LinkedIn-Post Freigabe erforderlich',
    user: 'Sarah Weber',
    userAvatar: '/api/placeholder/32/32',
    time: '6 Stunden',
    status: 'warning',
    icon: AlertTriangle,
    details: 'Marktupdate Q3 2024'
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Besichtigung geplant',
    user: 'Sarah Weber',
    userAvatar: '/api/placeholder/32/32',
    time: '1 Tag',
    status: 'scheduled',
    icon: Calendar,
    details: 'Villa Bogenhausen - Andreas Bauer'
  },
  {
    id: '6',
    type: 'message',
    title: 'Neue Nachricht von Marketing-Partner',
    user: 'Michael Schmidt',
    userAvatar: '/api/placeholder/32/32',
    time: '1 Tag',
    status: 'unread',
    icon: MessageSquare,
    details: 'Bezüglich Google Ads Budget Q4'
  }
];

const getStatusColor = (status: string) => {
  const colors = {
    completed: 'bg-success/10 text-success border-success/20',
    new: 'bg-primary/10 text-primary border-primary/20',
    info: 'bg-accent/10 text-accent border-accent/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    scheduled: 'bg-secondary text-secondary-foreground border-secondary',
    unread: 'bg-destructive/10 text-destructive border-destructive/20'
  };
  return colors[status as keyof typeof colors] || colors.info;
};

const getStatusText = (status: string) => {
  const texts = {
    completed: 'Erledigt',
    new: 'Neu',
    info: 'Info',
    warning: 'Warnung',
    scheduled: 'Geplant', 
    unread: 'Ungelesen'
  };
  return texts[status as keyof typeof texts] || 'Info';
};

export function RecentActivity() {
  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Letzte Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium text-sm text-foreground truncate">
                    {activity.title}
                  </h4>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {getStatusText(activity.status)}
                  </Badge>
                </div>
                
                {activity.details && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.details}
                  </p>
                )}
                
                <div className="flex items-center gap-2 mt-2">
                  {activity.userAvatar ? (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={activity.userAvatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-5 w-5 bg-muted rounded-full flex items-center justify-center">
                      <div className="h-2 w-2 bg-muted-foreground rounded-full" />
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {activity.user} · vor {activity.time}
                  </span>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}