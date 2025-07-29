import { PrismaClient } from '@prisma/client';
import { hashPassword } from './utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('开始添加初始数据...');

  const adminPassword = await hashPassword('admin123');
  const testPassword = await hashPassword('test123');

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@goodman.com',
      password: adminPassword,
      balance: 1000,
      level: 10,
      experience: 4500, // 10级所需经验值
    },
  });

  const testUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@goodman.com',
      password: testPassword,
      balance: 100,
      level: 1,
      experience: 50, // 初始经验值
    },
  });

  const nodes = [
    {
      name: 'general',
      title: '综合讨论',
      description: '各种话题的综合讨论区',
    },
    {
      name: 'tech',
      title: '技术',
      description: '编程、技术、开发相关讨论',
    },
    {
      name: 'startup',
      title: '创业',
      description: '创业、商业、投资相关话题',
    },
    {
      name: 'life',
      title: '生活',
      description: '日常生活、兴趣爱好分享',
    },
    {
      name: 'career',
      title: '职场',
      description: '职业发展、求职、工作经验',
    },
  ];

  for (const nodeData of nodes) {
    await prisma.node.upsert({
      where: { name: nodeData.name },
      update: {},
      create: nodeData,
    });
  }

  const generalNode = await prisma.node.findUnique({ where: { name: 'general' } });
  const techNode = await prisma.node.findUnique({ where: { name: 'tech' } });

  if (generalNode && techNode) {
    await prisma.topic.upsert({
      where: { id: 'welcome-topic' },
      update: {},
      create: {
        id: 'welcome-topic',
        title: '欢迎来到 Good Man Forum',
        content: '这是一个类似 V2EX 的论坛系统演示。\n\n功能特性：\n- 用户注册登录\n- 节点分类讨论\n- 主题发布与回复\n- 响应式设计\n\n欢迎大家多多交流！',
        userId: admin.id,
        nodeId: generalNode.id,
      },
    });

    await prisma.topic.upsert({
      where: { id: 'tech-topic' },
      update: {},
      create: {
        id: 'tech-topic',
        title: '技术栈分享：React + Node.js + TypeScript',
        content: '这个论坛使用了以下技术栈：\n\n前端：\n- React 18\n- TypeScript\n- Vite\n- Tailwind CSS\n\n后端：\n- Node.js\n- Express\n- TypeScript\n- Prisma ORM\n- SQLite\n\n大家有什么技术问题欢迎讨论！',
        userId: testUser.id,
        nodeId: techNode.id,
      },
    });

    await prisma.node.update({
      where: { id: generalNode.id },
      data: { topics: 1 },
    });

    await prisma.node.update({
      where: { id: techNode.id },
      data: { topics: 1 },
    });
  }

  console.log('初始数据添加完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });