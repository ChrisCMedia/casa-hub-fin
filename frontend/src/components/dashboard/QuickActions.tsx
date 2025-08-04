import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Target,
  Lightbulb,
  Users,
  BarChart3
} from "lucide-react";

const actions = [
  {
    title: "Neuen LinkedIn-Post erstellen",
    description: "Content für Social Media planen",
    icon: FileText,
    color: "primary" as const,
    href: "/linkedin/editor"
  },
  {
    title: "ToDo hinzufügen",
    description: "Aufgabe an Marketing-Partner delegieren",
    icon: Plus,
    color: "success" as const,
    href: "/communication/todos"
  },
  {
    title: "Kampagne starten",
    description: "Neue Marketing-Kampagne erstellen",
    icon: Target,
    color: "accent" as const,
    href: "/projects/campaigns"
  },
  {
    title: "Besichtigung planen",
    description: "Termin mit Lead koordinieren",
    icon: Calendar,
    color: "warning" as const,
    href: "/projects/calendar"
  },
  {
    title: "KI-Impulse prüfen",
    description: "Neue Marketing-Ideen entdecken",
    icon: Lightbulb,
    color: "primary" as const,
    href: "/communication/ai-insights",
    badge: "3 Neu"
  },
  {
    title: "Partner kontaktieren",
    description: "Mit Marketing-Experten sprechen",
    icon: Users,
    color: "secondary" as const,
    href: "/communication/partners"
  }
];

export function QuickActions() {
  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: "bg-primary hover:bg-primary-hover text-primary-foreground",
      success: "bg-success hover:bg-success/90 text-success-foreground", 
      accent: "bg-accent hover:bg-accent-muted text-accent-foreground",
      warning: "bg-warning hover:bg-warning/90 text-warning-foreground",
      secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  return (
    <Card className="bg-gradient-card shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Schnellaktionen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto p-4 justify-start hover:shadow-soft transition-all group`}
              asChild
            >
              <a href={action.href}>
                <div className="flex items-start gap-3 w-full">
                  <div className={`p-2 rounded-lg ${getColorClasses(action.color)} transition-colors`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}