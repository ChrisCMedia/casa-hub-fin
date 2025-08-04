import { PrismaClient } from '@prisma/client';
import { AuthUtils } from '../utils/auth';
import { logger } from '../config/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await AuthUtils.hashPassword('admin123!');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@casahub.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@casahub.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
      },
    });

    // Create editor user (Sarah Weber from mockData)
    const editorPassword = await AuthUtils.hashPassword('sarah123!');
    const editor = await prisma.user.upsert({
      where: { email: 'sarah@immobilien-weber.de' },
      update: {},
      create: {
        name: 'Sarah Weber',
        email: 'sarah@immobilien-weber.de',
        passwordHash: editorPassword,
        role: 'EDITOR',
      },
    });

    // Create marketing partner users
    const marketing1Password = await AuthUtils.hashPassword('michael123!');
    const marketing1 = await prisma.user.upsert({
      where: { email: 'michael@marketing-pro.de' },
      update: {},
      create: {
        name: 'Michael Schmidt',
        email: 'michael@marketing-pro.de',
        passwordHash: marketing1Password,
        role: 'EDITOR',
      },
    });

    const marketing2Password = await AuthUtils.hashPassword('lisa123!');
    const marketing2 = await prisma.user.upsert({
      where: { email: 'lisa@socialexpert.de' },
      update: {},
      create: {
        name: 'Lisa Müller',
        email: 'lisa@socialexpert.de',
        passwordHash: marketing2Password,
        role: 'EDITOR',
      },
    });

    // Create sample properties
    const property1 = await prisma.property.create({
      data: {
        title: 'Exklusive Villa in Bogenhausen',
        address: 'Prinzregentenstraße 45, 81675 München',
        type: 'HOUSE',
        price: 2850000,
        area: 380,
        rooms: 8,
        status: 'AVAILABLE',
        description: 'Traumhafte Villa mit Blick auf den Englischen Garten',
        features: ['Pool', 'Garten', 'Doppelgarage', 'Keller', 'Balkon'],
        listingDate: new Date('2024-07-15'),
        agentId: editor.id,
      },
    });

    const property2 = await prisma.property.create({
      data: {
        title: 'Moderne Penthouse-Wohnung',
        address: 'Maximilianstraße 12, 80539 München',
        type: 'APARTMENT',
        price: 1650000,
        area: 185,
        rooms: 4,
        status: 'UNDER_CONTRACT',
        description: 'Luxuriöses Penthouse in bester Innenstadtlage',
        features: ['Dachterrasse', 'Aufzug', 'Klimaanlage', 'Concierge'],
        listingDate: new Date('2024-06-20'),
        agentId: editor.id,
      },
    });

    // Add property images
    await prisma.propertyImage.createMany({
      data: [
        {
          propertyId: property1.id,
          imageUrl: '/api/placeholder/800/600',
          caption: 'Villa Exterior View',
          isPrimary: true,
          sortOrder: 0,
        },
        {
          propertyId: property1.id,
          imageUrl: '/api/placeholder/800/600',
          caption: 'Living Room',
          isPrimary: false,
          sortOrder: 1,
        },
        {
          propertyId: property2.id,
          imageUrl: '/api/placeholder/800/600',
          caption: 'Penthouse View',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
    });

    // Create sample campaigns
    const campaign1 = await prisma.campaign.create({
      data: {
        name: 'Villa Bogenhausen Premium',
        propertyId: property1.id,
        type: 'SOCIAL_MEDIA',
        status: 'ACTIVE',
        budget: 15000,
        spent: 8750,
        startDate: new Date('2024-07-20'),
        endDate: new Date('2024-08-31'),
        targetAudience: 'High-Income Families, Age 35-55',
        platforms: ['LinkedIn', 'Facebook', 'Instagram'],
        createdBy: editor.id,
      },
    });

    const campaign2 = await prisma.campaign.create({
      data: {
        name: 'Q4 Google Ads München',
        type: 'GOOGLE_ADS',
        status: 'PLANNING',
        budget: 25000,
        spent: 0,
        startDate: new Date('2024-10-01'),
        endDate: new Date('2024-12-31'),
        targetAudience: 'Property Buyers, Munich Area',
        platforms: ['Google Search', 'Google Display'],
        createdBy: editor.id,
      },
    });

    // Create campaign KPIs
    await prisma.campaignKPI.createMany({
      data: [
        {
          campaignId: campaign1.id,
          metric: 'Impressions',
          target: 50000,
          current: 32100,
          unit: 'views',
          updatedBy: editor.id,
        },
        {
          campaignId: campaign1.id,
          metric: 'Leads',
          target: 25,
          current: 18,
          unit: 'contacts',
          updatedBy: editor.id,
        },
        {
          campaignId: campaign1.id,
          metric: 'CTR',
          target: 2.5,
          current: 3.1,
          unit: '%',
          updatedBy: editor.id,
        },
      ],
    });

    // Create sample leads
    const lead1 = await prisma.lead.create({
      data: {
        name: 'Andreas Bauer',
        email: 'andreas.bauer@email.de',
        phone: '+49 89 12345678',
        status: 'VIEWING_SCHEDULED',
        source: 'WEBSITE',
        budgetMin: 2000000,
        budgetMax: 3000000,
        notes: 'Interessiert an Villa, Besichtigung am Freitag geplant',
        score: 85,
        assignedAgent: editor.id,
        lastContact: new Date(),
      },
    });

    const lead2 = await prisma.lead.create({
      data: {
        name: 'Maria Hoffmann',
        email: 'maria.hoffmann@email.de',
        phone: '+49 89 87654321',
        status: 'QUALIFIED',
        source: 'SOCIAL_MEDIA',
        budgetMin: 1400000,
        budgetMax: 1800000,
        notes: 'Sucht Penthouse für Eigennutzung, sehr interessiert',
        score: 92,
        assignedAgent: editor.id,
        lastContact: new Date(),
      },
    });

    // Add lead property interests
    await prisma.leadProperty.createMany({
      data: [
        {
          leadId: lead1.id,
          propertyId: property1.id,
          addedBy: editor.id,
        },
        {
          leadId: lead2.id,
          propertyId: property2.id,
          addedBy: editor.id,
        },
      ],
    });

    // Create sample todos
    await prisma.todo.createMany({
      data: [
        {
          title: 'LinkedIn-Kampagne für Villa in Bogenhausen finalisieren',
          description: 'Finale Abstimmung der Bildauswahl und Freigabe der Texte für die Premium-Villa Kampagne',
          priority: 'URGENT',
          status: 'IN_PROGRESS',
          assignedTo: marketing1.id,
          createdBy: editor.id,
          dueDate: new Date('2024-08-05T17:00:00'),
          tags: ['LinkedIn', 'Villa', 'Premium'],
        },
        {
          title: 'Google Ads Budget für Q4 abstimmen',
          description: 'Planung der Werbeausgaben für das vierte Quartal und Zielgruppen-Optimierung',
          priority: 'HIGH',
          status: 'PENDING',
          assignedTo: marketing2.id,
          createdBy: editor.id,
          dueDate: new Date('2024-08-08T12:00:00'),
          tags: ['Google Ads', 'Budget', 'Q4'],
        },
        {
          title: 'Instagram Stories für neue Wohnanlage erstellen',
          description: 'Content-Serie für die neue Wohnanlage "Green Living" mit Virtual Tour Integration',
          priority: 'MEDIUM',
          status: 'COMPLETED',
          assignedTo: marketing1.id,
          createdBy: editor.id,
          dueDate: new Date('2024-08-02T16:00:00'),
          tags: ['Instagram', 'Stories', 'Wohnanlage'],
        },
      ],
    });

    // Create sample LinkedIn posts
    const post1 = await prisma.linkedInPost.create({
      data: {
        content: '🏡 EXKLUSIV: Villa in Bogenhausen mit Blick auf den Englischen Garten\n\nModerne Architektur trifft auf klassische Eleganz. Diese außergewöhnliche Villa bietet:\n\n✨ 5 Schlafzimmer, 4 Bäder\n✨ Großzügiger Garten mit Pool\n✨ Doppelgarage und Keller\n✨ Traumhafter Blick ins Grüne\n\nInteresse? Kontaktieren Sie mich für eine private Besichtigung!\n\n#München #Bogenhausen #Villa #Luxusimmobilie #Immobilienmakler',
        hashtags: ['München', 'Bogenhausen', 'Villa', 'Luxusimmobilie', 'Immobilienmakler'],
        scheduledDate: new Date('2024-08-05T09:00:00'),
        status: 'APPROVED',
        createdBy: editor.id,
        approvedBy: admin.id,
        campaignId: campaign1.id,
      },
    });

    const post2 = await prisma.linkedInPost.create({
      data: {
        content: '📈 Marktupdate München Q3 2024\n\nDie wichtigsten Trends im Münchner Immobilienmarkt:\n\n• Preise stabilisieren sich auf hohem Niveau\n• Nachfrage nach Bestandsimmobilien steigt\n• Neubau-Projekte werden selektiver\n• Zinsentwicklung beeinflusst Kaufentscheidungen\n\nDetaillierte Marktanalyse in den Comments 👇\n\n#ImmobilienMarkt #München #Marktanalyse #Investition',
        hashtags: ['ImmobilienMarkt', 'München', 'Marktanalyse', 'Investition'],
        scheduledDate: new Date('2024-08-06T14:00:00'),
        status: 'PENDING_APPROVAL',
        createdBy: editor.id,
      },
    });

    // Create post analytics for published post
    await prisma.postAnalytics.create({
      data: {
        postId: post1.id,
        views: 2847,
        likes: 89,
        comments: 12,
        shares: 6,
        clickThroughRate: 3.2,
        engagement: 3.8,
      },
    });

    // Create sample notifications
    await prisma.notification.createMany({
      data: [
        {
          userId: editor.id,
          type: 'DEADLINE_APPROACHING',
          title: 'Deadline in 2 Stunden',
          message: 'LinkedIn-Kampagne für Villa in Bogenhausen muss bis 17:00 finalisiert werden',
          priority: 'HIGH',
          read: false,
          actionUrl: '/todos',
        },
        {
          userId: admin.id,
          type: 'APPROVAL_NEEDED',
          title: 'LinkedIn-Post wartet auf Freigabe',
          message: 'Marktupdate Q3 2024 - bereit zur Veröffentlichung',
          priority: 'MEDIUM',
          read: false,
          actionUrl: '/linkedin/posts',
        },
        {
          userId: editor.id,
          type: 'LEAD_ACTIVITY',
          title: 'Neuer Lead eingetroffen',
          message: 'Andreas Bauer hat Interesse an Villa Bogenhausen bekundet',
          priority: 'MEDIUM',
          read: true,
          actionUrl: '/leads',
        },
      ],
    });

    logger.info('Database seeding completed successfully!');
    logger.info(`Created users: admin@casahub.com (admin123!), sarah@immobilien-weber.de (sarah123!)`);
    logger.info(`Created ${2} properties, ${2} campaigns, ${2} leads, ${3} todos, ${2} LinkedIn posts`);

  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });