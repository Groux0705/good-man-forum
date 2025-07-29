import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAdminAction } from '../../middleware/adminAuth';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

// 获取节点列表
export const getNodes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { title: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    const [nodes, total] = await Promise.all([
      prisma.node.findMany({
        where,
        include: {
          _count: {
            select: {
              topicList: true
            }
          }
        },
        orderBy,
        skip,
        take: Number(limit)
      }),
      prisma.node.count({ where })
    ]);

    const nodesWithStats = nodes.map(node => ({
      ...node,
      topicCount: node._count.topicList
    }));

    res.json({
      success: true,
      data: {
        nodes: nodesWithStats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取节点列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取节点列表失败'
    });
  }
};

// 获取节点详情
export const getNodeDetail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const node = await prisma.node.findUnique({
      where: { id },
      include: {
        topicList: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                username: true,
                avatar: true
              }
            },
            _count: {
              select: {
                replyList: true,
                topicLikes: true
              }
            }
          }
        },
        _count: {
          select: {
            topicList: true
          }
        }
      }
    });

    if (!node) {
      return res.status(404).json({
        success: false,
        message: '节点不存在'
      });
    }

    // 获取节点统计数据
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      weeklyTopics,
      monthlyTopics,
      topContributors
    ] = await Promise.all([
      prisma.topic.count({
        where: {
          nodeId: id,
          createdAt: { gte: lastWeek }
        }
      }),
      
      prisma.topic.count({
        where: {
          nodeId: id,
          createdAt: { gte: lastMonth }
        }
      }),
      
      prisma.user.findMany({
        where: {
          topics: {
            some: {
              nodeId: id
            }
          }
        },
        include: {
          _count: {
            select: {
              topics: {
                where: {
                  nodeId: id
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        ...node,
        totalTopics: node._count.topicList,
        recentTopics: node.topicList,
        stats: {
          weeklyTopics,
          monthlyTopics
        },
        topContributors: topContributors.map(user => ({
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          topicCount: user._count.topics
        }))
      }
    });
  } catch (error) {
    console.error('获取节点详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取节点详情失败'
    });
  }
};

// 创建节点
export const createNode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, title, description, avatar, header } = req.body;

    if (!name || !title) {
      return res.status(400).json({
        success: false,
        message: '节点名称和标题不能为空'
      });
    }

    // 检查节点名称是否已存在
    const existingNode = await prisma.node.findUnique({
      where: { name }
    });

    if (existingNode) {
      return res.status(400).json({
        success: false,
        message: '节点名称已存在'
      });
    }

    const node = await prisma.node.create({
      data: {
        name,
        title,
        description,
        avatar,
        header
      }
    });

    // 记录管理员操作日志
    await logAdminAction(
      req.user!.id,
      'CREATE_NODE',
      'node',
      node.id,
      {
        name,
        title,
        description
      },
      req
    );

    res.json({
      success: true,
      data: node,
      message: '节点创建成功'
    });
  } catch (error) {
    console.error('创建节点失败:', error);
    res.status(500).json({
      success: false,
      message: '创建节点失败'
    });
  }
};

// 更新节点
export const updateNode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, title, description, avatar, header } = req.body;

    const existingNode = await prisma.node.findUnique({
      where: { id }
    });

    if (!existingNode) {
      return res.status(404).json({
        success: false,
        message: '节点不存在'
      });
    }

    // 如果修改了名称，检查是否与其他节点冲突
    if (name && name !== existingNode.name) {
      const nameConflict = await prisma.node.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: '节点名称已存在'
        });
      }
    }

    const updatedNode = await prisma.node.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(avatar !== undefined && { avatar }),
        ...(header !== undefined && { header })
      }
    });

    // 记录管理员操作日志
    await logAdminAction(
      req.user!.id,
      'UPDATE_NODE',
      'node',
      id,
      {
        oldData: {
          name: existingNode.name,
          title: existingNode.title,
          description: existingNode.description
        },
        newData: {
          name: updatedNode.name,
          title: updatedNode.title,
          description: updatedNode.description
        }
      },
      req
    );

    res.json({
      success: true,
      data: updatedNode,
      message: '节点更新成功'
    });
  } catch (error) {
    console.error('更新节点失败:', error);
    res.status(500).json({
      success: false,
      message: '更新节点失败'
    });
  }
};

// 删除节点
export const deleteNode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { targetNodeId } = req.body; // 可选：将主题转移到的目标节点ID

    const node = await prisma.node.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        title: true,
        topics: true,
        _count: {
          select: {
            topicList: true
          }
        }
      }
    });

    if (!node) {
      return res.status(404).json({
        success: false,
        message: '节点不存在'
      });
    }

    // 如果节点有主题，需要处理
    if (node._count.topicList > 0) {
      if (targetNodeId) {
        // 检查目标节点是否存在
        const targetNode = await prisma.node.findUnique({
          where: { id: targetNodeId }
        });

        if (!targetNode) {
          return res.status(400).json({
            success: false,
            message: '目标节点不存在'
          });
        }

        // 在事务中转移主题并删除节点
        await prisma.$transaction(async (tx) => {
          // 转移所有主题到目标节点
          await tx.topic.updateMany({
            where: { nodeId: id },
            data: { nodeId: targetNodeId }
          });

          // 更新目标节点的主题计数
          await tx.node.update({
            where: { id: targetNodeId },
            data: {
              topics: {
                increment: node._count.topicList
              }
            }
          });

          // 删除原节点
          await tx.node.delete({
            where: { id }
          });
        });

        await logAdminAction(
          req.user!.id,
          'DELETE_NODE_WITH_TRANSFER',
          'node',
          id,
          {
            nodeName: node.name,
            topicCount: node._count.topicList,
            targetNodeId,
            targetNodeName: targetNode.name
          },
          req
        );

        res.json({
          success: true,
          message: `节点删除成功，${node._count.topicList} 个主题已转移到 ${targetNode.title}`
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `节点包含 ${node._count.topicList} 个主题，请指定目标节点或先删除/转移这些主题`
        });
      }
    } else {
      // 没有主题，直接删除
      await prisma.node.delete({
        where: { id }
      });

      await logAdminAction(
        req.user!.id,
        'DELETE_NODE',
        'node',
        id,
        {
          nodeName: node.name,
          nodeTitle: node.title
        },
        req
      );

      res.json({
        success: true,
        message: '节点删除成功'
      });
    }
  } catch (error) {
    console.error('删除节点失败:', error);
    res.status(500).json({
      success: false,
      message: '删除节点失败'
    });
  }
};

// 获取节点统计信息
export const getNodeStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    
    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      totalNodes,
      activeNodes,
      topNodesByTopics,
      topNodesByActivity,
      nodeGrowthTrend
    ] = await Promise.all([
      // 总节点数
      prisma.node.count(),
      
      // 活跃节点数（有新主题的节点）
      prisma.node.count({
        where: {
          topicList: {
            some: {
              createdAt: { gte: startDate }
            }
          }
        }
      }),
      
      // 按主题数排序的热门节点
      prisma.node.findMany({
        orderBy: { topics: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          title: true,
          topics: true
        }
      }),
      
      // 按最近活跃度排序的节点
      prisma.node.findMany({
        include: {
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
      
      // 节点创建趋势（如果需要的话）
      prisma.node.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalNodes,
          active: activeNodes
        },
        topNodesByTopics,
        topNodesByActivity: topNodesByActivity.map(node => ({
          id: node.id,
          name: node.name,
          title: node.title,
          totalTopics: node.topics,
          recentTopics: node._count.topicList
        })),
        growthTrend: nodeGrowthTrend.map(item => ({
          date: item.createdAt.toISOString().split('T')[0],
          count: item._count.id
        })),
        period
      }
    });
  } catch (error) {
    console.error('获取节点统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取节点统计失败'
    });
  }
};