import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  User,
  Loader2
} from "lucide-react";
import { useTodos } from "@/hooks/useApi";
import { apiService } from "@/lib/api";
import { mockMarketingPartners, mockAIImpulse } from "@/data/mockData";
import { useState } from "react";

const TodoCard = ({ todo, onUpdate }: { todo: any, onUpdate: () => void }) => {
  const [todoDetailsOpen, setTodoDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const getPriorityColor = (priority: string) => {
    const colors = {
      URGENT: 'bg-destructive text-destructive-foreground',
      HIGH: 'bg-warning text-warning-foreground',
      MEDIUM: 'bg-primary text-primary-foreground',
      LOW: 'bg-success text-success-foreground'
    };
    return colors[priority as keyof typeof colors] || colors.MEDIUM;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'text-muted-foreground',
      IN_PROGRESS: 'text-primary',
      COMPLETED: 'text-success',
      CANCELLED: 'text-destructive'
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true);
    try {
      await apiService.updateTodo(todo.id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Failed to update todo:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{todo.title}</CardTitle>
          <Badge className={`text-xs ${getPriorityColor(todo.priority)}`}>
            {todo.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{todo.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {todo.assignee?.name || 'Unbekannt'}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('de-DE') : 'Kein Datum'}
          </div>
          <div className={`flex items-center gap-1 ${getStatusColor(todo.status)}`}>
            {todo.status === 'COMPLETED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
            {todo.status.replace('_', ' ')}
          </div>
        </div>

        {todo.tags && todo.tags.length > 0 && (
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
            {todo.comments?.length || 0} Kommentare
          </span>
          <div className="flex gap-2">
            {todo.status !== 'COMPLETED' && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleStatusUpdate('COMPLETED')}
                disabled={updating}
              >
                {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              </Button>
            )}
            <Dialog open={todoDetailsOpen} onOpenChange={setTodoDetailsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{todo.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Beschreibung</h4>
                    <p className="text-sm text-muted-foreground">{todo.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Priorität</h4>
                      <Badge className={getPriorityColor(todo.priority)}>{todo.priority}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Status</h4>
                      <Badge variant="outline">{todo.status.replace('_', ' ')}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Zugewiesen an</h4>
                      <p className="text-sm">{todo.assignee?.name || 'Unbekannt'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Fälligkeitsdatum</h4>
                      <p className="text-sm">{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString('de-DE') : 'Kein Datum'}</p>
                    </div>
                  </div>
                  {todo.tags && todo.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {todo.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
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

const CreateTodoDialog = ({ onTodoCreated }: { onTodoCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: '',
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const todoData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const response = await apiService.createTodo(todoData);
      if (response.success) {
        setOpen(false);
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          dueDate: '',
          tags: ''
        });
        onTodoCreated();
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neues ToDo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Neues ToDo erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Titel</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Beschreibung</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Priorität</label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Niedrig</SelectItem>
                <SelectItem value="MEDIUM">Mittel</SelectItem>
                <SelectItem value="HIGH">Hoch</SelectItem>
                <SelectItem value="URGENT">Dringend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Fälligkeitsdatum</label>
            <Input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Tags (kommagetrennt)</label>
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="LinkedIn, Marketing, Design"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function CommunicationPage() {
  const { data: todos, loading, error, refetch } = useTodos();

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
          <CreateTodoDialog onTodoCreated={refetch} />
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Lade ToDos...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-4">Fehler beim Laden der ToDos: {error}</p>
                <Button onClick={refetch}>Erneut versuchen</Button>
              </div>
            ) : todos && todos.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todos.map((todo) => (
                  <TodoCard key={todo.id} todo={todo} onUpdate={refetch} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Keine ToDos vorhanden</p>
                <CreateTodoDialog onTodoCreated={refetch} />
              </div>
            )}
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