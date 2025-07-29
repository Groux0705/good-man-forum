import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

// 获取系统总览统计
export const getSystemOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 并行获取各种统计数据
    const [
      // 用户统计
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersWeek,
      
      // 内容统计
      totalTopics,
      publishedTopics,
      newTopicsToday,
      newTopicsWeek,
      
      totalReplies,
      newRepliesToday,
      newRepliesWeek,
      
      // 系统统计
      totalNodes,
      totalReports,
      pendingReports,
      
      // 活跃度统计
      topActiveUsers,
      topNodes,
      recentActivities
    ] = await Promise.all([
      // 用户统计
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      
      // 主题统计
      prisma.topic.count(),
      prisma.topic.count({ where: { status: 'published' } }),
      prisma.topic.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.topic.count({ where: { createdAt: { gte: lastWeek } } }),
      
      // 回复统计
      prisma.reply.count(),
      prisma.reply.count({ where: { createdAt: { gte: yesterday } } }),
      prisma.reply.count({ where: { createdAt: { gte: lastWeek } } }),
      
      // 系统统计
      prisma.node.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'pending' } }),
      
      // 最活跃用户  
      prisma.user.findMany({
        where: {
          topics: {
            some: {
              createdAt: { gte: lastWeek }
            }
          }
        },
        include: {
          _count: {
            select: {
              topics: true,
              replies: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      
      // 最热门节点
      prisma.node.findMany({
        orderBy: { topics: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          title: true,
          topics: true
        }
      }),
      
      // 最近活动
      prisma.adminLog.findMany({
        include: {
          admin: {
            select: {
              username: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // 计算增长率
    const calculateGrowthRate = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userGrowthRate = calculateGrowthRate(newUsersWeek, newUsersToday * 7);
    const topicGrowthRate = calculateGrowthRate(newTopicsWeek, newTopicsToday * 7);
    const replyGrowthRate = calculateGrowthRate(newRepliesWeek, newRepliesToday * 7);

    res.json({
      success: true,
      data: {
        overview: {
          users: {
            total: totalUsers,
            active: activeUsers,
            newToday: newUsersToday,
            newWeek: newUsersWeek,
            growthRate: userGrowthRate
          },
          topics: {
            total: totalTopics,
            published: publishedTopics,
            newToday: newTopicsToday,
            newWeek: newTopicsWeek,
            growthRate: topicGrowthRate
          },
          replies: {
            total: totalReplies,
            newToday: newRepliesToday,
            newWeek: newRepliesWeek,
            growthRate: replyGrowthRate
          },
          system: {
            nodes: totalNodes,
            reports: totalReports,
            pendingReports: pendingReports
          }
        },
        topActiveUsers: topActiveUsers.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          topicCount: user._count.topics,
          replyCount: user._count.replies
        })),
        topNodes,
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          action: activity.action,
          resource: activity.resource,
          details: activity.details,
          admin: activity.admin.username,
          createdAt: activity.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('获取系统总览失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统总览失败'
    });
  }
};

// 获取趋势数据
export const getTrendData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '30d', type = 'all' } = req.query;
    
    let days: number;
    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 30;
    }

    // 生成日期数组
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    // 获取用户注册趋势
    const userTrend = await prisma.user.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(dates[0])
        }
      }
    });

    // 获取主题发布趋势
    const topicTrend = await prisma.topic.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(dates[0])
        }
      }
    });

    // 获取回复趋势
    const replyTrend = await prisma.reply.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(dates[0])
        }
      }
    });

    // 格式化数据
    const formatTrendData = (data: any[], dates: string[]) => {
      const dataMap = new Map();
      data.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        dataMap.set(date, item._count.id);
      });

      return dates.map(date => ({
        date,
        count: dataMap.get(date) || 0
      }));
    };

    const trendData = {
      users: formatTrendData(userTrend, dates),
      topics: formatTrendData(topicTrend, dates),
      replies: formatTrendData(replyTrend, dates)
    };

    // 根据type返回相应数据
    let result;
    switch (type) {
      case 'users':
        result = { users: trendData.users };
        break;
      case 'topics':
        result = { topics: trendData.topics };
        break;
      case 'replies':
        result = { replies: trendData.replies };
        break;
      default:
        result = trendData;
    }

    res.json({
      success: true,
      data: {
        period,
        type,
        trends: result
      }
    });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取趋势数据失败'
    });
  }
};

