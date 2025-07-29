import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DailyTaskService {
  // 获取今天的日期字符串
  private static getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  // 初始化用户今日任务
  static async initializeDailyTasks(userId: string): Promise<void> {
    try {
      const today = this.getTodayString();
      
      // 获取所有激活的每日任务
      const tasks = await prisma.dailyTask.findMany({
        where: { active: true }
      });

      // 为每个任务创建今日进度记录（如果不存在）
      for (const task of tasks) {
        await prisma.dailyTaskProgress.upsert({
          where: {
            userId_taskId_date: {
              userId,
              taskId: task.id,
              date: today
            }
          },
          update: {}, // 如果存在则不更新
          create: {
            userId,
            taskId: task.id,
            date: today,
            progress: 0,
            completed: false
          }
        });
      }
    } catch (error) {
      console.error('初始化每日任务失败:', error);
    }
  }

  // 更新任务进度
  static async updateTaskProgress(
    userId: string, 
    taskType: string, 
    increment: number = 1
  ): Promise<void> {
    try {
      const today = this.getTodayString();
      
      // 获取对应类型的任务
      const tasks = await prisma.dailyTask.findMany({
        where: { 
          active: true,
          type: taskType
        }
      });

      for (const task of tasks) {
        // 获取当前进度
        const progress = await prisma.dailyTaskProgress.findUnique({
          where: {
            userId_taskId_date: {
              userId,
              taskId: task.id,
              date: today
            }
          }
        });

        if (!progress) {
          // 如果进度记录不存在，先初始化
          await this.initializeDailyTasks(userId);
          continue;
        }

        if (progress.completed) {
          continue; // 已完成，跳过
        }

        // 更新进度
        const newProgress = Math.min(progress.progress + increment, task.target);
        const completed = newProgress >= task.target;

        await prisma.dailyTaskProgress.update({
          where: {
            id: progress.id
          },
          data: {
            progress: newProgress,
            completed
          }
        });

        // 如果任务完成，奖励积分和经验值
        if (completed && !progress.completed) {
          const { PointService } = await import('./pointService');
          await PointService.addPoints({
            userId,
            type: 'daily_task',
            amount: task.points,
            reason: `完成每日任务：${task.title}`,
            relatedId: task.id,
            relatedType: 'daily_task'
          });

          // 检查是否可以获得新勋章
          const { BadgeService } = await import('./badgeService');
          await BadgeService.checkAndAwardBadges(userId);
        }
      }
    } catch (error) {
      console.error('更新任务进度失败:', error);
    }
  }

  // 获取用户今日任务进度
  static async getUserDailyTasks(userId: string) {
    try {
      const today = this.getTodayString();
      
      // 先确保任务已初始化
      await this.initializeDailyTasks(userId);
      
      // 获取今日任务进度
      const taskProgress = await prisma.dailyTaskProgress.findMany({
        where: {
          userId,
          date: today
        },
        include: {
          task: true
        },
        orderBy: {
          task: {
            order: 'asc'
          }
        }
      });

      return taskProgress.map(tp => ({
        id: tp.id,
        task: tp.task,
        progress: tp.progress,
        completed: tp.completed,
        progressPercent: Math.round((tp.progress / tp.task.target) * 100)
      }));
    } catch (error) {
      console.error('获取用户每日任务失败:', error);
      return [];
    }
  }

  // 获取用户每日任务完成统计
  static async getUserTaskStats(userId: string, days: number = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
      
      const stats = await prisma.dailyTaskProgress.groupBy({
        by: ['date'],
        where: {
          userId,
          date: {
            gte: startDate.toISOString().split('T')[0],
            lte: endDate.toISOString().split('T')[0]
          }
        },
        _count: {
          id: true,
          completed: true
        }
      });

      // Get completed tasks count separately for each date
      const completedStats = await prisma.dailyTaskProgress.groupBy({
        by: ['date'],
        where: {
          userId,
          completed: true,
          date: {
            gte: startDate.toISOString().split('T')[0],
            lte: endDate.toISOString().split('T')[0]
          }
        },
        _count: {
          id: true
        }
      });

      const completedMap = new Map(completedStats.map(stat => [stat.date, stat._count?.id || 0]));

      return stats.map(stat => {
        const totalTasks = stat._count?.id || 0;
        const completedTasks = completedMap.get(stat.date) || 0;
        return {
          date: stat.date,
          totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        };
      });
    } catch (error) {
      console.error('获取任务统计失败:', error);
      return [];
    }
  }

  // 管理员：创建每日任务
  static async createDailyTask(taskData: {
    name: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    target: number;
    type: string;
    points: number;
    experience: number;
    order?: number;
  }) {
    try {
      return await prisma.dailyTask.create({
        data: {
          ...taskData,
          order: taskData.order || 0
        }
      });
    } catch (error) {
      console.error('创建每日任务失败:', error);
      throw error;
    }
  }

  // 管理员：获取所有每日任务
  static async getAllDailyTasks() {
    try {
      return await prisma.dailyTask.findMany({
        orderBy: [
          { category: 'asc' },
          { order: 'asc' },
          { createdAt: 'asc' }
        ]
      });
    } catch (error) {
      console.error('获取每日任务列表失败:', error);
      return [];
    }
  }

  // 处理用户行为，更新相关任务进度
  static async handleUserAction(userId: string, action: string, data?: any): Promise<void> {
    switch (action) {
      case 'post_created':
        await this.updateTaskProgress(userId, 'post', 1);
        break;
      
      case 'reply_created':
        await this.updateTaskProgress(userId, 'reply', 1);
        break;
      
      case 'like_given':
        await this.updateTaskProgress(userId, 'like', 1);
        break;
      
      case 'checkin':
        await this.updateTaskProgress(userId, 'checkin', 1);
        break;
      
      case 'course_time':
        // data应该包含学习时长（分钟）
        if (data && data.minutes) {
          await this.updateTaskProgress(userId, 'course_time', data.minutes);
        }
        break;
      
      default:
        console.log(`未处理的用户行为: ${action}`);
    }
  }
}