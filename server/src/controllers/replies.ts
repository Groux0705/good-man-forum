import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { PointService } from '../services/pointService';

const prisma = new PrismaClient();

export const createReply = async (req: AuthRequest, res: Response) => {
  try {
    const { content, topicId, parentId, replyToUsername } = req.body;
    const userId = req.user!.id;

    if (!content || !topicId) {
      return res.status(400).json({
        success: false,
        error: 'Content and topicId are required'
      });
    }

    const topic = await prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    let finalParentId = null;
    let finalReplyToUsername = null;

    // 如果有parentId，处理嵌套回复逻辑
    if (parentId) {
      const parentReply = await prisma.reply.findUnique({ 
        where: { id: parentId },
        include: { 
          parent: true,
          user: true 
        }
      });
      
      if (!parentReply) {
        return res.status(404).json({
          success: false,
          error: 'Parent reply not found'
        });
      }
      
      // 验证父回复是否属于同一个主题
      if (parentReply.topicId !== topicId) {
        return res.status(400).json({
          success: false,
          error: 'Parent reply must belong to the same topic'
        });
      }

      // 如果回复的是子回复，则将其parentId设为顶级回复的ID
      // 这样所有回复都会平铺在第二层
      finalParentId = parentReply.parent ? parentReply.parent.id : parentReply.id;
      
      // 设置被回复的用户名
      finalReplyToUsername = replyToUsername || parentReply.user.username;
    }

    const reply = await prisma.reply.create({
      data: {
        content,
        userId,
        topicId,
        parentId: finalParentId,
        replyToUsername: finalReplyToUsername
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, level: true }
        },
        parent: finalParentId ? {
          include: {
            user: {
              select: { id: true, username: true, avatar: true, level: true }
            }
          }
        } : false,
        topic: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        }
      }
    });

    // 更新主题回复数和最后回复时间
    await prisma.topic.update({
      where: { id: topicId },
      data: { 
        replies: { increment: 1 },
        lastReply: new Date()
      }
    });

    // 奖励回复积分
    try {
      await PointService.addPoints({
        userId,
        type: 'reply',
        amount: 0, // amount在PointService中会被规则覆盖
        reason: '发表回复',
        relatedId: reply.id,
        relatedType: 'reply'
      });
    } catch (pointError) {
      console.error('Error adding points for reply:', pointError);
      // 不影响主流程
    }

    // 发送通知
    try {
      const { notificationService } = await import('../services/notificationService');
      const replyAuthor = reply.user;
      
      // 如果是回复主题（不是回复评论）
      if (!finalParentId) {
        // 通知主题作者
        if (reply.topic.user.id !== userId) {
          await notificationService.createTopicReplyNotification(
            reply.topic.user.id,
            userId,
            topicId,
            reply.id,
            reply.topic.title || '主题',
            replyAuthor.username
          );
        }
      } else {
        // 如果是回复评论，先获取父评论的完整信息
        const parentReply = await prisma.reply.findUnique({
          where: { id: finalParentId },
          include: {
            user: {
              select: { id: true, username: true }
            }
          }
        });

        if (parentReply) {
          // 通知被回复的用户
          if (parentReply.user.id !== userId) {
            await notificationService.createCommentReplyNotification(
              parentReply.user.id,
              userId,
              topicId,
              reply.id,
              finalParentId,
              replyAuthor.username
            );
          }
          
          // 同时通知主题作者（如果不是回复者本人且不是被回复的用户）
          if (reply.topic.user.id !== userId && reply.topic.user.id !== parentReply.user.id) {
            await notificationService.createTopicReplyNotification(
              reply.topic.user.id,
              userId,
              topicId,
              reply.id,
              reply.topic.title || '主题',
              replyAuthor.username
            );
          }
        }
      }
    } catch (notificationError) {
      console.error('发送通知失败:', notificationError);
      // 不影响回复创建的成功
    }

    res.status(201).json({
      success: true,
      data: reply
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 编辑回复
export const updateReply = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required'
      });
    }

    // 检查回复是否存在以及是否是作者
    const existingReply = await prisma.reply.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingReply) {
      return res.status(404).json({
        success: false,
        error: 'Reply not found'
      });
    }

    if (existingReply.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own replies'
      });
    }

    const updatedReply = await prisma.reply.update({
      where: { id },
      data: {
        content,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true, level: true }
        }
      }
    });

    res.json({
      success: true,
      data: updatedReply
    });
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 删除回复
export const deleteReply = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // 检查回复是否存在以及是否是作者
    const existingReply = await prisma.reply.findUnique({
      where: { id },
      select: { userId: true, topicId: true }
    });

    if (!existingReply) {
      return res.status(404).json({
        success: false,
        error: 'Reply not found'
      });
    }

    if (existingReply.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own replies'
      });
    }

    // 删除回复
    await prisma.reply.delete({
      where: { id }
    });

    // 更新主题的回复数量
    await prisma.topic.update({
      where: { id: existingReply.topicId },
      data: { replies: { decrement: 1 } }
    });

    res.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};