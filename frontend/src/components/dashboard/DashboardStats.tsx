import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Target,
  Calendar,
  BarChart3,
  Loader2
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useApi";

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  progress, 
  trend,
  color = "primary" 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  progress?: number;
  trend?: number;
  color?: "primary" | "success" | "warning" | "destructive";
}) => {
  const colorClasses = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20", 
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20"
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-card shadow-soft hover:shadow-medium transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% abgeschlossen</p>
          </div>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2 gap-1">
            <TrendingUp className={`h-3 w-3 ${trend >= 0 ? 'text-success' : 'text-destructive'}`} />
            <span className={`text-xs ${trend >= 0 ? 'text-success' : 'text-destructive'}`}>
              {trend >= 0 ? '+' : ''}{trend}% vs. letzten Monat
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function DashboardStats() {
  const { data: dashboardStats, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="w-8 h-8 bg-muted rounded-lg"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-3 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-2">Fehler beim Laden der Dashboard-Statistiken</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Offene ToDos"
          value={0}
          subtitle="Keine Daten verfügbar"
          icon={CheckCircle2}
          color="primary"
        />
        <StatCard
          title="Aktive Kampagnen"
          value={0}
          subtitle="Keine Daten verfügbar"
          icon={Target}
          color="primary"
        />
        <StatCard
          title="Neue Leads"
          value={0}
          subtitle="Keine Daten verfügbar"
          icon={Users}
          color="primary"
        />
        <StatCard
          title="LinkedIn Posts"
          value={0}
          subtitle="Keine Daten verfügbar"
          icon={BarChart3}
          color="primary"
        />
      </div>
    );
  }

  const todoProgress = dashboardStats.todosOverview ? 
    (dashboardStats.todosOverview.completed / dashboardStats.todosOverview.total) * 100 : 0;
  const budgetProgress = dashboardStats.campaignsOverview && dashboardStats.campaignsOverview.totalBudget > 0 ? 
    (dashboardStats.campaignsOverview.totalSpent / dashboardStats.campaignsOverview.totalBudget) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Todo Overview */}
      <StatCard
        title="Offene ToDos"
        value={dashboardStats.todosOverview ? 
          dashboardStats.todosOverview.pending + dashboardStats.todosOverview.inProgress : 0}
        subtitle={dashboardStats.todosOverview ? 
          `${dashboardStats.todosOverview.overdue || 0} überfällig` : "Keine Daten"}
        icon={CheckCircle2}
        progress={todoProgress}
        trend={-12}
        color={dashboardStats.todosOverview?.overdue > 0 ? "warning" : "success"}
      />

      {/* Campaign Performance */}
      <StatCard
        title="Aktive Kampagnen"
        value={dashboardStats.campaignsOverview?.active || 0}
        subtitle={`${budgetProgress.toFixed(1)}% Budget verwendet`}
        icon={Target}
        progress={dashboardStats.campaignsOverview?.avgPerformance || 0}
        trend={15}
        color="primary"
      />

      {/* Leads Overview */}
      <StatCard
        title="Neue Leads"
        value={dashboardStats.leadsOverview?.new || 0}
        subtitle={`${dashboardStats.leadsOverview?.conversion || 0}% Conversion Rate`}
        icon={Users}
        trend={8}
        color="success"
      />

      {/* Social Media */}
      <StatCard
        title="LinkedIn Posts"
        value={dashboardStats.socialMediaOverview?.scheduledPosts || 0}
        subtitle={`${dashboardStats.socialMediaOverview?.pendingApproval || 0} warten auf Freigabe`}
        icon={BarChart3}
        trend={dashboardStats.socialMediaOverview?.followerGrowth || 0}
        color="primary"
      />
    </div>
  );
}