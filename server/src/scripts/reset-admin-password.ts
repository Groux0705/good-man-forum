import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    // 查找admin用户
    const adminUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { username: 'admin' },
          { role: 'admin' }
        ]
      }
    });

    if (!adminUser) {
      console.log('未找到admin用户');
      return;
    }

    // 重置密码为admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    });

    console.log('Admin密码已重置');
    console.log('用户名:', adminUser.username);
    console.log('新密码: admin123');
    
  } catch (error) {
    console.error('重置密码失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  resetAdminPassword();
}

export default resetAdminPassword;