import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNodes = async (req: Request, res: Response) => {
  try {
    const nodes = await prisma.node.findMany({
      orderBy: { createdAt: 'asc' }
    });

    res.json({
      success: true,
      data: nodes
    });
  } catch (error) {
    console.error('Get nodes error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getNode = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // 支持按ID或名称查找节点
    const node = await prisma.node.findFirst({
      where: {
        OR: [
          { id: id },
          { name: id }
        ]
      },
      include: {
        topicList: {
          take: 20,
          orderBy: { lastReply: 'desc' },
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          }
        }
      }
    });

    if (!node) {
      return res.status(404).json({
        success: false,
        error: 'Node not found'
      });
    }

    res.json({
      success: true,
      data: node
    });
  } catch (error) {
    console.error('Get node error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};