import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'admin' },
          { role: 'moderator' },
          { username: 'admin' }
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });

    console.log('现有的管理员和版主用户:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - 角色: ${user.role}, 状态: ${user.status}`);
    });

    if (users.length === 0) {
      console.log('没有找到管理员用户');
    }

  } catch (error) {
    console.error('查询失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();