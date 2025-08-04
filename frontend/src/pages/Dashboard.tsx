import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Target,
  Users,
  BarChart3,
  ArrowRight,
  Bell
} from "lucide-react";

const WelcomeHeader = () => {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Guten Morgen' : currentHour < 18 ? 'Guten Tag' : 'Guten Abend';
  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="mb-8">
      <div className="bg-gradient-hero rounded-2xl p-8 text-white shadow-strong">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {greeting}, Sarah! 👋
            </h1>
            <p className="text-white/90 text-lg">
              {today}
            </p>
            <p className="text-white/80 mt-2">
              Heute stehen 3 wichtige Deadlines an und 5 neue Leads warten auf Bearbeitung.
            </p>
          </div>
          <div className="text-right">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">94%</div>
              <div className="text-sm text-white/80">Monatsziel</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const notifications = [
    { id: 1, text: "LinkedIn-Post wartet auf Freigabe", urgent: true },
    { id: 2, text: "Neue Nachricht von Michael Schmidt", urgent: false },
    { id: 3, text: "Besichtigung in 2 Stunden", urgent: true }
  ];

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Benachrichtigungen
          </div>
          <Badge variant="destructive" className="text-xs">
            {notifications.filter(n => n.urgent).length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 rounded-lg flex items-center justify-between ${
                notification.urgent ? 'bg-destructive/10 border border-destructive/20' : 'bg-muted/50'
              }`}
            >
              <span className={`text-sm ${notification.urgent ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                {notification.text}
              </span>
              <Button size="sm" variant={notification.urgent ? "destructive" : "ghost"}>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4" asChild>
          <a href="/notifications">Alle anzeigen</a>
        </Button>
      </CardContent>
    </Card>
  );
};

const PerformanceOverview = () => {
  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Performance Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-2xl font-bold text-success">87%</div>
            <div className="text-xs text-muted-foreground">Kampagnen Performance</div>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">12.5%</div>
            <div className="text-xs text-muted-foreground">Lead Conversion</div>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-lg">
            <div className="text-2xl font-bold text-accent">2.3k</div>
            <div className="text-xs text-muted-foreground">LinkedIn Follower</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="text-2xl font-bold text-warning">€23.7k</div>
            <div className="text-xs text-muted-foreground">Marketing Budget</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <WelcomeHeader />
        
        {/* Key Metrics */}
        <DashboardStats />
        
        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <UpcomingDeadlines />
            <NotificationCenter />
            <PerformanceOverview />
          </div>
        </div>
      </div>
    </div>
  );
}