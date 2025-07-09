const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateVideoToCourse() {
  try {
    console.log('开始迁移视频数据到课程表...');
    
    // 1. 获取所有视频数据
    const videos = await prisma.video.findMany({
      include: {
        comments: true
      }
    });
    
    console.log(`找到 ${videos.length} 个视频记录`);
    
    // 2. 为每个视频创建对应的课程记录
    for (const video of videos) {
      const course = await prisma.course.create({
        data: {
          id: video.id, // 保持相同的ID
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          type: 'video',
          content: null,
          videoUrl: video.videoUrl,
          platform: video.platform,
          category: video.category,
          tags: video.tags,
          duration: video.duration,
          difficulty: 'beginner',
          views: video.views,
          likes: video.likes,
          userId: video.userId,
          published: video.published,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt
        }
      });
      
      console.log(`创建课程记录: ${course.title}`);
      
      // 3. 迁移评论
      for (const comment of video.comments) {
        await prisma.courseComment.create({
          data: {
            id: comment.id,
            content: comment.content,
            userId: comment.userId,
            courseId: course.id,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
          }
        });
      }
      
      console.log(`迁移了 ${video.comments.length} 条评论`);
    }
    
    console.log('数据迁移完成！');
    
  } catch (error) {
    console.error('迁移失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行迁移
migrateVideoToCourse();