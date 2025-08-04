import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  User
} from "lucide-react";

const deadlines = [
  {
    id: '1',
    title: 'LinkedIn-Kampagne Villa Bogenhausen finalisieren',
    dueDate: new Date('2024-08-05T17:00:00'),
    priority: 'urgent' as const,
    assignee: 'Michael Schmidt',
    progress: 85,
    category: 'Marketing',
    estimatedTime: '2h'
  },
  {
    id: '2',
    title: 'Google Ads Budget Q4 abstimmen',
    dueDate: new Date('2024-08-08T12:00:00'),
    priority: 'high' as const,
    assignee: 'Lisa Müller',
    progress: 30,
    category: 'Planung',
    estimatedTime: '4h'
  },
  {
    id: '3',
    title: 'Marktanalyse Q3 veröffentlichen',
    dueDate: new Date('2024-08-06T14:00:00'),
    priority: 'medium' as const,
    assignee: 'Sarah Weber',
    progress: 70,
    category: 'Content',
    estimatedTime: '3h'
  },
  {
    id: '4',
    title: 'Villa Besichtigung vorbereiten',
    dueDate: new Date('2024-08-05T10:00:00'),
    priority: 'high' as const,
    assignee: 'Sarah Weber',
    progress: 90,
    category: 'Termin',
    estimatedTime: '1h'
  },
  {
    id: '5',
    title: 'Social Media Posts für nächste Woche planen',
    dueDate: new Date('2024-08-09T16:00:00'),
    priority: 'medium' as const,
    assignee: 'Lisa Müller',
    progress: 15,
    category: 'Content',
    estimatedTime: '6h'
  }
];

const getPriorityColor = (priority: string) => {
  const colors = {
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    high: 'bg-warning/10 text-warning border-warning/20',
    medium: 'bg-primary/10 text-primary border-primary/20',
    low: 'bg-success/10 text-success border-success/20'
  };
  return colors[priority as keyof typeof colors] || colors.medium;
};

const getPriorityText = (priority: string) => {
  const texts = {
    urgent: 'Dringend',
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig'
  };
  return texts[priority as keyof typeof texts] || 'Mittel';
};

const getTimeUntilDeadline = (dueDate: Date) => {
  const now = new Date();
  const diff = dueDate.getTime() - now.getTime();
  const hours = Math.ceil(diff / (1000 * 60 * 60));
  
  if (hours < 0) return { text: 'Überfällig', color: 'text-destructive' };
  if (hours < 24) return { text: `${hours}h`, color: hours < 6 ? 'text-destructive' : 'text-warning' };
  
  const days = Math.ceil(hours / 24);
  return { text: `${days}d`, color: 'text-muted-foreground' };
};

export function UpcomingDeadlines() {
  const sortedDeadlines = deadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Anstehende Deadlines
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {deadlines.filter(d => d.dueDate > new Date()).length} offen
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedDeadlines.slice(0, 5).map((deadline) => {
            const timeLeft = getTimeUntilDeadline(deadline.dueDate);
            const isOverdue = deadline.dueDate < new Date();
            const isUrgent = timeLeft.text.includes('h') && !isOverdue;

            return (
              <div 
                key={deadline.id} 
                className={`p-4 rounded-lg border transition-colors hover:shadow-soft ${
                  isOverdue ? 'bg-destructive/5 border-destructive/20' : 
                  isUrgent ? 'bg-warning/5 border-warning/20' : 
                  'bg-muted/20 border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {deadline.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(deadline.priority)}`}
                      >
                        {getPriorityText(deadline.priority)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {deadline.assignee}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {deadline.dueDate.toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {deadline.estimatedTime}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Fortschritt: {deadline.progress}%
                        </span>
                        <span className={`text-xs font-medium ${timeLeft.color}`}>
                          {timeLeft.text}
                        </span>
                      </div>
                      <Progress value={deadline.progress} className="h-2" />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isOverdue ? "destructive" : isUrgent ? "default" : "outline"}
                    className="flex-shrink-0"
                    asChild
                  >
                    <a href={`/communication/todos/${deadline.id}`}>
                      {deadline.progress === 100 ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : isOverdue ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <ArrowRight className="h-3 w-3" />
                      )}
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button variant="ghost" className="w-full" asChild>
            <a href="/communication/todos" className="flex items-center justify-center gap-2">
              Alle Deadlines anzeigen
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}