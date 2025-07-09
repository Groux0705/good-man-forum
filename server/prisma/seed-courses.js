const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createCourseData() {
  try {
    // 创建示例用户
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'mentor1@example.com' },
        update: {},
        create: {
          username: '情感导师Alex',
          email: 'mentor1@example.com',
          password: hashedPassword,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          bio: '专业情感咨询师，拥有8年恋爱指导经验',
          level: 5,
          balance: 500
        }
      }),
      prisma.user.upsert({
        where: { email: 'mentor2@example.com' },
        update: {},
        create: {
          username: '沟通专家Sarah',
          email: 'mentor2@example.com',
          password: hashedPassword,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9f23db8?w=150&h=150&fit=crop&crop=face',
          bio: '人际沟通专家，心理学硕士',
          level: 4,
          balance: 400
        }
      }),
      prisma.user.upsert({
        where: { email: 'mentor3@example.com' },
        update: {},
        create: {
          username: '自信教练Mike',
          email: 'mentor3@example.com',
          password: hashedPassword,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          bio: '自信心培养专家，帮助男性建立内在自信',
          level: 6,
          balance: 600
        }
      })
    ]);

    // 创建视频课程数据
    const videoCourses = [
      {
        title: '如何自然地开始第一次约会对话',
        description: '掌握约会开场白的艺术，让你的第一次约会不再尴尬。本视频将教你如何在约会初期建立轻松愉快的氛围，包括话题选择、肢体语言和应对冷场的技巧。',
        thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop',
        type: 'video',
        content: null,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        category: 'dating',
        tags: '约会,开场白,对话技巧,社交',
        duration: 720,
        difficulty: 'beginner',
        views: 12450,
        likes: 892,
        userId: users[0].id,
        published: true
      },
      {
        title: '建立深层情感连接的5个步骤',
        description: '深入了解如何与心仪的人建立真正的情感连接。通过心理学原理和实际案例，学习如何超越表面交流，创造有意义的关系。',
        thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=225&fit=crop',
        type: 'video',
        content: null,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        category: 'relationship',
        tags: '情感连接,关系建立,心理学,深度交流',
        duration: 1080,
        difficulty: 'intermediate',
        views: 8934,
        likes: 734,
        userId: users[1].id,
        published: true
      },
      {
        title: '自信肢体语言完全指南',
        description: '你的身体语言传达了什么信息？学习如何通过姿态、眼神接触和手势来展现自信，吸引他人注意。包含实用练习和常见错误分析。',
        thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop',
        type: 'video',
        content: null,
        videoUrl: 'https://www.bilibili.com/video/BV1234567890',
        platform: 'bilibili',
        category: 'self-improvement',
        tags: '肢体语言,自信,个人魅力,社交技巧',
        duration: 945,
        difficulty: 'beginner',
        views: 15672,
        likes: 1203,
        userId: users[2].id,
        published: true
      },
      {
        title: '处理拒绝的心理策略',
        description: '拒绝是生活的一部分，但如何优雅地处理它却是一门艺术。学习如何保持自尊、从拒绝中学习，并继续前进。',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
        type: 'video',
        content: null,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        category: 'psychology',
        tags: '拒绝处理,心理健康,自尊,情绪管理',
        duration: 825,
        difficulty: 'intermediate',
        views: 7231,
        likes: 567,
        userId: users[0].id,
        published: true
      },
      {
        title: '有效沟通：避免常见误解',
        description: '沟通不仅仅是说话，更是理解。学习如何清晰表达自己的想法，同时真正倾听对方，避免关系中的常见误解。',
        thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=225&fit=crop',
        type: 'video',
        content: null,
        videoUrl: 'https://www.bilibili.com/video/BV1234567891',
        platform: 'bilibili',
        category: 'communication',
        tags: '有效沟通,倾听技巧,误解避免,关系维护',
        duration: 1200,
        difficulty: 'intermediate',
        views: 9845,
        likes: 823,
        userId: users[1].id,
        published: true
      },
      {
        title: '第一印象：如何在30秒内吸引注意',
        description: '研究表明，人们在30秒内就会形成第一印象。学习如何通过着装、谈吐和行为举止来创造积极的第一印象。',
        thumbnail: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=225&fit=crop',
        type: 'video',
        content: null,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        platform: 'youtube',
        category: 'self-improvement',
        tags: '第一印象,个人形象,社交技巧,魅力提升',
        duration: 675,
        difficulty: 'beginner',
        views: 11234,
        likes: 945,
        userId: users[2].id,
        published: true
      }
    ];

    // 创建文字课程数据
    const textCourses = [
      {
        title: '恋爱心理学基础：理解情感动力',
        description: '深入探讨恋爱关系中的心理学原理，帮助你理解情感的本质和发展规律。',
        thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop',
        type: 'text',
        content: `# 恋爱心理学基础：理解情感动力

## 1. 情感的生物学基础

恋爱不仅仅是一种情感体验，更是一种复杂的生物学现象。当我们对某人产生好感时，大脑会释放多种化学物质：

### 多巴胺 - 奖励系统
- 产生愉悦感和兴奋感
- 驱动我们追求对方
- 创造"上瘾"般的感觉

### 血清素 - 情绪稳定
- 影响情绪和睡眠
- 水平降低时产生焦虑
- 解释为什么恋爱初期会失眠

### 催产素 - 情感连接
- 促进亲密关系建立
- 增强信任感
- 通过身体接触释放

## 2. 吸引力的心理机制

### 相似性原理
人们倾向于被与自己相似的人吸引：
- 价值观相似
- 兴趣爱好相近
- 社会背景相似

### 互补性原理
有时候，差异也会产生吸引：
- 性格互补
- 技能互补
- 经历互补

### 接近性效应
- 物理距离的重要性
- 频繁接触增加好感
- "曝光效应"的作用

## 3. 情感发展的阶段

### 第一阶段：激情期（0-18个月）
- 强烈的化学反应
- 理想化对方
- 忽视缺点

### 第二阶段：现实期（18个月-3年）
- 激情减退
- 发现对方缺点
- 关系面临考验

### 第三阶段：承诺期（3年以上）
- 理性与感性平衡
- 深层次的了解
- 长期承诺的建立

## 4. 健康关系的特征

### 情感独立
- 保持个人身份
- 不依赖对方获得自我价值
- 有自己的朋友圈和兴趣

### 有效沟通
- 开放诚实的交流
- 积极倾听
- 尊重不同观点

### 相互支持
- 支持对方的目标
- 共同面对挑战
- 庆祝彼此的成功

## 5. 常见的关系误区

### 误区一：爱情能改变一切
现实：基本性格很难改变，接受比改变更重要

### 误区二：完美的另一半存在
现实：每个人都有缺点，关键是能否接受

### 误区三：爱情应该毫不费力
现实：健康的关系需要持续的努力和经营

## 6. 实践建议

### 自我提升
1. 了解自己的情感需求
2. 培养独立的人格
3. 学会管理情绪

### 关系建立
1. 真诚地表达自己
2. 给对方空间和时间
3. 建立共同的兴趣

### 关系维护
1. 保持新鲜感
2. 定期沟通感受
3. 共同成长

---

**总结：** 理解恋爱心理学能帮助我们更好地认识自己和他人，建立更健康、更持久的情感关系。记住，爱情不仅仅是感觉，更是一种能力和智慧。`,
        videoUrl: null,
        platform: null,
        category: 'relationship',
        tags: '心理学,恋爱,情感,关系建立',
        duration: 900, // 估算阅读时间15分钟
        difficulty: 'intermediate',
        views: 5432,
        likes: 423,
        userId: users[1].id,
        published: true
      },
      {
        title: '社交技巧提升指南：从内向到外向',
        description: '专为内向者设计的社交技巧提升指南，帮助你在社交场合中更加自信和从容。',
        thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=225&fit=crop',
        type: 'text',
        content: `# 社交技巧提升指南：从内向到外向

## 理解内向性格

### 内向≠害羞
- 内向：从独处中获得能量
- 害羞：对社交的恐惧
- 两者可以同时存在，但本质不同

### 内向者的优势
- 深度思考能力
- 优秀的倾听技巧
- 高质量的人际关系
- 强烈的同理心

## 社交技巧训练

### 1. 准备阶段
- 设定现实的目标
- 选择合适的社交场合
- 准备话题和问题

### 2. 开始对话
- 使用开放式问题
- 寻找共同点
- 表现出真诚的兴趣

### 3. 维持对话
- 积极倾听
- 适时提问
- 分享相关经历

### 4. 结束对话
- 礼貌地结束
- 交换联系方式
- 后续跟进

## 实践练习

### 每日挑战
- 和一个陌生人打招呼
- 参加一个小型聚会
- 主动发起对话

### 技能建设
- 练习自我介绍
- 学习肢体语言
- 提高情商

---

通过持续的练习和自我提升，内向者也能成为社交高手。关键是要接受自己的性格，并在此基础上发展技能。`,
        videoUrl: null,
        platform: null,
        category: 'communication',
        tags: '社交技巧,内向,沟通,自信',
        duration: 720, // 估算阅读时间12分钟
        difficulty: 'beginner',
        views: 3210,
        likes: 256,
        userId: users[0].id,
        published: true
      },
      {
        title: '自信建设的30天挑战',
        description: '通过30天的系统化训练，逐步建立内在自信，改变你的人生轨迹。',
        thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop',
        type: 'text',
        content: `# 自信建设的30天挑战

## 第1周：认识自己

### 第1天：自我评估
- 列出你的优点和缺点
- 识别限制性信念
- 设定挑战目标

### 第2天：正念练习
- 10分钟冥想
- 观察内心对话
- 记录负面思维

### 第3天：成功回忆
- 回忆过去的成功经历
- 分析成功的要素
- 建立积极的自我形象

### 第4天：身体语言练习
- 练习正确的坐姿和站姿
- 学习眼神接触
- 训练自信的握手

### 第5天：声音训练
- 练习清晰的发音
- 学习控制语速
- 培养有力的语调

### 第6天：着装改进
- 评估当前穿着风格
- 选择提升自信的服装
- 注意个人卫生

### 第7天：周总结
- 回顾本周进步
- 调整下周计划
- 庆祝小胜利

## 第2周：行动起来

### 第8天：舒适圈挑战
- 做一件让你紧张的事
- 记录感受和结果
- 分析学到的教训

### 第9天：社交练习
- 主动和三个人对话
- 练习自我介绍
- 观察他人反应

### 第10天：技能展示
- 向他人展示你的技能
- 接受赞美
- 分享知识和经验

### 第11天：说"不"的练习
- 拒绝不合理的请求
- 坚持自己的立场
- 保持礼貌但坚定

### 第12天：领导力练习
- 在小组中承担领导角色
- 做决策并承担责任
- 激励他人

### 第13天：公开演讲
- 在小群体中发言
- 表达自己的观点
- 处理紧张情绪

### 第14天：中期总结
- 评估自信水平变化
- 调整剩余计划
- 设定新的挑战

## 第3周：深化练习

### 第15天：情绪管理
- 学习处理批评
- 练习保持冷静
- 转化负面情绪

### 第16天：目标设定
- 设定具体的短期目标
- 制定行动计划
- 跟踪进度

### 第17天：网络建设
- 主动联系老朋友
- 结识新的朋友
- 扩展社交圈

### 第18天：创造性表达
- 尝试新的爱好
- 表达创意想法
- 接受不完美

### 第19天：帮助他人
- 主动提供帮助
- 分享经验和建议
- 建立良好关系

### 第20天：面对恐惧
- 识别最大的恐惧
- 制定应对策略
- 小步骤面对恐惧

### 第21天：三周总结
- 庆祝进步
- 分析剩余挑战
- 调整最后一周计划

## 第4周：巩固成果

### 第22天：自我欣赏
- 写下自己的进步
- 给自己积极的反馈
- 培养自我关爱

### 第23天：建立习惯
- 识别有益的新习惯
- 制定维持计划
- 设定提醒机制

### 第24天：处理挫折
- 回顾遇到的挫折
- 学习从失败中成长
- 建立复原力

### 第25天：长期规划
- 设定长期自信目标
- 制定6个月计划
- 寻找支持系统

### 第26天：感恩练习
- 列出感恩的事情
- 感谢帮助过你的人
- 培养积极心态

### 第27天：分享经验
- 和他人分享挑战经历
- 鼓励他人成长
- 建立互助关系

### 第28天：未来愿景
- 描绘理想的自己
- 设定实现步骤
- 保持动力

### 第29天：整合学习
- 总结30天的学习
- 识别关键转折点
- 制定维持计划

### 第30天：新的开始
- 庆祝完成挑战
- 设定新的目标
- 开始新的旅程

## 成功维持自信的秘诀

### 日常实践
1. 每天的积极肯定
2. 定期的自我反思
3. 持续的学习和成长

### 应对挫折
1. 接受失败是成长的一部分
2. 从错误中学习
3. 保持长远的视角

### 建立支持系统
1. 寻找志同道合的朋友
2. 寻求专业帮助
3. 加入成长小组

---

**记住：** 自信不是一夜之间建立的，而是通过持续的努力和实践逐步发展的。这30天只是一个开始，真正的成长需要终身的承诺。`,
        videoUrl: null,
        platform: null,
        category: 'self-improvement',
        tags: '自信,挑战,成长,训练',
        duration: 1200, // 估算阅读时间20分钟
        difficulty: 'intermediate',
        views: 7890,
        likes: 654,
        userId: users[2].id,
        published: true
      }
    ];

    // 插入所有课程数据
    const allCourses = [...videoCourses, ...textCourses];
    
    for (const course of allCourses) {
      await prisma.course.create({
        data: course
      });
    }

    // 创建一些课程评论
    const courseRecords = await prisma.course.findMany();
    const commentData = [
      {
        content: '这个课程真的很有帮助！我按照你的建议实践，效果很好。',
        courseId: courseRecords[0].id,
        userId: users[1].id
      },
      {
        content: '讲得非常详细，特别是心理学部分，学到了很多。',
        courseId: courseRecords[6].id,
        userId: users[0].id
      },
      {
        content: '30天挑战真的改变了我的生活！现在更有自信了。',
        courseId: courseRecords[8].id,
        userId: users[1].id
      },
      {
        content: '作为一个内向的人，这个课程对我来说太有价值了。谢谢！',
        courseId: courseRecords[7].id,
        userId: users[2].id
      }
    ];

    for (const comment of commentData) {
      await prisma.courseComment.create({
        data: comment
      });
    }

    console.log('课程测试数据创建完成！');
    console.log(`创建了 ${videoCourses.length} 个视频课程和 ${textCourses.length} 个文字课程`);
    console.log(`创建了 ${commentData.length} 个评论`);
    
  } catch (error) {
    console.error('创建数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCourseData();