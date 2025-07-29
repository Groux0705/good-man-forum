import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { PointService } from '../services/pointService';

const prisma = new PrismaClient();

export const getTopics = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, node, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let where: any = {};
    
    if (node) {
      const nodeParam = String(node);
      // 首先尝试通过节点名称查找节点
      const nodeRecord = await prisma.node.findFirst({
        where: {
          OR: [
            { name: nodeParam },
            { id: nodeParam }
          ]
        },
        select: { id: true }
      });
      
      if (nodeRecord) {
        where.nodeId = nodeRecord.id;
      } else {
        // 如果节点不存在，返回空结果
        return res.json({
          success: true,
          data: {
            topics: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 0,
              pages: 0
            }
          }
        });
      }
    }
    
    if (search) {
      const searchTerm = String(search);
      where.OR = [
        {
          title: {
            contains: searchTerm
          }
        },
        {
          content: {
            contains: searchTerm
          }
        }
      ];
    }

    const topics = await prisma.topic.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { lastReply: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        node: {
          select: { id: true, name: true, title: true }
        }
      }
    });

    const total = await prisma.topic.count({ where });

    res.json({
      success: true,
      data: {
        topics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const searchTopics = async (req: Request, res: Response) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q || String(q).trim().length === 0) {
      return res.json({
        success: true,
        data: {
          topics: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }

    const searchTerm = String(q).trim();
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      OR: [
        {
          title: {
            contains: searchTerm
          }
        },
        {
          content: {
            contains: searchTerm
          }
        }
      ]
    };

    const topics = await prisma.topic.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: [
        { lastReply: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        node: {
          select: { id: true, name: true, title: true }
        }
      }
    });

    const total = await prisma.topic.count({ where });

    res.json({
      success: true,
      data: {
        topics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        },
        query: searchTerm
      }
    });
  } catch (error) {
    console.error('Search topics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getTopic = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, level: true }
        },
        node: {
          select: { id: true, name: true, title: true }
        },
        replyList: {
          where: { parentId: null }, // 只获取顶级回复
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: { id: true, username: true, avatar: true, level: true }
            },
            children: {
              orderBy: { createdAt: 'asc' },
              include: {
                user: {
                  select: { id: true, username: true, avatar: true, level: true }
                },
                parent: {
                  include: {
                    user: {
                      select: { id: true, username: true, avatar: true, level: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    await prisma.topic.update({
      where: { id },
      data: { clicks: { increment: 1 } }
    });

    res.json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Get topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const createTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, nodeId } = req.body;
    const userId = req.user!.id;

    if (!title || !content || !nodeId) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and node are required'
      });
    }

    const node = await prisma.node.findUnique({ where: { id: nodeId } });
    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }

    const topic = await prisma.topic.create({
      data: {
        title,
        content,
        userId,
        nodeId
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        node: {
          select: { id: true, name: true, title: true }
        }
      }
    });

    await prisma.node.update({
      where: { id: nodeId },
      data: { topics: { increment: 1 } }
    });

    // 奖励发帖积分
    try {
      // 检查是否是用户的第一篇帖子
      const userTopicCount = await prisma.topic.count({
        where: { userId }
      });

      if (userTopicCount === 1) {
        // 首次发帖奖励
        await PointService.addPoints({
          userId,
          type: 'first_post',
          amount: 0,
          reason: '首次发帖奖励',
          relatedId: topic.id,
          relatedType: 'topic'
        });
      } else {
        // 普通发帖奖励
        await PointService.addPoints({
          userId,
          type: 'post',
          amount: 0,
          reason: '发布主题',
          relatedId: topic.id,
          relatedType: 'topic'
        });
      }
    } catch (pointError) {
      console.error('Error adding points for topic creation:', pointError);
      // 不影响主流程
    }

    res.status(201).json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 编辑帖子
export const updateTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user!.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    // 检查帖子是否存在以及是否是作者
    const existingTopic = await prisma.topic.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    if (existingTopic.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own topics'
      });
    }

    const updatedTopic = await prisma.topic.update({
      where: { id },
      data: {
        title,
        content,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        node: {
          select: { id: true, name: true, title: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedTopic
    });
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 删除帖子
export const deleteTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 检查帖子是否存在以及是否是作者
    const existingTopic = await prisma.topic.findUnique({
      where: { id },
      select: { userId: true, nodeId: true }
    });

    if (!existingTopic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    if (existingTopic.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own topics'
      });
    }

    // 删除帖子（关联的回复会因为 onDelete: Cascade 自动删除）
    await prisma.topic.delete({
      where: { id }
    });

    // 更新节点的帖子数量
    await prisma.node.update({
      where: { id: existingTopic.nodeId },
      data: { topics: { decrement: 1 } }
    });

    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 投票功能
export const voteTopic = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // "up" or "down"
    const userId = req.user!.id;

    if (!type || (type !== 'up' && type !== 'down')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote type. Must be "up" or "down"'
      });
    }

    // 检查主题是否存在
    const topic = await prisma.topic.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true }
        }
      }
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    // 检查是否已经投票
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId: id
        }
      }
    });

    let voteResult;
    
    if (existingVote) {
      if (existingVote.type === type) {
        // 如果投的是相同类型的票，则取消投票
        await prisma.vote.delete({
          where: {
            userId_topicId: {
              userId,
              topicId: id
            }
          }
        });
        voteResult = { action: 'removed', type };
      } else {
        // 如果投的是不同类型的票，则更新投票
        await prisma.vote.update({
          where: {
            userId_topicId: {
              userId,
              topicId: id
            }
          },
          data: { type }
        });
        voteResult = { action: 'updated', type, previousType: existingVote.type };
      }
    } else {
      // 创建新投票
      await prisma.vote.create({
        data: {
          userId,
          topicId: id,
          type
        }
      });
      voteResult = { action: 'created', type };
    }

    // 获取当前投票统计
    const votes = await getVoteStats(id);

    // 发送通知（如果是新投票且不是给自己投票）
    if (voteResult.action === 'created' && topic.userId !== userId) {
      const { notificationService } = await import('../services/notificationService');
      const voter = await prisma.user.findUnique({
        where: { id: userId },
        select: { username: true }
      });

      await notificationService.createTopicVoteNotification(
        topic.userId,
        userId,
        id,
        type,
        topic.title,
        voter?.username || '匿名用户'
      );
    }

    res.json({
      success: true,
      data: {
        vote: voteResult,
        stats: votes
      }
    });
  } catch (error) {
    console.error('Vote topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取主题投票统计
export const getTopicVotes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 检查主题是否存在
    const topic = await prisma.topic.findUnique({
      where: { id }
    });

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    const votes = await getVoteStats(id);

    res.json({
      success: true,
      data: votes
    });
  } catch (error) {
    console.error('Get topic votes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 辅助函数：获取投票统计
async function getVoteStats(topicId: string) {
  const [upVotes, downVotes] = await Promise.all([
    prisma.vote.count({
      where: { topicId, type: 'up' }
    }),
    prisma.vote.count({
      where: { topicId, type: 'down' }
    })
  ]);

  return {
    upVotes,
    downVotes,
    total: upVotes + downVotes,
    score: upVotes - downVotes
  };
}