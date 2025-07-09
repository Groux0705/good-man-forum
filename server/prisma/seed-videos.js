const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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

  // 创建视频数据
  const videos = [
    {
      title: '如何自然地开始第一次约会对话',
      description: '掌握约会开场白的艺术，让你的第一次约会不再尴尬。本视频将教你如何在约会初期建立轻松愉快的氛围，包括话题选择、肢体语言和应对冷场的技巧。',
      thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      category: 'dating',
      tags: '约会,开场白,对话技巧,社交',
      duration: 720,
      views: 12450,
      likes: 892,
      userId: users[0].id,
      published: true
    },
    {
      title: '建立深层情感连接的5个步骤',
      description: '深入了解如何与心仪的人建立真正的情感连接。通过心理学原理和实际案例，学习如何超越表面交流，创造有意义的关系。',
      thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=225&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      category: 'relationship',
      tags: '情感连接,关系建立,心理学,深度交流',
      duration: 1080,
      views: 8934,
      likes: 734,
      userId: users[1].id,
      published: true
    },
    {
      title: '自信肢体语言完全指南',
      description: '你的身体语言传达了什么信息？学习如何通过姿态、眼神接触和手势来展现自信，吸引他人注意。包含实用练习和常见错误分析。',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop',
      videoUrl: 'https://www.bilibili.com/video/BV1234567890',
      platform: 'bilibili',
      category: 'self-improvement',
      tags: '肢体语言,自信,个人魅力,社交技巧',
      duration: 945,
      views: 15672,
      likes: 1203,
      userId: users[2].id,
      published: true
    },
    {
      title: '处理拒绝的心理策略',
      description: '拒绝是生活的一部分，但如何优雅地处理它却是一门艺术。学习如何保持自尊、从拒绝中学习，并继续前进。',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      category: 'psychology',
      tags: '拒绝处理,心理健康,自尊,情绪管理',
      duration: 825,
      views: 7231,
      likes: 567,
      userId: users[0].id,
      published: true
    },
    {
      title: '有效沟通：避免常见误解',
      description: '沟通不仅仅是说话，更是理解。学习如何清晰表达自己的想法，同时真正倾听对方，避免关系中的常见误解。',
      thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=225&fit=crop',
      videoUrl: 'https://www.bilibili.com/video/BV1234567891',
      platform: 'bilibili',
      category: 'communication',
      tags: '有效沟通,倾听技巧,误解避免,关系维护',
      duration: 1200,
      views: 9845,
      likes: 823,
      userId: users[1].id,
      published: true
    },
    {
      title: '第一印象：如何在30秒内吸引注意',
      description: '研究表明，人们在30秒内就会形成第一印象。学习如何通过着装、谈吐和行为举止来创造积极的第一印象。',
      thumbnail: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=225&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      category: 'self-improvement',
      tags: '第一印象,个人形象,社交技巧,魅力提升',
      duration: 675,
      views: 11234,
      likes: 945,
      userId: users[2].id,
      published: true
    },
    {
      title: '长期关系中的浪漫维持',
      description: '如何在长期关系中保持激情和浪漫？探讨维持长期关系活力的策略，包括惊喜、沟通和个人成长。',
      thumbnail: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=400&h=225&fit=crop',
      videoUrl: 'https://www.bilibili.com/video/BV1234567892',
      platform: 'bilibili',
      category: 'relationship',
      tags: '长期关系,浪漫维持,情感管理,关系成长',
      duration: 1350,
      views: 6789,
      likes: 512,
      userId: users[0].id,
      published: true
    },
    {
      title: '冲突解决：化解争吵的艺术',
      description: '争吵是关系中不可避免的，但如何处理争吵却决定了关系的质量。学习建设性的冲突解决技巧。',
      thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=225&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      category: 'communication',
      tags: '冲突解决,争吵处理,关系修复,沟通技巧',
      duration: 990,
      views: 8456,
      likes: 687,
      userId: users[1].id,
      published: true
    },
    {
      title: '社交焦虑克服指南',
      description: '社交焦虑影响着很多人的生活质量。本视频提供实用的策略来克服社交恐惧，建立自信的社交技能。',
      thumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=225&fit=crop',
      videoUrl: 'https://www.bilibili.com/video/BV1234567893',
      platform: 'bilibili',
      category: 'psychology',
      tags: '社交焦虑,自信建立,心理健康,社交技能',
      duration: 1125,
      views: 13567,
      likes: 1089,
      userId: users[2].id,
      published: true
    },
    {
      title: '约会礼仪：现代绅士指南',
      description: '现代约会中的礼仪规范是什么？从邀请到结束，学习如何成为一位体贴的约会伴侣，展现真正的绅士风度。',
      thumbnail: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=225&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      category: 'dating',
      tags: '约会礼仪,绅士风度,约会技巧,社交礼仪',
      duration: 780,
      views: 9876,
      likes: 745,
      userId: users[0].id,
      published: true
    },
    {
      title: '情商提升：理解和管理情绪',
      description: '情商在人际关系中的重要性不言而喻。学习如何识别、理解和管理自己的情绪，以及如何回应他人的情绪。',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=225&fit=crop',
      videoUrl: 'https://www.bilibili.com/video/BV1234567894',
      platform: 'bilibili',
      category: 'self-improvement',
      tags: '情商提升,情绪管理,自我认知,人际关系',
      duration: 1260,
      views: 10234,
      likes: 834,
      userId: users[1].id,
      published: true
    },
    {
      title: '非语言沟通的秘密',
      description: '55%的沟通是通过肢体语言进行的。深入了解非语言沟通的各个方面，包括微表情、姿态和声音语调。',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      platform: 'youtube',
      category: 'communication',
      tags: '非语言沟通,肢体语言,微表情,沟通技巧',
      duration: 1080,
      views: 7654,
      likes: 589,
      userId: users[2].id,
      published: true
    }
  ];

  // 插入视频数据
  for (const video of videos) {
    await prisma.video.create({
      data: video
    });
  }

  // 创建一些视频评论
  const videoRecords = await prisma.video.findMany();
  const commentData = [
    {
      content: '这个视频真的很有帮助！我按照你的建议去约会，效果很好。',
      videoId: videoRecords[0].id,
      userId: users[1].id
    },
    {
      content: '讲得非常详细，特别是关于肢体语言的部分，学到了很多。',
      videoId: videoRecords[2].id,
      userId: users[0].id
    },
    {
      content: '能不能出一个关于长期关系维护的系列视频？',
      videoId: videoRecords[6].id,
      userId: users[2].id
    },
    {
      content: '作为一个内向的人，这个视频对我来说太有价值了。谢谢！',
      videoId: videoRecords[8].id,
      userId: users[0].id
    }
  ];

  for (const comment of commentData) {
    await prisma.videoComment.create({
      data: comment
    });
  }

  console.log('视频测试数据创建完成！');
  console.log(`创建了 ${videos.length} 个视频和 ${commentData.length} 个评论`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });