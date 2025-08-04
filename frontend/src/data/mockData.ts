// Comprehensive mock data for the Real Estate Dashboard
import { 
  Todo, 
  LinkedInPost, 
  Property, 
  Campaign, 
  Lead, 
  MarketingPartner, 
  AIImpuls, 
  Notification,
  DashboardStats,
  User
} from '@/types/dashboard';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Weber',
    email: 'sarah@immobilien-weber.de',
    role: 'admin',
    avatar: '/api/placeholder/40/40',
    lastActive: new Date('2024-08-04T10:30:00')
  },
  {
    id: '2',
    name: 'Michael Schmidt',
    email: 'michael@marketing-pro.de',
    role: 'editor',
    avatar: '/api/placeholder/40/40',
    lastActive: new Date('2024-08-04T09:15:00')
  },
  {
    id: '3',
    name: 'Lisa Müller',
    email: 'lisa@socialexpert.de',
    role: 'editor',
    avatar: '/api/placeholder/40/40',
    lastActive: new Date('2024-08-04T08:45:00')
  }
];

export const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'LinkedIn-Kampagne für Villa in Bogenhausen finalisieren',
    description: 'Finale Abstimmung der Bildauswahl und Freigabe der Texte für die Premium-Villa Kampagne',
    priority: 'urgent',
    status: 'in-progress',
    assignedTo: '2',
    createdBy: '1',
    dueDate: new Date('2024-08-05T17:00:00'),
    tags: ['LinkedIn', 'Villa', 'Premium'],
    comments: [
      {
        id: '1',
        content: 'Bilder sind bereit, brauchen nur noch finale Texte',
        author: '2',
        createdAt: new Date('2024-08-04T09:30:00'),
        mentions: ['1']
      }
    ],
    attachments: [
      {
        id: '1',
        filename: 'villa-bogenhausen-images.zip',
        url: '/attachments/villa-images.zip',
        type: 'document',
        size: 15728640,
        uploadedBy: '2',
        uploadedAt: new Date('2024-08-04T08:00:00')
      }
    ],
    createdAt: new Date('2024-08-03T14:20:00'),
    updatedAt: new Date('2024-08-04T09:30:00')
  },
  {
    id: '2',
    title: 'Google Ads Budget für Q4 abstimmen',
    description: 'Planung der Werbeausgaben für das vierte Quartal und Zielgruppen-Optimierung',
    priority: 'high',
    status: 'pending',
    assignedTo: '3',
    createdBy: '1',
    dueDate: new Date('2024-08-08T12:00:00'),
    tags: ['Google Ads', 'Budget', 'Q4'],
    comments: [],
    attachments: [],
    createdAt: new Date('2024-08-04T11:00:00'),
    updatedAt: new Date('2024-08-04T11:00:00')
  },
  {
    id: '3',
    title: 'Instagram Stories für neue Wohnanlage erstellen',
    description: 'Content-Serie für die neue Wohnanlage "Green Living" mit Virtual Tour Integration',
    priority: 'medium',
    status: 'completed',
    assignedTo: '2',
    createdBy: '1',
    dueDate: new Date('2024-08-02T16:00:00'),
    tags: ['Instagram', 'Stories', 'Wohnanlage'],
    comments: [],
    attachments: [],
    createdAt: new Date('2024-07-30T10:00:00'),
    updatedAt: new Date('2024-08-02T15:45:00')
  }
];

export const mockLinkedInPosts: LinkedInPost[] = [
  {
    id: '1',
    content: '🏡 EXKLUSIV: Villa in Bogenhausen mit Blick auf den Englischen Garten\n\nModerne Architektur trifft auf klassische Eleganz. Diese außergewöhnliche Villa bietet:\n\n✨ 5 Schlafzimmer, 4 Bäder\n✨ Großzügiger Garten mit Pool\n✨ Doppelgarage und Keller\n✨ Traumhafter Blick ins Grüne\n\nInteresse? Kontaktieren Sie mich für eine private Besichtigung!\n\n#München #Bogenhausen #Villa #Luxusimmobilie #Immobilienmakler',
    mediaAttachments: [
      {
        id: '1',
        filename: 'villa-exterior.jpg',
        url: '/images/villa-exterior.jpg',
        type: 'image',
        size: 2048000,
        uploadedBy: '1',
        uploadedAt: new Date('2024-08-04T10:00:00')
      }
    ],
    hashtags: ['München', 'Bogenhausen', 'Villa', 'Luxusimmobilie', 'Immobilienmakler'],
    scheduledDate: new Date('2024-08-05T09:00:00'),
    status: 'approved',
    createdBy: '1',
    approvedBy: '2',
    campaign: 'Villa Bogenhausen Premium'
  },
  {
    id: '2',
    content: '📈 Marktupdate München Q3 2024\n\nDie wichtigsten Trends im Münchner Immobilienmarkt:\n\n• Preise stabilisieren sich auf hohem Niveau\n• Nachfrage nach Bestandsimmobilien steigt\n• Neubau-Projekte werden selektiver\n• Zinsentwicklung beeinflusst Kaufentscheidungen\n\nDetaillierte Marktanalyse in den Comments 👇\n\n#ImmobilienMarkt #München #Marktanalyse #Investition',
    mediaAttachments: [],
    hashtags: ['ImmobilienMarkt', 'München', 'Marktanalyse', 'Investition'],
    scheduledDate: new Date('2024-08-06T14:00:00'),
    status: 'pending-approval',
    createdBy: '1'
  },
  {
    id: '3',
    content: '🎯 Erfolgreiche Vermittlung in Schwabing!\n\nWieder eine glückliche Familie, die ihr Traumzuhause gefunden hat. Die 4-Zimmer-Wohnung mit Balkon und Altbaucharme war genau das Richtige.\n\nWas macht eine Immobilie zum Traumzuhause? Teilen Sie Ihre Gedanken! 💭\n\n#Schwabing #Erfolg #Traumzuhause #Altbau #Glücklich',
    mediaAttachments: [],
    hashtags: ['Schwabing', 'Erfolg', 'Traumzuhause', 'Altbau', 'Glücklich'],
    status: 'published',
    createdBy: '1',
    publishedAt: new Date('2024-08-03T11:00:00'),
    analytics: {
      views: 2847,
      likes: 89,
      comments: 12,
      shares: 6,
      clickThroughRate: 3.2,
      engagement: 3.8
    }
  }
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Exklusive Villa in Bogenhausen',
    address: 'Prinzregentenstraße 45, 81675 München',
    type: 'house',
    price: 2850000,
    area: 380,
    rooms: 8,
    status: 'available',
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    description: 'Traumhafte Villa mit Blick auf den Englischen Garten',
    features: ['Pool', 'Garten', 'Doppelgarage', 'Keller', 'Balkon'],
    listingDate: new Date('2024-07-15'),
    agent: '1'
  },
  {
    id: '2', 
    title: 'Moderne Penthouse-Wohnung',
    address: 'Maximilianstraße 12, 80539 München',
    type: 'apartment',
    price: 1650000,
    area: 185,
    rooms: 4,
    status: 'under-contract',
    images: ['/api/placeholder/400/300'],
    description: 'Luxuriöses Penthouse in bester Innenstadtlage',
    features: ['Dachterrasse', 'Aufzug', 'Klimaanlage', 'Concierge'],
    listingDate: new Date('2024-06-20'),
    agent: '1'
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Villa Bogenhausen Premium',
    propertyId: '1',
    type: 'social-media',
    status: 'active',
    budget: 15000,
    spent: 8750,
    startDate: new Date('2024-07-20'),
    endDate: new Date('2024-08-31'),
    targetAudience: 'High-Income Families, Age 35-55',
    platforms: ['LinkedIn', 'Facebook', 'Instagram'],
    kpis: [
      { metric: 'Impressions', target: 50000, current: 32100, unit: 'views' },
      { metric: 'Leads', target: 25, current: 18, unit: 'contacts' },
      { metric: 'CTR', target: 2.5, current: 3.1, unit: '%' }
    ],
    createdBy: '1'
  },
  {
    id: '2',
    name: 'Q4 Google Ads München',
    type: 'google-ads',
    status: 'planning',
    budget: 25000,
    spent: 0,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2024-12-31'),
    targetAudience: 'Property Buyers, Munich Area',
    platforms: ['Google Search', 'Google Display'],
    kpis: [
      { metric: 'Conversions', target: 50, current: 0, unit: 'leads' },
      { metric: 'CPC', target: 8.50, current: 0, unit: '€' }
    ],
    createdBy: '1'
  }
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Andreas Bauer',
    email: 'andreas.bauer@email.de',
    phone: '+49 89 12345678',
    status: 'viewing-scheduled',
    source: 'website',
    propertyInterest: ['1'],
    budget: { min: 2000000, max: 3000000 },
    notes: 'Interessiert an Villa, Besichtigung am Freitag geplant',
    lastContact: new Date('2024-08-04T09:00:00'),
    score: 85,
    assignedAgent: '1'
  },
  {
    id: '2',
    name: 'Maria Hoffmann',
    email: 'maria.hoffmann@email.de',
    phone: '+49 89 87654321',
    status: 'qualified',
    source: 'social-media',
    propertyInterest: ['2'],
    budget: { min: 1400000, max: 1800000 },
    notes: 'Sucht Penthouse für Eigennutzung, sehr interessiert',
    lastContact: new Date('2024-08-03T14:30:00'),
    score: 92,
    assignedAgent: '1'
  }
];

export const mockMarketingPartners: MarketingPartner[] = [
  {
    id: '1',
    name: 'Michael Schmidt',
    company: 'Digital Marketing Pro',
    expertise: ['Google Ads', 'SEO', 'Content Marketing'],
    contactInfo: {
      email: 'michael@marketing-pro.de',
      phone: '+49 89 555-0123',
      website: 'www.marketing-pro.de'
    },
    collaboration: {
      activeCampaigns: ['1', '2'],
      completedProjects: 12,
      rating: 4.8,
      preferredChannels: ['Google Ads', 'Facebook']
    },
    dashboard: {
      todoCount: 3,
      activeDeadlines: 2,
      completionRate: 94
    }
  },
  {
    id: '2',
    name: 'Lisa Müller',
    company: 'Social Expert',
    expertise: ['Social Media', 'Content Creation', 'Influencer Marketing'],
    contactInfo: {
      email: 'lisa@socialexpert.de',
      phone: '+49 89 555-0456'
    },
    collaboration: {
      activeCampaigns: ['1'],
      completedProjects: 8,
      rating: 4.9,
      preferredChannels: ['Instagram', 'LinkedIn', 'TikTok']
    },
    dashboard: {
      todoCount: 5,
      activeDeadlines: 1,
      completionRate: 89
    }
  }
];

export const mockAIImpulse: AIImpuls[] = [
  {
    id: '1',
    type: 'content-idea',
    title: 'Virtual Reality Besichtigungen bewerben',
    description: 'Erstelle Content über VR-Technologie für Immobilienbesichtigungen. Zeige, wie Kunden bequem von zuhause aus Immobilien erkunden können.',
    targetAudience: 'Tech-affine Immobilienkäufer, 25-45 Jahre',
    platforms: ['LinkedIn', 'Instagram', 'TikTok'],
    estimatedImpact: 'high',
    category: 'Innovation',
    generatedAt: new Date('2024-08-04T10:15:00'),
    status: 'new',
    relatedProperty: '1'
  },
  {
    id: '2',
    type: 'trend-alert',
    title: 'Steigender Trend: Nachhaltiges Wohnen',
    description: 'Aktuelle Marktdaten zeigen 35% Anstieg bei Suchanfragen nach energieeffizienten Immobilien. Positioniere dich als Experte für grüne Immobilien.',
    targetAudience: 'Umweltbewusste Käufer',
    platforms: ['LinkedIn', 'Blog'],
    estimatedImpact: 'medium',
    category: 'Market Trend',
    generatedAt: new Date('2024-08-04T08:30:00'),
    status: 'reviewing'
  },
  {
    id: '3',
    type: 'promotion',
    title: 'Sommer-Open-House Event',
    description: 'Organisiere ein exklusives Open-House Event für Premium-Immobilien mit Catering und Live-Musik. Perfekt für die Villa in Bogenhausen.',
    targetAudience: 'High-Net-Worth Individuals',
    platforms: ['Email', 'LinkedIn', 'Direct Mail'],
    estimatedImpact: 'high',
    category: 'Event',
    generatedAt: new Date('2024-08-03T16:45:00'),
    status: 'approved',
    relatedProperty: '1'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'deadline-approaching',
    title: 'Deadline in 2 Stunden',
    message: 'LinkedIn-Kampagne für Villa in Bogenhausen muss bis 17:00 finalisiert werden',
    priority: 'high',
    read: false,
    actionUrl: '/communication/todos/1',
    createdAt: new Date('2024-08-04T15:00:00'),
    expiresAt: new Date('2024-08-05T17:00:00')
  },
  {
    id: '2',
    type: 'approval-needed',
    title: 'LinkedIn-Post wartet auf Freigabe',
    message: 'Marktupdate Q3 2024 - bereit zur Veröffentlichung',
    priority: 'medium',
    read: false,
    actionUrl: '/linkedin/posts/2',
    createdAt: new Date('2024-08-04T12:30:00')
  },
  {
    id: '3',
    type: 'lead-activity',
    title: 'Neuer Lead eingetroffen',
    message: 'Andreas Bauer hat Interesse an Villa Bogenhausen bekundet',
    priority: 'medium',
    read: true,
    actionUrl: '/projects/leads/1',
    createdAt: new Date('2024-08-04T09:15:00')
  }
];

export const mockDashboardStats: DashboardStats = {
  todosOverview: {
    total: 15,
    pending: 6,
    inProgress: 4,
    completed: 5,
    overdue: 2
  },
  campaignsOverview: {
    active: 3,
    totalBudget: 65000,
    totalSpent: 23750,
    avgPerformance: 87.5
  },
  leadsOverview: {
    total: 24,
    new: 6,
    qualified: 8,
    conversion: 12.5
  },
  socialMediaOverview: {
    scheduledPosts: 12,
    pendingApproval: 3,
    totalEngagement: 8947,
    followerGrowth: 15.3
  }
};