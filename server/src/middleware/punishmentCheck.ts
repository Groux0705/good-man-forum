import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    role: string;
    status: string;
  } | any;
}

// 检查用户是否被封禁
export const checkBanStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next();
    }

    // 检查用户状态
    if (req.user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: '您的账号已被封禁，无法进行此操作',
        code: 'USER_BANNED'
      });
    }

    // 检查是否有活跃的封禁处罚
    const activeBan = await prisma.userPunishment.findFirst({
      where: {
        userId: req.user.id,
        type: 'ban',
        status: 'active',
        OR: [
          { endTime: null }, // 永久封禁
          { endTime: { gt: new Date() } } // 临时封禁未过期
        ]
      }
    });

    if (activeBan) {
      return res.status(403).json({
        success: false,
        message: activeBan.endTime 
          ? `您的账号已被封禁至 ${activeBan.endTime.toLocaleString('zh-CN')}，无法进行此操作`
          : '您的账号已被永久封禁，无法进行此操作',
        code: 'USER_BANNED',
        punishment: {
          type: activeBan.type,
          reason: activeBan.reason,
          endTime: activeBan.endTime,
          startTime: activeBan.startTime
        }
      });
    }

    next();
  } catch (error) {
    console.error('Ban status check error:', error);
    next();
  }
};

// 检查用户是否被禁言
export const checkMuteStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next();
    }

    // 检查用户状态
    if (req.user.status === 'muted') {
      return res.status(403).json({
        success: false,
        message: '您已被禁言，无法发布内容',
        code: 'USER_MUTED'
      });
    }

    // 检查是否有活跃的禁言处罚
    const activeMute = await prisma.userPunishment.findFirst({
      where: {
        userId: req.user.id,
        type: 'mute',
        status: 'active',
        OR: [
          { endTime: null }, // 永久禁言
          { endTime: { gt: new Date() } } // 临时禁言未过期
        ]
      }
    });

    if (activeMute) {
      return res.status(403).json({
        success: false,
        message: activeMute.endTime 
          ? `您已被禁言至 ${activeMute.endTime.toLocaleString('zh-CN')}，无法发布内容`
          : '您已被永久禁言，无法发布内容',
        code: 'USER_MUTED',
        punishment: {
          type: activeMute.type,
          reason: activeMute.reason,
          endTime: activeMute.endTime,
          startTime: activeMute.startTime
        }
      });
    }

    next();
  } catch (error) {
    console.error('Mute status check error:', error);
    next();
  }
};

// 检查用户是否被暂停
export const checkSuspendStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next();
    }

    // 检查用户状态
    if (req.user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: '您的账号已被暂停，功能受限',
        code: 'USER_SUSPENDED'
      });
    }

    // 检查是否有活跃的暂停处罚
    const activeSuspend = await prisma.userPunishment.findFirst({
      where: {
        userId: req.user.id,
        type: 'suspend',
        status: 'active',
        OR: [
          { endTime: null }, // 永久暂停
          { endTime: { gt: new Date() } } // 临时暂停未过期
        ]
      }
    });

    if (activeSuspend) {
      return res.status(403).json({
        success: false,
        message: activeSuspend.endTime 
          ? `您的账号已被暂停至 ${activeSuspend.endTime.toLocaleString('zh-CN')}，功能受限`
          : '您的账号已被永久暂停，功能受限',
        code: 'USER_SUSPENDED',
        punishment: {
          type: activeSuspend.type,
          reason: activeSuspend.reason,
          endTime: activeSuspend.endTime,
          startTime: activeSuspend.startTime
        }
      });
    }

    next();
  } catch (error) {
    console.error('Suspend status check error:', error);
    next();
  }
};

// 综合处罚状态检查
export const checkPunishmentStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next();
    }

    // 获取用户所有活跃处罚
    const activePunishments = await prisma.userPunishment.findMany({
      where: {
        userId: req.user.id,
        status: 'active',
        OR: [
          { endTime: null }, // 永久处罚
          { endTime: { gt: new Date() } } // 临时处罚未过期
        ]
      },
      orderBy: { severity: 'desc' } // 按严重程度排序
    });

    if (activePunishments.length === 0) {
      return next();
    }

    // 检查最严重的处罚
    const mostSeverePunishment = activePunishments[0];
    
    let message = '';
    let code = '';
    
    switch (mostSeverePunishment.type) {
      case 'ban':
        message = mostSeverePunishment.endTime 
          ? `您的账号已被封禁至 ${mostSeverePunishment.endTime.toLocaleString('zh-CN')}，无法进行此操作`
          : '您的账号已被永久封禁，无法进行此操作';
        code = 'USER_BANNED';
        break;
      case 'mute':
        message = mostSeverePunishment.endTime 
          ? `您已被禁言至 ${mostSeverePunishment.endTime.toLocaleString('zh-CN')}，无法发布内容`
          : '您已被永久禁言，无法发布内容';
        code = 'USER_MUTED';
        break;
      case 'suspend':
        message = mostSeverePunishment.endTime 
          ? `您的账号已被暂停至 ${mostSeverePunishment.endTime.toLocaleString('zh-CN')}，功能受限`
          : '您的账号已被永久暂停，功能受限';
        code = 'USER_SUSPENDED';
        break;
      case 'warning':
        // 警告不阻止操作，只记录
        return next();
      default:
        return next();
    }

    return res.status(403).json({
      success: false,
      message,
      code,
      punishment: {
        type: mostSeverePunishment.type,
        reason: mostSeverePunishment.reason,
        endTime: mostSeverePunishment.endTime,
        startTime: mostSeverePunishment.startTime,
        severity: mostSeverePunishment.severity
      },
      activePunishments: activePunishments.map(p => ({
        type: p.type,
        reason: p.reason,
        endTime: p.endTime,
        startTime: p.startTime,
        severity: p.severity
      }))
    });
    
  } catch (error) {
    console.error('Punishment status check error:', error);
    next();
  }
};

// 自动处理过期处罚
export const cleanExpiredPunishments = async () => {
  try {
    const now = new Date();
    
    // 查找所有过期的处罚
    const expiredPunishments = await prisma.userPunishment.findMany({
      where: {
        status: 'active',
        endTime: {
          not: null,
          lte: now
        }
      },
      include: {
        user: true
      }
    });

    console.log(`Found ${expiredPunishments.length} expired punishments to process`);

    for (const punishment of expiredPunishments) {
      await prisma.$transaction(async (tx) => {
        // 更新处罚状态为过期
        await tx.userPunishment.update({
          where: { id: punishment.id },
          data: { status: 'expired' }
        });

        // 检查用户是否还有其他活跃处罚
        const remainingPunishments = await tx.userPunishment.findMany({
          where: {
            userId: punishment.userId,
            status: 'active',
            OR: [
              { endTime: null },
              { endTime: { gt: now } }
            ]
          }
        });

        // 如果没有其他活跃处罚，恢复用户正常状态
        if (remainingPunishments.length === 0) {
          await tx.user.update({
            where: { id: punishment.userId },
            data: { status: 'active' }
          });
          
          console.log(`User ${punishment.user.username} restored to active status`);
        } else {
          // 如果还有其他处罚，更新用户状态为最严重的处罚类型
          const mostSevere = remainingPunishments.reduce((prev, current) => 
            (current.severity || 1) > (prev.severity || 1) ? current : prev
          );
          
          let newStatus = 'active';
          if (mostSevere.type === 'ban') newStatus = 'banned';
          else if (mostSevere.type === 'mute') newStatus = 'muted';
          else if (mostSevere.type === 'suspend') newStatus = 'suspended';
          
          await tx.user.update({
            where: { id: punishment.userId },
            data: { status: newStatus }
          });
          
          console.log(`User ${punishment.user.username} status updated to ${newStatus}`);
        }
      });
    }
    
    if (expiredPunishments.length > 0) {
      console.log(`Processed ${expiredPunishments.length} expired punishments`);
    }
    
  } catch (error) {
    console.error('Error cleaning expired punishments:', error);
  }
};

// 启动定时清理任务
export const startPunishmentCleanupJob = () => {
  // 每分钟检查一次过期处罚
  setInterval(cleanExpiredPunishments, 60 * 1000);
  
  // 启动时立即执行一次
  cleanExpiredPunishments();
  
  console.log('Punishment cleanup job started');
};