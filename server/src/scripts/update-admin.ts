import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateAdminUser() {
  try {
    // 更新现有的admin用户为管理员
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: {
        role: 'admin',
        status: 'active',
        level: 10,
        balance: 10000,
        experience: 10000
      }
    });

    console.log('用户已更新为管理员:');
    console.log('用户名:', updatedUser.username);
    console.log('邮箱:', updatedUser.email);
    console.log('角色:', updatedUser.role);
    console.log('状态:', updatedUser.status);

    // 创建一些系统设置
    const defaultSettings = [
      {
        key: 'site_name',
        value: JSON.stringify('Good Man Forum'),
        category: 'general',
        description: '网站名称'
      },
      {
        key: 'site_description',
        value: JSON.stringify('一个优秀的论坛系统'),
        category: 'general',
        description: '网站描述'
      },
      {
        key: 'max_upload_size',
        value: JSON.stringify(10485760), // 10MB
        category: 'general',
        description: '最大上传文件大小（字节）'
      },
      {
        key: 'allow_registration',
        value: JSON.stringify(true),
        category: 'security',
        description: '是否允许用户注册'
      },
      {
        key: 'require_email_verification',
        value: JSON.stringify(false),
        category: 'security',
        description: '是否需要邮箱验证'
      }
    ];

    for (const setting of defaultSettings) {
      await prisma.systemSetting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting
      });
    }

    console.log('默认系统设置已创建');

  } catch (error) {
    console.error('更新管理员账户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminUser();