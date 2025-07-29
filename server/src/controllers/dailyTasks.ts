import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DailyTaskService } from '../services/dailyTaskService';

// 获取用户今日任务
export const getUserDailyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const tasks = await DailyTaskService.getUserDailyTasks(userId);
    
    // 计算完成统计
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        tasks,
        stats: {
          totalTasks,
          completedTasks,
          completionRate,
          remainingTasks: totalTasks - completedTasks
        }
      }
    });
  } catch (error) {
    console.error('获取每日任务失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取用户任务完成历史统计
export const getUserTaskStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { days = 7 } = req.query;
    
    const stats = await DailyTaskService.getUserTaskStats(userId, Number(days));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取任务统计失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 手动更新任务进度（用于测试）
export const updateTaskProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { taskType, increment = 1 } = req.body;
    
    if (!taskType) {
      return res.status(400).json({
        success: false,
        error: 'taskType is required'
      });
    }
    
    await DailyTaskService.updateTaskProgress(userId, taskType, increment);
    
    // 返回更新后的任务列表
    const tasks = await DailyTaskService.getUserDailyTasks(userId);
    
    res.json({
      success: true,
      data: tasks,
      message: '任务进度已更新'
    });
  } catch (error) {
    console.error('更新任务进度失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// 获取所有可用的每日任务模板
export const getAllDailyTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await DailyTaskService.getAllDailyTasks();
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('获取每日任务列表失败:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};