// 获取热门内容
export const getPopularContent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate: Date;
    const now = new Date();
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      hotTopics,
      activeNodes,
      topContributors
    ] = await Promise.all([
      // 热门主题
      prisma.topic.findMany({
        where: {
          createdAt: { gte: startDate },
          status: 'published'
        },
        include: {
          user: {
            select: {
              username: true,
              avatar: true
            }
          },
          node: {
            select: {
              name: true,
              title: true
            }
          },
          _count: {
            select: {
              replyList: true,
              topicLikes: true,
              topicFavorites: true
            }
          }
        },
        orderBy: [
          { replies: 'desc' },
          { likes: 'desc' }
        ],
        take: 10
      }),
      
      // 活跃节点
      prisma.node.findMany({
        select: {
          id: true,
          name: true,
          title: true,
          topics: true,
          _count: {
            select: {
              topicList: {
                where: {
                  createdAt: { gte: startDate }
                }
              }
            }
          }
        },
        orderBy: {
          topics: 'desc'
        },
        take: 10
      }),
      
      // 活跃贡献者
      prisma.user.findMany({
        where: {
          status: 'active',
          OR: [
            {
              topics: {
                some: {
                  createdAt: { gte: startDate }
                }
              }
            },
            {
              replies: {
                some: {
                  createdAt: { gte: startDate }
                }
              }
            }
          ]
        },
        include: {
          _count: {
            select: {
              topics: {
                where: {
                  createdAt: { gte: startDate }
                }
              },
              replies: {
                where: {
                  createdAt: { gte: startDate }
                }
              }
            }
          }
        },
        orderBy: [
          {
            topics: {
              _count: 'desc'
            }
          },
          {
            replies: {
              _count: 'desc'
            }
          }
        ],
        take: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        period,
        hotTopics: hotTopics.map(topic => ({
          id: topic.id,
          title: topic.title,
          author: topic.user,
          node: topic.node,
          replies: topic._count.replyList,
          likes: topic._count.topicLikes,
          favorites: topic._count.topicFavorites,
          createdAt: topic.createdAt
        })),
        activeNodes: activeNodes.map(node => ({
          id: node.id,
          name: node.name,
          title: node.title,
          recentTopics: node._count?.topicList || 0,
          totalTopics: node.topics
        })),
        topContributors: topContributors.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          recentTopics: user._count.topics,
          recentReplies: user._count.replies
        }))
      }
    });
  } catch (error) {
    console.error('获取热门内容失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门内容失败'
    });
  }
};

// 获取系统健康状态
export const getSystemHealth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [
      recentErrors,
      pendingReports,
      bannedUsers,
      suspendedUsers,
      hiddenTopics,
      deletedTopics,
      systemLogs
    ] = await Promise.all([
      // 最近错误(这里可以从日志系统获取，暂时模拟)
      Promise.resolve(0),
      
      // 待处理举报
      prisma.report.count({
        where: { status: 'pending' }
      }),
      
      // 被禁用户
      prisma.user.count({
        where: { status: 'banned' }
      }),
      
      // 被暂停用户
      prisma.user.count({
        where: { status: 'suspended' }
      }),
      
      // 隐藏主题
      prisma.topic.count({
        where: { status: 'hidden' }
      }),
      
      // 删除主题
      prisma.topic.count({
        where: { status: 'deleted' }
      }),
      
      // 最近系统日志
      prisma.adminLog.count({
        where: {
          createdAt: { gte: oneDayAgo }
        }
      })
    ]);

    // 计算健康度分数
    let healthScore = 100;
    
    // 扣分规则
    if (pendingReports > 10) healthScore -= 10;
    if (bannedUsers > 5) healthScore -= 5;
    if (suspendedUsers > 10) healthScore -= 5;
    if (hiddenTopics > 20) healthScore -= 5;
    if (deletedTopics > 50) healthScore -= 10;
    
    // 健康状态
    let status = 'excellent';
    if (healthScore < 60) status = 'poor';
    else if (healthScore < 80) status = 'fair';
    else if (healthScore < 95) status = 'good';

    res.json({
      success: true,
      data: {
        healthScore,
        status,
        metrics: {
          recentErrors,
          pendingReports,
          bannedUsers,
          suspendedUsers,
          hiddenTopics,
          deletedTopics,
          systemLogs
        },
        recommendations: getHealthRecommendations(healthScore, {
          pendingReports,
          bannedUsers,
          suspendedUsers,
          hiddenTopics,
          deletedTopics
        })
      }
    });
  } catch (error) {
    console.error('获取系统健康状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统健康状态失败'
    });
  }
};

// 生成健康建议
function getHealthRecommendations(score: number, metrics: any): string[] {
  const recommendations = [];
  
  if (metrics.pendingReports > 10) {
    recommendations.push('有较多待处理举报，建议及时处理');
  }
  
  if (metrics.bannedUsers > 5) {
    recommendations.push('被禁用户较多，建议检查封禁策略');
  }
  
  if (metrics.hiddenTopics > 20) {
    recommendations.push('隐藏主题较多，建议审核内容质量');
  }
  
  if (metrics.deletedTopics > 50) {
    recommendations.push('删除主题较多，建议检查内容审核标准');
  }
  
  if (score >= 95) {
    recommendations.push('系统运行良好，继续保持');
  }
  
  return recommendations;
}