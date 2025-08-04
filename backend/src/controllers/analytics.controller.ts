import { Response } from 'express';
import { AuthenticatedRequest, ApiResponse } from '@/types/express';
import { createSuccessResponse, asyncHandler } from '@/utils/helpers';
import prisma from '@/config/database';
import { AppError } from '@/middleware/error';
import { UserRole } from '@prisma/client';

export class AnalyticsController {
  static getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;

    // Build where clauses based on user role
    const todoWhere = userId ? { 
      OR: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    } : {};

    const campaignWhere = userId ? { createdBy: userId } : {};
    const propertyWhere = userId ? { agentId: userId } : {};
    const leadWhere = userId ? { assignedAgent: userId } : {};
    const postWhere = userId ? { createdBy: userId } : {};

    // Execute all queries in parallel
    const [
      todoStats,
      campaignStats,
      leadStats,
      socialMediaStats,
      propertyStats,
      recentActivity
    ] = await Promise.all([
      // Todo statistics
      prisma.todo.groupBy({
        by: ['status'],
        where: todoWhere,
        _count: { status: true },
      }),

      // Campaign statistics
      Promise.all([
        prisma.campaign.count({
          where: { ...campaignWhere, status: 'ACTIVE' },
        }),
        prisma.campaign.aggregate({
          where: campaignWhere,
          _sum: { budget: true, spent: true },
        }),
        prisma.campaign.findMany({
          where: campaignWhere,
          include: { kpis: true },
        }),
      ]),

      // Lead statistics
      prisma.lead.groupBy({
        by: ['status'],
        where: leadWhere,
        _count: { status: true },
      }),

      // Social media statistics
      Promise.all([
        prisma.linkedInPost.count({
          where: { ...postWhere, status: 'SCHEDULED' },
        }),
        prisma.linkedInPost.count({
          where: { ...postWhere, status: 'PENDING_APPROVAL' },
        }),
        prisma.postAnalytics.aggregate({
          where: {
            post: postWhere,
          },
          _sum: { views: true, likes: true, comments: true, shares: true },
        }),
        prisma.linkedInPost.count({
          where: {
            ...postWhere,
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        }),
      ]),

      // Property statistics
      prisma.property.groupBy({
        by: ['status'],
        where: propertyWhere,
        _count: { status: true },
      }),

      // Recent activity (last 7 days)
      Promise.all([
        prisma.todo.count({
          where: {
            ...todoWhere,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.lead.count({
          where: {
            ...leadWhere,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
        prisma.linkedInPost.count({
          where: {
            ...postWhere,
            status: 'PUBLISHED',
            publishedAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]),
    ]);

    // Process todo statistics
    const todoOverview = {
      total: todoStats.reduce((sum, stat) => sum + stat._count.status, 0),
      pending: todoStats.find(s => s.status === 'PENDING')?._count.status || 0,
      inProgress: todoStats.find(s => s.status === 'IN_PROGRESS')?._count.status || 0,
      completed: todoStats.find(s => s.status === 'COMPLETED')?._count.status || 0,
      overdue: 0, // This would need a separate query with date filtering
    };

    // Process campaign statistics
    const [activeCampaigns, campaignAggregates, campaignsWithKpis] = campaignStats;
    const totalBudget = campaignAggregates._sum.budget?.toNumber() || 0;
    const totalSpent = campaignAggregates._sum.spent?.toNumber() || 0;

    // Calculate average campaign performance
    let totalPerformance = 0;
    let performanceCount = 0;
    
    campaignsWithKpis.forEach(campaign => {
      campaign.kpis.forEach(kpi => {
        if (kpi.target > 0) {
          totalPerformance += (kpi.current.toNumber() / kpi.target.toNumber()) * 100;
          performanceCount++;
        }
      });
    });

    const avgPerformance = performanceCount > 0 ? totalPerformance / performanceCount : 0;

    const campaignsOverview = {
      active: activeCampaigns,
      totalBudget,
      totalSpent,
      avgPerformance: Math.round(avgPerformance * 100) / 100,
    };

    // Process lead statistics
    const leadsOverview = {
      total: leadStats.reduce((sum, stat) => sum + stat._count.status, 0),
      new: leadStats.find(s => s.status === 'NEW')?._count.status || 0,
      qualified: leadStats.find(s => s.status === 'QUALIFIED')?._count.status || 0,
      conversion: 0, // Would need separate calculation
    };

    // Calculate lead conversion rate
    const closedLeads = leadStats.find(s => s.status === 'CLOSED')?._count.status || 0;
    if (leadsOverview.total > 0) {
      leadsOverview.conversion = Math.round((closedLeads / leadsOverview.total) * 100 * 100) / 100;
    }

    // Process social media statistics
    const [scheduledPosts, pendingApproval, analyticsAggregate, recentPosts] = socialMediaStats;
    const totalEngagement = (analyticsAggregate._sum.likes || 0) + 
                           (analyticsAggregate._sum.comments || 0) + 
                           (analyticsAggregate._sum.shares || 0);

    // Calculate follower growth (placeholder - would need historical data)
    const followerGrowth = 15.3; // This would come from external LinkedIn API

    const socialMediaOverview = {
      scheduledPosts,
      pendingApproval,
      totalEngagement,
      followerGrowth,
    };

    // Process property statistics
    const propertyOverview = {
      total: propertyStats.reduce((sum, stat) => sum + stat._count.status, 0),
      available: propertyStats.find(s => s.status === 'AVAILABLE')?._count.status || 0,
      underContract: propertyStats.find(s => s.status === 'UNDER_CONTRACT')?._count.status || 0,
      sold: propertyStats.find(s => s.status === 'SOLD')?._count.status || 0,
    };

    // Process recent activity
    const [newTodos, newLeads, publishedPosts] = recentActivity;

    const dashboardStats = {
      todosOverview,
      campaignsOverview,
      leadsOverview,
      socialMediaOverview,
      propertyOverview,
      recentActivity: {
        newTodos,
        newLeads,
        publishedPosts,
      },
      summary: {
        totalProperties: propertyOverview.total,
        activeCampaigns: campaignsOverview.active,
        totalLeads: leadsOverview.total,
        pendingTodos: todoOverview.pending + todoOverview.inProgress,
      },
    };

    res.json(createSuccessResponse(dashboardStats));
  });

  static getCampaignAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const { period = '30d' } = req.query;

    // Check if campaign exists and user has access
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        kpis: true,
        linkedInPosts: {
          include: {
            analytics: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (req.user.role !== UserRole.ADMIN && campaign.createdBy !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Calculate period dates
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Get performance metrics
    const kpiPerformance = campaign.kpis.map(kpi => ({
      metric: kpi.metric,
      target: kpi.target.toNumber(),
      current: kpi.current.toNumber(),
      achievement: kpi.target > 0 ? (kpi.current.toNumber() / kpi.target.toNumber()) * 100 : 0,
      unit: kpi.unit,
    }));

    // Aggregate social media analytics
    const socialMetrics = campaign.linkedInPosts.reduce((acc, post) => {
      if (post.analytics) {
        acc.totalViews += post.analytics.views;
        acc.totalLikes += post.analytics.likes;
        acc.totalComments += post.analytics.comments;
        acc.totalShares += post.analytics.shares;
        acc.totalEngagement += post.analytics.engagement.toNumber();
        acc.postCount++;
      }
      return acc;
    }, {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalEngagement: 0,
      postCount: 0,
    });

    const avgEngagement = socialMetrics.postCount > 0 
      ? socialMetrics.totalEngagement / socialMetrics.postCount 
      : 0;

    // Budget analysis
    const budgetUsed = (campaign.spent.toNumber() / campaign.budget.toNumber()) * 100;
    const remainingBudget = campaign.budget.toNumber() - campaign.spent.toNumber();

    // Timeline analysis
    const totalDays = Math.ceil((campaign.endDate.getTime() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((Date.now() - campaign.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const timelineProgress = Math.min((elapsedDays / totalDays) * 100, 100);

    const analytics = {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        type: campaign.type,
      },
      performance: {
        overall: kpiPerformance.length > 0 
          ? kpiPerformance.reduce((sum, kpi) => sum + kpi.achievement, 0) / kpiPerformance.length 
          : 0,
        kpis: kpiPerformance,
      },
      budget: {
        total: campaign.budget.toNumber(),
        spent: campaign.spent.toNumber(),
        remaining: remainingBudget,
        usagePercent: budgetUsed,
      },
      timeline: {
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        totalDays,
        elapsedDays: Math.max(0, elapsedDays),
        remainingDays: Math.max(0, totalDays - elapsedDays),
        progress: timelineProgress,
      },
      socialMedia: {
        ...socialMetrics,
        avgEngagement: Math.round(avgEngagement * 100) / 100,
        postsPublished: campaign.linkedInPosts.filter(p => p.status === 'PUBLISHED').length,
        postsScheduled: campaign.linkedInPosts.filter(p => p.status === 'SCHEDULED').length,
      },
      insights: {
        topPerformingKPI: kpiPerformance.length > 0 
          ? kpiPerformance.reduce((max, kpi) => kpi.achievement > max.achievement ? kpi : max)
          : null,
        budgetEfficiency: budgetUsed > 0 ? (kpiPerformance.reduce((sum, kpi) => sum + kpi.achievement, 0) / kpiPerformance.length) / budgetUsed : 0,
        recommendedActions: generateRecommendations(campaign, kpiPerformance, budgetUsed, timelineProgress),
      },
    };

    res.json(createSuccessResponse(analytics));
  });

  static getLeadAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    const { period = '30d' } = req.query;
    const userId = req.user.role === UserRole.ADMIN ? undefined : req.user.id;

    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const leadWhere = userId ? { assignedAgent: userId } : {};

    const [
      statusDistribution,
      sourceDistribution,
      conversionFunnel,
      scoreDistribution,
      timeSeriesData,
    ] = await Promise.all([
      // Lead status distribution
      prisma.lead.groupBy({
        by: ['status'],
        where: leadWhere,
        _count: { status: true },
        _avg: { score: true },
      }),

      // Lead source distribution
      prisma.lead.groupBy({
        by: ['source'],
        where: leadWhere,
        _count: { source: true },
      }),

      // Conversion funnel
      prisma.lead.groupBy({
        by: ['status'],
        where: {
          ...leadWhere,
          createdAt: { gte: startDate },
        },
        _count: { status: true },
        orderBy: { _count: { status: 'desc' } },
      }),

      // Score distribution
      prisma.lead.groupBy({
        by: ['status'],
        where: leadWhere,
        _avg: { score: true },
        _min: { score: true },
        _max: { score: true },
      }),

      // Time series data (daily lead creation)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date, 
          COUNT(*) as count,
          AVG(score) as avg_score
        FROM leads 
        WHERE created_at >= ${startDate}
        ${userId ? prisma.$queryRaw`AND assigned_agent = ${userId}` : prisma.$queryRaw``}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    const analytics = {
      overview: {
        totalLeads: statusDistribution.reduce((sum, stat) => sum + stat._count.status, 0),
        avgScore: statusDistribution.reduce((sum, stat) => sum + (stat._avg.score || 0), 0) / statusDistribution.length,
        conversionRate: calculateConversionRate(statusDistribution),
      },
      distribution: {
        byStatus: statusDistribution.map(stat => ({
          status: stat.status,
          count: stat._count.status,
          avgScore: Math.round((stat._avg.score || 0) * 100) / 100,
        })),
        bySource: sourceDistribution.map(stat => ({
          source: stat.source,
          count: stat._count.source,
        })),
      },
      funnel: conversionFunnel.map(stat => ({
        stage: stat.status,
        count: stat._count.status,
      })),
      scoreAnalysis: {
        byStatus: scoreDistribution.map(stat => ({
          status: stat.status,
          avgScore: Math.round((stat._avg.score || 0) * 100) / 100,
          minScore: stat._min.score || 0,
          maxScore: stat._max.score || 0,
        })),
      },
      timeline: timeSeriesData,
    };

    res.json(createSuccessResponse(analytics));
  });
}

function generateRecommendations(campaign: any, kpiPerformance: any[], budgetUsed: number, timelineProgress: number): string[] {
  const recommendations: string[] = [];

  // Budget recommendations
  if (budgetUsed > 80 && timelineProgress < 80) {
    recommendations.push('Consider increasing budget or optimizing spend allocation');
  }
  if (budgetUsed < 50 && timelineProgress > 60) {
    recommendations.push('Budget utilization is low - consider increasing campaign intensity');
  }

  // Performance recommendations
  const avgPerformance = kpiPerformance.reduce((sum, kpi) => sum + kpi.achievement, 0) / kpiPerformance.length;
  if (avgPerformance < 70) {
    recommendations.push('Campaign performance is below target - review targeting and creative');
  }
  if (avgPerformance > 120) {
    recommendations.push('Campaign is over-performing - consider scaling successful elements');
  }

  // Timeline recommendations
  if (timelineProgress > 80 && avgPerformance < 80) {
    recommendations.push('Campaign is nearing end with low performance - consider extending or optimization');
  }

  return recommendations;
}

function calculateConversionRate(statusDistribution: any[]): number {
  const total = statusDistribution.reduce((sum, stat) => sum + stat._count.status, 0);
  const closed = statusDistribution.find(s => s.status === 'CLOSED')?._count.status || 0;
  return total > 0 ? Math.round((closed / total) * 100 * 100) / 100 : 0;
}