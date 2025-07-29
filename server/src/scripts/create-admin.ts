import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      console.log('管理员账户已存在:', existingAdmin.username);
      return;
    }

    // 创建默认管理员账户
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123456', 10), // 默认密码，建议首次登录后修改
      role: 'admin',
      status: 'active',
      level: 10,
      balance: 10000,
      experience: 10000
    };

    const admin = await prisma.user.create({
      data: adminData
    });

    console.log('管理员账户创建成功:');
    console.log('用户名:', admin.username);
    console.log('邮箱:', admin.email);
    console.log('默认密码: admin123456');
    console.log('请在首次登录后修改密码！');

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
    console.error('创建管理员账户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createAdminUser();
}

export default createAdminUser;