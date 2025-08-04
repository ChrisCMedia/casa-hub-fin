import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Target, 
  Users, 
  Calendar as CalendarIcon, 
  Plus,
  MapPin,
  Euro,
  TrendingUp,
  Phone,
  Mail,
  Star,
  Eye
} from "lucide-react";
import { mockProperties, mockCampaigns, mockLeads } from "@/data/mockData";

const PropertyCard = ({ property }: { property: any }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-success text-success-foreground',
      'under-contract': 'bg-warning text-warning-foreground',
      sold: 'bg-muted text-muted-foreground',
      rented: 'bg-primary text-primary-foreground'
    };
    return colors[status as keyof typeof colors] || colors.available;
  };

  const getStatusText = (status: string) => {
    const texts = {
      available: 'Verfügbar',
      'under-contract': 'Unter Vertrag',
      sold: 'Verkauft',
      rented: 'Vermietet'
    };
    return texts[status as keyof typeof texts] || 'Unbekannt';
  };

  const getTypeText = (type: string) => {
    const texts = {
      apartment: 'Wohnung',
      house: 'Haus',
      commercial: 'Gewerbe',
      land: 'Grundstück'
    };
    return texts[type as keyof typeof texts] || type;
  };

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{property.title}</CardTitle>
          <Badge className={`text-xs ${getStatusColor(property.status)}`}>
            {getStatusText(property.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img 
            src={property.images[0]} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {property.address}
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Typ</div>
              <div className="font-medium">{getTypeText(property.type)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Fläche</div>
              <div className="font-medium">{property.area}m²</div>
            </div>
            <div>
              <div className="text-muted-foreground">Zimmer</div>
              <div className="font-medium">{property.rooms}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-muted-foreground text-xs">Preis</div>
              <div className="text-lg font-bold text-primary">
                {property.price.toLocaleString('de-DE')} €
              </div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-xs">Gelistet</div>
              <div className="text-sm">{property.listingDate.toLocaleDateString('de-DE')}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            Details
          </Button>
          <Button size="sm" className="flex-1">
            Kampagne
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CampaignCard = ({ campaign }: { campaign: any }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      planning: 'bg-muted text-muted-foreground',
      active: 'bg-success text-success-foreground',
      paused: 'bg-warning text-warning-foreground',
      completed: 'bg-primary text-primary-foreground',
      cancelled: 'bg-destructive text-destructive-foreground'
    };
    return colors[status as keyof typeof colors] || colors.planning;
  };

  const getStatusText = (status: string) => {
    const texts = {
      planning: 'Planung',
      active: 'Aktiv',
      paused: 'Pausiert',
      completed: 'Abgeschlossen',
      cancelled: 'Abgebrochen'
    };
    return texts[status as keyof typeof texts] || 'Unbekannt';
  };

  const budgetUsage = (campaign.spent / campaign.budget) * 100;

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">{campaign.name}</CardTitle>
          <Badge className={`text-xs ${getStatusColor(campaign.status)}`}>
            {getStatusText(campaign.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget verwendet</span>
            <span className="font-medium">{budgetUsage.toFixed(1)}%</span>
          </div>
          <Progress value={budgetUsage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{campaign.spent.toLocaleString('de-DE')} €</span>
            <span>{campaign.budget.toLocaleString('de-DE')} €</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Zielgruppe: </span>
            <span className="font-medium">{campaign.targetAudience}</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {campaign.platforms.map((platform: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">KPIs</h4>
          {campaign.kpis.map((kpi: any, index: number) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{kpi.metric}</span>
              <span className="font-medium">
                {kpi.current} / {kpi.target} {kpi.unit}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            Bearbeiten
          </Button>
          <Button size="sm" className="flex-1">
            Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const LeadCard = ({ lead }: { lead: any }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-primary text-primary-foreground',
      contacted: 'bg-warning text-warning-foreground',
      qualified: 'bg-success text-success-foreground',
      'viewing-scheduled': 'bg-accent text-accent-foreground',
      'offer-made': 'bg-muted text-muted-foreground',
      closed: 'bg-success text-success-foreground',
      lost: 'bg-destructive text-destructive-foreground'
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  const getStatusText = (status: string) => {
    const texts = {
      new: 'Neu',
      contacted: 'Kontaktiert',
      qualified: 'Qualifiziert',
      'viewing-scheduled': 'Besichtigung geplant',
      'offer-made': 'Angebot gemacht',
      closed: 'Abgeschlossen',
      lost: 'Verloren'
    };
    return texts[status as keyof typeof texts] || 'Unbekannt';
  };

  const getSourceText = (source: string) => {
    const texts = {
      website: 'Website',
      'social-media': 'Social Media',
      referral: 'Empfehlung',
      'cold-call': 'Kaltakquise',
      event: 'Event'
    };
    return texts[source as keyof typeof texts] || source;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <Card className="hover:shadow-medium transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {lead.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{lead.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {getSourceText(lead.source)}
              </p>
            </div>
          </div>
          <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
            {getStatusText(lead.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            {lead.email}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {lead.phone}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Lead Score</span>
            <span className={`text-sm font-bold ${getScoreColor(lead.score)}`}>
              {lead.score}/100
            </span>
          </div>
          <Progress value={lead.score} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Budget: </span>
            <span className="font-medium">
              {lead.budget.min.toLocaleString('de-DE')} - {lead.budget.max.toLocaleString('de-DE')} €
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Letzter Kontakt: </span>
            <span className="font-medium">
              {lead.lastContact.toLocaleDateString('de-DE')}
            </span>
          </div>
        </div>

        {lead.notes && (
          <div className="text-sm text-muted-foreground">
            {lead.notes}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="h-3 w-3 mr-1" />
            Anrufen
          </Button>
          <Button size="sm" className="flex-1">
            <CalendarIcon className="h-3 w-3 mr-1" />
            Termin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projekt- & Kampagnenmanagement</h1>
            <p className="text-muted-foreground">
              Immobilien, Marketing-Kampagnen, Lead-Management und Terminplanung
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Neues Projekt
          </Button>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Immobilien
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Kampagnen
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Leads & CRM
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Terminplanung
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Terminübersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Kalender-Integration</h3>
                  <p>Hier wird die Terminplanung mit Google/Outlook Kalender integriert.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}