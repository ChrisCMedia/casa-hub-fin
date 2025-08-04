import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Plus,
  Lightbulb,
  Calendar,
  FileText,
  User
} from "lucide-react";
import { mockTodos, mockMarketingPartners, mockAIImpulse } from "@/data/mockData";

const TodoCard = ({ todo }: { todo: any }) => {
  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'bg-destructive text-destructive-foreground',
      high: 'bg-warning text-warning-foreground',
      medium: 'bg-primary text-primary-foreground',
      low: 'bg-success text-success-foreground'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-muted-foreground',
      'in-progress': 'text-primary',
      completed: 'text-success',
      cancelled: 'text-destructive'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{todo.title}</CardTitle>
          <Badge className={`text-xs ${getPriorityColor(todo.priority)}`}>
            {todo.priority.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{todo.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {mockMarketingPartners.find(p => p.id === todo.assignedTo)?.name || 'Unbekannt'}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {todo.dueDate.toLocaleDateString('de-DE')}
          </div>
          <div className={`flex items-center gap-1 ${getStatusColor(todo.status)}`}>
            {todo.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {todo.status.replace('-', ' ')}
          </div>
        </div>

        {todo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {todo.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {todo.comments.length} Kommentare
          </span>
          <Button size="sm" variant="outline">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PartnerCard = ({ partner }: { partner: any }) => {
  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`/api/placeholder/40/40`} />
            <AvatarFallback>
              {partner.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{partner.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{partner.company}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            ⭐ {partner.collaboration.rating}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Offene ToDos</span>
            <span className="font-medium">{partner.dashboard.todoCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Aktive Deadlines</span>
            <span className="font-medium">{partner.dashboard.activeDeadlines}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{partner.dashboard.completionRate}%</span>
            </div>
            <Progress value={partner.dashboard.completionRate} className="h-2" />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Expertise</h4>
          <div className="flex flex-wrap gap-1">
            {partner.expertise.map((skill: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <MessageSquare className="h-3 w-3 mr-1" />
            Chat
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const AIImpulsCard = ({ impuls }: { impuls: any }) => {
  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'bg-success text-success-foreground',
      medium: 'bg-warning text-warning-foreground',
      low: 'bg-muted text-muted-foreground'
    };
    return colors[impact as keyof typeof colors] || colors.medium;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'content-idea': FileText,
      'promotion': AlertTriangle,
      'event': Calendar,
      'targeting': Users,
      'trend-alert': Lightbulb
    };
    return icons[type as keyof typeof icons] || Lightbulb;
  };

  const TypeIcon = getTypeIcon(impuls.type);

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TypeIcon className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base leading-tight">{impuls.title}</CardTitle>
          </div>
          <Badge className={`text-xs ${getImpactColor(impuls.estimatedImpact)}`}>
            {impuls.estimatedImpact.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{impuls.description}</p>
        
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            <strong>Zielgruppe:</strong> {impuls.targetAudience}
          </div>
          <div className="flex flex-wrap gap-1">
            {impuls.platforms.map((platform: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {impuls.generatedAt.toLocaleDateString('de-DE')}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              Verwerfen
            </Button>
            <Button size="sm">
              Umsetzen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CommunicationPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kommunikationsmanagement</h1>
            <p className="text-muted-foreground">
              Koordination mit Marketing-Partnern, ToDo-Management und KI-Impulse
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Neues ToDo
          </Button>
        </div>

        <Tabs defaultValue="todos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              ToDo-Listen
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Marketing-Partner
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              KI-Impulse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockTodos.map((todo) => (
                <TodoCard key={todo.id} todo={todo} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockMarketingPartners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockAIImpulse.map((impuls) => (
                <AIImpulsCard key={impuls.id} impuls={impuls} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}