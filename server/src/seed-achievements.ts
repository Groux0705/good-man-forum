import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAchievements() {
  console.log('开始初始化勋章、每日任务和专属标识数据...');

  // 清理现有数据
  await prisma.userBadge.deleteMany();
  await prisma.dailyTaskProgress.deleteMany();
  await prisma.userSpecialTag.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.dailyTask.deleteMany();
  await prisma.specialTag.deleteMany();

  // 创建勋章
  const badges = [
    // 活动勋章
    {
      name: 'first_post',
      title: '初出茅庐',
      description: '发布你的第一个主题',
      icon: '🌱',
      category: 'activity',
      rarity: 'common',
      condition: JSON.stringify({ type: 'post_count', target: 1 }),
      points: 50,
      experience: 50,
      order: 1
    },
    {
      name: 'frequent_poster',
      title: '活跃发帖者',
      description: '发布10个主题',
      icon: '📝',
      category: 'activity',
      rarity: 'common',
      condition: JSON.stringify({ type: 'post_count', target: 10 }),
      points: 100,
      experience: 100,
      order: 2
    },
    {
      name: 'prolific_author',
      title: '多产作者',
      description: '发布50个主题',
      icon: '✍️',
      category: 'activity',
      rarity: 'rare',
      condition: JSON.stringify({ type: 'post_count', target: 50 }),
      points: 300,
      experience: 300,
      order: 3
    },
    {
      name: 'discussion_starter',
      title: '话题发起者',
      description: '发布100个主题',
      icon: '🎯',
      category: 'activity',
      rarity: 'epic',
      condition: JSON.stringify({ type: 'post_count', target: 100 }),
      points: 500,
      experience: 500,
      order: 4
    },

    // 回复勋章
    {
      name: 'first_reply',
      title: '初次回复',
      description: '发表你的第一个回复',
      icon: '💬',
      category: 'activity',
      rarity: 'common',
      condition: JSON.stringify({ type: 'reply_count', target: 1 }),
      points: 25,
      experience: 25,
      order: 5
    },
    {
      name: 'active_replier',
      title: '活跃回复者',
      description: '发表50个回复',
      icon: '🗨️',
      category: 'activity',
      rarity: 'common',
      condition: JSON.stringify({ type: 'reply_count', target: 50 }),
      points: 150,
      experience: 150,
      order: 6
    },
    {
      name: 'comment_master',
      title: '回复达人',
      description: '发表200个回复',
      icon: '💭',
      category: 'activity',
      rarity: 'rare',
      condition: JSON.stringify({ type: 'reply_count', target: 200 }),
      points: 400,
      experience: 400,
      order: 7
    },

    // 点赞勋章
    {
      name: 'popular_content',
      title: '人气内容',
      description: '获得100个点赞',
      icon: '❤️',
      category: 'achievement',
      rarity: 'rare',
      condition: JSON.stringify({ type: 'like_count', target: 100 }),
      points: 200,
      experience: 200,
      order: 8
    },
    {
      name: 'beloved_author',
      title: '受欢迎作者',
      description: '获得500个点赞',
      icon: '💖',
      category: 'achievement',
      rarity: 'epic',
      condition: JSON.stringify({ type: 'like_count', target: 500 }),
      points: 600,
      experience: 600,
      order: 9
    },

    // 等级勋章
    {
      name: 'level_5',
      title: '崭露头角',
      description: '达到5级',
      icon: '⭐',
      category: 'achievement',
      rarity: 'common',
      condition: JSON.stringify({ type: 'level', target: 5 }),
      points: 100,
      experience: 100,
      order: 10
    },
    {
      name: 'level_10',
      title: '小有名气',
      description: '达到10级',
      icon: '🌟',
      category: 'achievement',
      rarity: 'rare',
      condition: JSON.stringify({ type: 'level', target: 10 }),
      points: 250,
      experience: 250,
      order: 11
    },
    {
      name: 'level_20',
      title: '声名远扬',
      description: '达到20级',
      icon: '💫',
      category: 'achievement',
      rarity: 'epic',
      condition: JSON.stringify({ type: 'level', target: 20 }),
      points: 500,
      experience: 500,
      order: 12
    },

    // 签到勋章
    {
      name: 'week_checkin',
      title: '一周坚持',
      description: '连续签到7天',
      icon: '📅',
      category: 'time',
      rarity: 'common',
      condition: JSON.stringify({ type: 'consecutive_checkin', target: 7 }),
      points: 100,
      experience: 100,
      order: 13
    },
    {
      name: 'month_checkin',
      title: '月度达人',
      description: '连续签到30天',
      icon: '🗓️',
      category: 'time',
      rarity: 'rare',
      condition: JSON.stringify({ type: 'consecutive_checkin', target: 30 }),
      points: 500,
      experience: 500,
      order: 14
    },
    {
      name: 'persistent_user',
      title: '坚持不懈',
      description: '连续签到100天',
      icon: '🏆',
      category: 'time',
      rarity: 'legendary',
      condition: JSON.stringify({ type: 'consecutive_checkin', target: 100 }),
      points: 1000,
      experience: 1000,
      order: 15
    }
  ];

  console.log('创建勋章...');
  for (const badge of badges) {
    await prisma.badge.create({ data: badge });
  }

  // 创建每日任务
  const dailyTasks = [
    {
      name: 'daily_post',
      title: '每日发帖',
      description: '今天发布1个主题',
      icon: '📝',
      category: 'social',
      target: 1,
      type: 'post',
      points: 20,
      experience: 20,
      order: 1
    },
    {
      name: 'daily_reply',
      title: '积极回复',
      description: '今天发表3个回复',
      icon: '💬',
      category: 'social',
      target: 3,
      type: 'reply',
      points: 15,
      experience: 15,
      order: 2
    },
    {
      name: 'daily_like',
      title: '点赞互动',
      description: '今天点赞5个主题',
      icon: '❤️',
      category: 'social',
      target: 5,
      type: 'like',
      points: 10,
      experience: 10,
      order: 3
    },
    {
      name: 'daily_checkin',
      title: '每日签到',
      description: '完成今日签到',
      icon: '📅',
      category: 'activity',
      target: 1,
      type: 'checkin',
      points: 5,
      experience: 5,
      order: 4
    },
    {
      name: 'daily_learning',
      title: '学习时光',
      description: '今天学习课程30分钟',
      icon: '📚',
      category: 'learning',
      target: 30,
      type: 'course_time',
      points: 25,
      experience: 25,
      order: 5
    }
  ];

  console.log('创建每日任务...');
  for (const task of dailyTasks) {
    await prisma.dailyTask.create({ data: task });
  }

  // 创建专属标识
  const specialTags = [
    {
      name: 'admin',
      title: '管理员',
      description: '网站管理员专属标识',
      icon: '👑',
      color: '#DC2626',
      category: 'admin',
      privileges: JSON.stringify({
        list: ['管理用户', '删除内容', '修改设置', '查看统计']
      }),
      permanent: true,
      order: 1
    },
    {
      name: 'moderator',
      title: '版主',
      description: '版块版主专属标识',
      icon: '🛡️',
      color: '#7C3AED',
      category: 'admin',
      privileges: JSON.stringify({
        list: ['删除回复', '置顶主题', '管理版块']
      }),
      permanent: true,
      order: 2
    },
    {
      name: 'vip',
      title: 'VIP会员',
      description: 'VIP用户专属标识',
      icon: '💎',
      color: '#F59E0B',
      category: 'vip',
      privileges: JSON.stringify({
        list: ['专属徽章', '优先回复', '专属头像框']
      }),
      condition: JSON.stringify({ type: 'vip', special: 'manual' }),
      permanent: false,
      duration: 365,
      order: 3
    },
    {
      name: 'active_user',
      title: '活跃用户',
      description: '活跃用户专属标识',
      icon: '🔥',
      color: '#EF4444',
      category: 'achievement',
      condition: JSON.stringify({ type: 'level', target: 10 }),
      permanent: true,
      order: 4
    },
    {
      name: 'badge_collector',
      title: '勋章收集家',
      description: '收集10个勋章的用户',
      icon: '🏅',
      color: '#10B981',
      category: 'achievement',
      condition: JSON.stringify({ type: 'badge_count', target: 10 }),
      permanent: true,
      order: 5
    },
    {
      name: 'early_bird',
      title: '早期用户',
      description: '网站早期注册用户',
      icon: '🐦',
      color: '#3B82F6',
      category: 'special',
      permanent: true,
      order: 6
    }
  ];

  console.log('创建专属标识...');
  for (const tag of specialTags) {
    await prisma.specialTag.create({ data: tag });
  }

  console.log('成就系统初始化完成！');
  console.log(`创建了 ${badges.length} 个勋章`);
  console.log(`创建了 ${dailyTasks.length} 个每日任务`);
  console.log(`创建了 ${specialTags.length} 个专属标识`);
}

seedAchievements()
  .catch((e) => {
    console.error('初始化成就系统失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });