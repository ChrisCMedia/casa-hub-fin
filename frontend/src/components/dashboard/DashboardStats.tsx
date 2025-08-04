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
  BarChart3
} from "lucide-react";
import { mockDashboardStats } from "@/data/mockData";

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
  const stats = mockDashboardStats;
  const todoProgress = (stats.todosOverview.completed / stats.todosOverview.total) * 100;
  const budgetProgress = (stats.campaignsOverview.totalSpent / stats.campaignsOverview.totalBudget) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Todo Overview */}
      <StatCard
        title="Offene ToDos"
        value={stats.todosOverview.pending + stats.todosOverview.inProgress}
        subtitle={`${stats.todosOverview.overdue} überfällig`}
        icon={CheckCircle2}
        progress={todoProgress}
        trend={-12}
        color={stats.todosOverview.overdue > 0 ? "warning" : "success"}
      />

      {/* Campaign Performance */}
      <StatCard
        title="Aktive Kampagnen"
        value={stats.campaignsOverview.active}
        subtitle={`${budgetProgress.toFixed(1)}% Budget verwendet`}
        icon={Target}
        progress={stats.campaignsOverview.avgPerformance}
        trend={15}
        color="primary"
      />

      {/* Leads Overview */}
      <StatCard
        title="Neue Leads"
        value={stats.leadsOverview.new}
        subtitle={`${stats.leadsOverview.conversion}% Conversion Rate`}
        icon={Users}
        trend={8}
        color="success"
      />

      {/* Social Media */}
      <StatCard
        title="LinkedIn Engagement"
        value={`${(stats.socialMediaOverview.totalEngagement / 1000).toFixed(1)}k`}
        subtitle={`+${stats.socialMediaOverview.followerGrowth}% Follower Growth`}
        icon={BarChart3}
        trend={stats.socialMediaOverview.followerGrowth}
        color="primary"
      />
    </div>
  );
}