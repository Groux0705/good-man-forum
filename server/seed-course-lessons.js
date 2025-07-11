const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const courseData = {
  title: "恋爱沟通技巧全面指南",
  description: "从基础理论到实践应用，全面掌握恋爱中的沟通技巧",
  category: "communication",
  difficulty: "intermediate",
  chapters: [
    {
      title: "基础概念入门",
      description: "了解恋爱沟通的基本概念和重要性",
      order: 1,
      lessons: [
        {
          title: "视频：恋爱沟通的核心概念",
          type: "video",
          order: 1,
          duration: 480, // 8分钟
          content: {
            videoUrl: "https://example.com/video1.mp4",
            description: "深入了解恋爱沟通的定义、作用和基本原则",
            keyPoints: [
              { time: 30, title: "什么是有效沟通" },
              { time: 120, title: "沟通的四个层次" },
              { time: 300, title: "恋爱中的沟通误区" }
            ]
          }
        },
        {
          title: "文章：沟通心理学基础理论",
          type: "article",
          order: 2,
          duration: 600, // 10分钟阅读
          content: {
            markdown: `# 沟通心理学基础理论

## 引言
沟通是人际关系的基石，在恋爱关系中更是至关重要。本章将从心理学角度深入探讨沟通的本质和机制。

## 沟通的定义与要素

### 什么是沟通？
沟通是指两个或多个人之间信息、情感和意图的交流过程。它不仅仅是语言的传递，更包括非语言信息的传达。

### 沟通的基本要素
1. **发送者**：信息的传递方
2. **接收者**：信息的接收方
3. **信息**：传递的内容
4. **渠道**：信息传递的媒介
5. **反馈**：接收者的回应

## 沟通的层次分析

### 表层沟通
- 日常寒暄
- 基本信息交换
- 礼貌性对话

### 深层沟通
- 情感表达
- 价值观分享
- 内心想法交流

## 恋爱沟通的特殊性

恋爱关系中的沟通具有以下特点：
- **情感浓度高**：情感投入更多
- **期望值高**：对理解的期望更强
- **影响深远**：直接关系到关系质量

## 常见沟通障碍

1. **预设立场**：带着既定观点听话
2. **情绪干扰**：情绪化影响理性判断
3. **表达不清**：想法无法准确传达
4. **缺乏反馈**：单向信息传递

## 小结

理解沟通的基本原理是提升恋爱沟通技巧的第一步。在接下来的章节中，我们将学习具体的沟通技巧和方法。`,
            tableOfContents: [
              { title: "引言", anchor: "引言" },
              { title: "沟通的定义与要素", anchor: "沟通的定义与要素" },
              { title: "沟通的层次分析", anchor: "沟通的层次分析" },
              { title: "恋爱沟通的特殊性", anchor: "恋爱沟通的特殊性" },
              { title: "常见沟通障碍", anchor: "常见沟通障碍" }
            ]
          }
        },
        {
          title: "测验：基础概念理解检验",
          type: "quiz",
          order: 3,
          duration: 300, // 5分钟
          content: {
            questions: [
              {
                type: "single",
                question: "沟通的基本要素不包括以下哪项？",
                options: ["发送者", "接收者", "情绪", "反馈"],
                correct: 2,
                explanation: "沟通的基本要素包括发送者、接收者、信息、渠道和反馈，情绪虽然会影响沟通，但不是基本要素。"
              },
              {
                type: "multiple",
                question: "恋爱沟通的特殊性体现在哪些方面？（多选）",
                options: ["情感浓度高", "期望值高", "影响深远", "频率较低"],
                correct: [0, 1, 2],
                explanation: "恋爱沟通具有情感浓度高、期望值高、影响深远的特点。"
              },
              {
                type: "fill",
                question: "沟通不仅仅是语言的传递，更包括____信息的传达。",
                correct: "非语言",
                explanation: "沟通包括语言和非语言信息的传达，如肢体语言、表情等。"
              }
            ]
          }
        }
      ]
    },
    {
      title: "核心原理解析",
      description: "深入理解沟通的核心原理和机制",
      order: 2,
      lessons: [
        {
          title: "视频：倾听技巧的艺术",
          type: "video",
          order: 1,
          duration: 720, // 12分钟
          content: {
            videoUrl: "https://example.com/video2.mp4",
            description: "学习如何成为一个优秀的倾听者，掌握主动倾听的技巧",
            keyPoints: [
              { time: 60, title: "主动倾听的定义" },
              { time: 180, title: "倾听的三个层次" },
              { time: 420, title: "非语言倾听信号" },
              { time: 600, title: "倾听中的常见误区" }
            ]
          }
        },
        {
          title: "文章：情绪管理与表达技巧",
          type: "article",
          order: 2,
          duration: 720, // 12分钟阅读
          content: {
            markdown: `# 情绪管理与表达技巧

## 情绪在沟通中的作用

情绪是沟通的重要组成部分，它既可能促进沟通，也可能成为沟通的障碍。

### 情绪的双重性
- **积极作用**：增强表达力、增进理解
- **消极作用**：干扰理性、产生误解

## 情绪管理的核心技巧

### 1. 情绪识别
学会识别自己和对方的情绪状态：
- 观察表情变化
- 留意语调变化
- 注意肢体语言

### 2. 情绪调节
掌握调节情绪的方法：
- 深呼吸技巧
- 暂停策略
- 重新框架思考

### 3. 情绪表达
学会恰当地表达情绪：
- 使用"我"信息
- 描述而非指责
- 选择合适时机

## 情绪表达的技巧

### "我"信息的使用
- ❌ "你总是这样！"
- ✅ "我感到有些困惑，能帮我理解一下吗？"

### 情绪标签化
准确地给情绪贴上标签：
- 具体而非模糊
- 程度的区分
- 多维度描述

## 处理负面情绪的策略

1. **接纳情绪**：承认情绪的存在
2. **理解原因**：探索情绪背后的需求
3. **选择回应**：理性选择应对方式
4. **寻求支持**：在需要时寻求帮助

## 实践建议

- 每天练习情绪识别
- 建立情绪日记
- 学习放松技巧
- 培养同理心`,
            tableOfContents: [
              { title: "情绪在沟通中的作用", anchor: "情绪在沟通中的作用" },
              { title: "情绪管理的核心技巧", anchor: "情绪管理的核心技巧" },
              { title: "情绪表达的技巧", anchor: "情绪表达的技巧" },
              { title: "处理负面情绪的策略", anchor: "处理负面情绪的策略" }
            ]
          }
        },
        {
          title: "实操练习：情绪识别与表达",
          type: "practice",
          order: 3,
          duration: 900, // 15分钟
          content: {
            instructions: `## 情绪识别与表达练习

### 练习目标
通过模拟场景，练习识别和表达情绪的技巧。

### 练习步骤
1. 阅读下面的对话场景
2. 识别双方的情绪状态
3. 改写对话，使用更好的情绪表达方式
4. 在右侧编辑器中完成练习

### 场景一：约会迟到
**小明**：你怎么又迟到了！我等了你半个小时！
**小红**：路上堵车嘛，又不是我的错！

请重写这段对话，使用更好的情绪表达方式。`,
            template: `// 请在这里重写对话，体现良好的情绪管理和表达

// 场景一：约会迟到
// 原始对话：
// 小明：你怎么又迟到了！我等了你半个小时！
// 小红：路上堵车嘛，又不是我的错！

// 改进后的对话：
小明：
小红：

// 分析：
// 1. 小明的情绪状态：
// 2. 小红的情绪状态：
// 3. 改进要点：`,
            solution: `// 改进后的对话：
小明：宝贝，我有些担心，等了你半小时。下次如果有情况，能提前告诉我吗？这样我就不会担心了。
小红：对不起，让你担心了。确实是路上堵车，我应该提前给你发消息的。下次我会注意的。

// 分析：
// 1. 小明的情绪状态：担心、焦虑、希望得到理解
// 2. 小红的情绪状态：有些委屈、认识到问题
// 3. 改进要点：
//    - 使用"我"信息表达感受
//    - 避免指责性语言
//    - 提出建设性建议
//    - 承认错误并给出改进方案`,
            language: "javascript"
          }
        },
        {
          title: "测验：核心原理综合测试",
          type: "quiz",
          order: 4,
          duration: 480, // 8分钟
          content: {
            questions: [
              {
                type: "single",
                question: "主动倾听的核心要素是什么？",
                options: ["保持沉默", "全神贯注", "快速回应", "提供建议"],
                correct: 1,
                explanation: "主动倾听的核心是全神贯注地听对方说话，理解其真正意图。"
              },
              {
                type: "multiple",
                question: "情绪管理包括哪些方面？（多选）",
                options: ["情绪识别", "情绪调节", "情绪表达", "情绪隐藏"],
                correct: [0, 1, 2],
                explanation: "情绪管理包括识别、调节和恰当表达情绪，而非隐藏情绪。"
              }
            ]
          }
        }
      ]
    },
    {
      title: "实践应用技巧",
      description: "将理论知识转化为实际的沟通技巧",
      order: 3,
      lessons: [
        {
          title: "视频：冲突解决的沟通策略",
          type: "video",
          order: 1,
          duration: 900, // 15分钟
          content: {
            videoUrl: "https://example.com/video3.mp4",
            description: "学习如何在冲突中运用有效的沟通技巧",
            keyPoints: [
              { time: 90, title: "冲突的本质分析" },
              { time: 300, title: "冲突沟通的原则" },
              { time: 540, title: "实际案例分析" },
              { time: 780, title: "预防冲突的技巧" }
            ]
          }
        },
        {
          title: "文章：建立深层次情感连接",
          type: "article",
          order: 2,
          duration: 840, // 14分钟阅读
          content: {
            markdown: `# 建立深层次情感连接

## 什么是情感连接？

情感连接是两个人之间建立的深层次情感纽带，它超越了表面的交流，达到心灵的沟通。

## 建立情感连接的基础

### 1. 真诚与开放
- 分享真实的自己
- 承认自己的不完美
- 表达真实的情感

### 2. 同理心
- 站在对方角度思考
- 理解对方的情感需求
- 给予情感支持

### 3. 共同经历
- 创造美好回忆
- 面对挑战时相互支持
- 分享生活中的点点滴滴

## 深化情感连接的技巧

### 深度对话技巧
1. **开放式问题**
   - "你今天过得怎么样？"
   - "什么让你感到最开心？"
   - "你的梦想是什么？"

2. **情感反映**
   - 重复对方的情感表达
   - 确认理解是否正确
   - 给予情感认同

3. **自我披露**
   - 分享个人经历
   - 表达内心想法
   - 展示脆弱的一面

### 非语言沟通
- 眼神交流
- 身体接触
- 面部表情
- 声音语调

## 维护情感连接的方法

### 日常实践
- 每天分享一件有趣的事
- 定期进行深度对话
- 表达感激和欣赏
- 给予对方充分的关注

### 特殊时刻
- 庆祝成功
- 安慰失落
- 共同面对困难
- 创造仪式感

## 情感连接的层次

1. **表面层**：基本信息交换
2. **情感层**：情感分享和支持
3. **价值层**：价值观的共鸣
4. **灵魂层**：深层次的精神连接

## 常见误区

- 过度依赖语言沟通
- 忽视非语言信号
- 缺乏耐心和理解
- 急于给出建议而非倾听

## 实践建议

1. 每周安排专门的深度对话时间
2. 学会在冲突中保持连接
3. 培养共同兴趣和爱好
4. 定期表达爱意和欣赏`,
            tableOfContents: [
              { title: "什么是情感连接？", anchor: "什么是情感连接？" },
              { title: "建立情感连接的基础", anchor: "建立情感连接的基础" },
              { title: "深化情感连接的技巧", anchor: "深化情感连接的技巧" },
              { title: "维护情感连接的方法", anchor: "维护情感连接的方法" }
            ]
          }
        },
        {
          title: "实操练习：冲突解决方案设计",
          type: "practice",
          order: 3,
          duration: 1200, // 20分钟
          content: {
            instructions: `## 冲突解决方案设计练习

### 练习目标
设计一套完整的冲突解决方案，包括预防、应对和修复策略。

### 练习要求
1. 分析给定的冲突场景
2. 设计解决方案
3. 编写具体的对话示例
4. 提出预防措施

### 冲突场景
小李和小王是恋人，最近因为工作忙碌，聚少离多。小李觉得小王不够关心她，而小王认为小李不理解他的工作压力。矛盾逐渐升级。

请设计一套完整的解决方案。`,
            template: `// 冲突解决方案设计

// 1. 冲突分析
const conflictAnalysis = {
  // 冲突类型：
  type: "",
  
  // 双方立场：
  person1Position: "",
  person2Position: "",
  
  // 根本需求：
  person1Needs: "",
  person2Needs: "",
  
  // 冲突原因：
  rootCause: ""
};

// 2. 解决方案设计
const solutionPlan = {
  // 第一步：创造安全的对话环境
  step1: {
    environment: "",
    timing: "",
    approach: ""
  },
  
  // 第二步：倾听和理解
  step2: {
    listeningTechniques: [],
    validationMethods: []
  },
  
  // 第三步：寻找共同点
  step3: {
    commonGround: [],
    sharedValues: []
  },
  
  // 第四步：制定行动计划
  step4: {
    agreements: [],
    actionItems: []
  }
};

// 3. 对话示例
const dialogueExample = \`
// 请在这里编写具体的对话示例
小李：
小王：
\`;

// 4. 预防措施
const preventionStrategies = [
  // 列出具体的预防措施
];`,
            solution: `// 冲突解决方案设计

// 1. 冲突分析
const conflictAnalysis = {
  type: "需求冲突 - 关注vs理解",
  person1Position: "小李认为小王不够关心她",
  person2Position: "小王认为小李不理解他的工作压力",
  person1Needs: "需要被关心、被重视、情感连接",
  person2Needs: "需要被理解、被支持、工作认可",
  rootCause: "沟通不足导致的误解，双方都有合理需求但表达方式不当"
};

// 2. 解决方案设计
const solutionPlan = {
  step1: {
    environment: "安静、私密、不被打扰的环境",
    timing: "双方都有充足时间，情绪稳定时",
    approach: "以解决问题为目标，而非指责"
  },
  
  step2: {
    listeningTechniques: ["主动倾听", "情感反映", "澄清确认"],
    validationMethods: ["承认对方的感受", "理解对方的立场"]
  },
  
  step3: {
    commonGround: ["互相关心对方", "希望关系更好", "都在为生活努力"],
    sharedValues: ["爱情", "理解", "支持", "成长"]
  },
  
  step4: {
    agreements: ["每天至少15分钟的专心交流", "工作忙时提前告知", "定期安排约会时间"],
    actionItems: ["制定沟通时间表", "学习表达需求的方法", "建立支持系统"]
  }
};

// 3. 对话示例
const dialogueExample = \`
小李：宝贝，我想和你聊聊我们最近的情况。我感觉有些距离，想了解你的想法。
小王：好的，我也觉得我们需要好好谈谈。
小李：最近我感觉你很忙，我有时候感到有些被忽视。我知道你工作很努力，但我也需要感受到你的关心。
小王：我理解你的感受，对不起让你有这样的感觉。工作确实很有压力，但这不是忽视你的理由。我也需要你理解我现在的处境。
小李：我想更好地理解你的工作压力。能告诉我具体是什么让你感到压力吗？
小王：谢谢你愿意了解。我们来想想怎么在忙碌中保持连接，好吗？
\`;

// 4. 预防措施
const preventionStrategies = [
  "建立日常沟通习惯，每天分享一天的感受",
  "工作忙碌时提前沟通，设定期望",
  "定期进行关系检查，及时发现问题",
  "学习更好的情绪表达技巧",
  "创造专属的相处时间，不被工作打扰",
  "建立支持系统，分担生活压力"
];`,
            language: "javascript"
          }
        }
      ]
    },
    {
      title: "高级沟通策略",
      description: "掌握高级的沟通技巧和策略",
      order: 4,
      lessons: [
        {
          title: "视频：非语言沟通的奥秘",
          type: "video",
          order: 1,
          duration: 1080, // 18分钟
          content: {
            videoUrl: "https://example.com/video4.mp4",
            description: "深入了解非语言沟通的重要性和技巧",
            keyPoints: [
              { time: 120, title: "非语言沟通的比重" },
              { time: 360, title: "肢体语言解读" },
              { time: 600, title: "微表情识别" },
              { time: 840, title: "空间距离的意义" }
            ]
          }
        },
        {
          title: "文章：跨文化沟通技巧",
          type: "article",
          order: 2,
          duration: 600, // 10分钟阅读
          content: {
            markdown: `# 跨文化沟通技巧

## 文化差异对沟通的影响

不同文化背景下的沟通方式存在显著差异，了解这些差异有助于更好地沟通。

### 高低语境文化
- **高语境文化**：重视暗示、非语言信息
- **低语境文化**：重视直接、明确的表达

### 个人主义vs集体主义
- **个人主义文化**：强调个人观点和独立性
- **集体主义文化**：重视群体和谐和共识

## 跨文化沟通的挑战

1. **语言障碍**
2. **价值观差异**
3. **行为规范不同**
4. **思维模式差异**

## 跨文化沟通策略

### 1. 文化敏感性
- 学习对方文化背景
- 尊重文化差异
- 避免文化偏见

### 2. 适应性沟通
- 调整沟通风格
- 使用简单明了的语言
- 确认理解是否准确

### 3. 耐心和包容
- 给予更多时间
- 接受不同的表达方式
- 寻找共同点

## 实用技巧

- 多使用开放式问题
- 避免俚语和方言
- 注意非语言信号
- 定期确认理解`,
            tableOfContents: [
              { title: "文化差异对沟通的影响", anchor: "文化差异对沟通的影响" },
              { title: "跨文化沟通的挑战", anchor: "跨文化沟通的挑战" },
              { title: "跨文化沟通策略", anchor: "跨文化沟通策略" }
            ]
          }
        },
        {
          title: "测验：高级沟通技巧评估",
          type: "quiz",
          order: 3,
          duration: 600, // 10分钟
          content: {
            questions: [
              {
                type: "single",
                question: "非语言沟通在整体沟通中占的比重约为？",
                options: ["30%", "50%", "70%", "90%"],
                correct: 2,
                explanation: "研究表明，非语言沟通在整体沟通中占约70%的比重。"
              },
              {
                type: "multiple",
                question: "跨文化沟通需要注意哪些方面？（多选）",
                options: ["文化敏感性", "适应性沟通", "耐心包容", "坚持自己的方式"],
                correct: [0, 1, 2],
                explanation: "跨文化沟通需要文化敏感性、适应性沟通和耐心包容。"
              }
            ]
          }
        }
      ]
    },
    {
      title: "综合实战演练",
      description: "通过实际案例综合运用所学技巧",
      order: 5,
      lessons: [
        {
          title: "实操练习：完整沟通方案设计",
          type: "practice",
          order: 1,
          duration: 1800, // 30分钟
          content: {
            instructions: `## 完整沟通方案设计

### 最终项目
设计一个完整的沟通改善方案，包括：
1. 现状分析
2. 目标设定
3. 策略制定
4. 实施计划
5. 效果评估

### 背景案例
张三和李四是恋人，交往两年。最近因为张三要出国留学，两人对未来规划产生分歧。需要通过有效沟通来解决这个问题。

请设计一个完整的沟通方案。`,
            template: `// 完整沟通方案设计

// 1. 现状分析
const currentSituation = {
  // 关系状态：
  relationshipStatus: "",
  
  // 主要问题：
  mainIssues: [],
  
  // 沟通模式：
  communicationPattern: "",
  
  // 双方需求：
  person1Needs: [],
  person2Needs: []
};

// 2. 目标设定
const goals = {
  // 短期目标（1个月内）：
  shortTerm: [],
  
  // 中期目标（3个月内）：
  mediumTerm: [],
  
  // 长期目标（6个月以上）：
  longTerm: []
};

// 3. 策略制定
const strategies = {
  // 沟通技巧：
  communicationTechniques: [],
  
  // 冲突解决：
  conflictResolution: [],
  
  // 情感连接：
  emotionalConnection: []
};

// 4. 实施计划
const implementationPlan = {
  // 第一阶段：
  phase1: {
    duration: "",
    activities: [],
    expectedOutcomes: []
  },
  
  // 第二阶段：
  phase2: {
    duration: "",
    activities: [],
    expectedOutcomes: []
  },
  
  // 第三阶段：
  phase3: {
    duration: "",
    activities: [],
    expectedOutcomes: []
  }
};

// 5. 效果评估
const evaluationMethods = {
  // 评估指标：
  metrics: [],
  
  // 评估方法：
  methods: [],
  
  // 评估时间：
  timeline: []
};`,
            solution: `// 完整沟通方案设计

// 1. 现状分析
const currentSituation = {
  relationshipStatus: "稳定交往两年，感情基础良好，但面临重大决策分歧",
  mainIssues: [
    "对未来规划的不同看法",
    "异地恋的担忧",
    "沟通中的情绪化反应",
    "缺乏系统的问题解决方法"
  ],
  communicationPattern: "情绪化，缺乏深度讨论，倾向于回避困难话题",
  person1Needs: ["被理解", "获得支持", "维持关系", "个人成长"],
  person2Needs: ["被重视", "未来确定性", "关系稳定", "共同规划"]
};

// 2. 目标设定
const goals = {
  shortTerm: [
    "建立安全的沟通环境",
    "学会情绪管理",
    "理解双方真实需求",
    "制定初步共识"
  ],
  mediumTerm: [
    "建立异地沟通机制",
    "制定具体的未来计划",
    "增强信任和承诺",
    "发展冲突解决能力"
  ],
  longTerm: [
    "建立可持续的关系模式",
    "实现个人和关系的平衡发展",
    "建立共同的人生愿景",
    "培养长期的沟通习惯"
  ]
};

// 3. 策略制定
const strategies = {
  communicationTechniques: [
    "主动倾听技巧",
    "我信息表达法",
    "情绪识别和管理",
    "非暴力沟通原则"
  ],
  conflictResolution: [
    "分离立场和需求",
    "寻找双赢解决方案",
    "建立决策框架",
    "制定应急预案"
  ],
  emotionalConnection: [
    "增加情感表达",
    "创造共同体验",
    "建立信任仪式",
    "维护亲密关系"
  ]
};

// 4. 实施计划
const implementationPlan = {
  phase1: {
    duration: "第1-2周",
    activities: [
      "进行深度对话，了解真实想法",
      "学习和练习沟通技巧",
      "建立沟通规则和时间安排",
      "处理immediate情绪问题"
    ],
    expectedOutcomes: [
      "双方感受到被理解",
      "减少情绪化反应",
      "建立沟通的基础信任"
    ]
  },
  phase2: {
    duration: "第3-6周",
    activities: [
      "详细讨论留学计划和影响",
      "制定异地恋的具体安排",
      "建立定期沟通机制",
      "制定关系维护计划"
    ],
    expectedOutcomes: [
      "对未来有清晰规划",
      "建立可行的异地恋模式",
      "增强对关系的信心"
    ]
  },
  phase3: {
    duration: "第7-12周",
    activities: [
      "实施和调整沟通计划",
      "处理出现的新问题",
      "加强情感连接",
      "准备长期规划"
    ],
    expectedOutcomes: [
      "建立稳定的沟通模式",
      "适应新的关系形态",
      "为未来做好准备"
    ]
  }
};

// 5. 效果评估
const evaluationMethods = {
  metrics: [
    "沟通频率和质量",
    "冲突解决效率",
    "情绪管理能力",
    "关系满意度",
    "目标达成情况"
  ],
  methods: [
    "每周沟通日记",
    "关系满意度量表",
    "冲突解决案例分析",
    "第三方观察反馈"
  ],
  timeline: [
    "每周自我评估",
    "每月综合评估",
    "3个月总结评估",
    "6个月长期效果评估"
  ]
};`,
            language: "javascript"
          }
        },
        {
          title: "测验：综合能力评估",
          type: "quiz",
          order: 2,
          duration: 900, // 15分钟
          content: {
            questions: [
              {
                type: "single",
                question: "在面对重大关系决策时，最重要的是？",
                options: ["坚持己见", "妥协让步", "理解双方需求", "回避讨论"],
                correct: 2,
                explanation: "面对重大决策时，理解双方的真实需求是最重要的，这样才能找到双赢的解决方案。"
              },
              {
                type: "multiple",
                question: "有效的沟通方案应该包括哪些要素？（多选）",
                options: ["现状分析", "目标设定", "策略制定", "完美预期"],
                correct: [0, 1, 2],
                explanation: "有效的沟通方案需要现状分析、目标设定和策略制定，而不是不切实际的完美预期。"
              },
              {
                type: "fill",
                question: "在异地恋中，最重要的沟通原则是____和____。",
                correct: "定期沟通;保持信任",
                explanation: "异地恋中最重要的是建立定期的沟通机制和保持相互信任。"
              }
            ]
          }
        },
        {
          title: "文章：课程总结与进阶指南",
          type: "article",
          order: 3,
          duration: 480, // 8分钟阅读
          content: {
            markdown: `# 课程总结与进阶指南

## 课程回顾

通过本课程的学习，你已经掌握了：

### 基础概念
- 沟通的定义和要素
- 恋爱沟通的特殊性
- 常见的沟通障碍

### 核心技能
- 主动倾听技巧
- 情绪管理和表达
- 冲突解决策略
- 情感连接建立

### 高级技巧
- 非语言沟通
- 跨文化沟通
- 复杂问题解决

### 实战应用
- 完整方案设计
- 实际案例分析
- 长期规划制定

## 学习成果检验

### 自我评估清单
- [ ] 能够识别和管理自己的情绪
- [ ] 掌握主动倾听的技巧
- [ ] 能够用"我"信息表达需求
- [ ] 会处理关系中的冲突
- [ ] 能够建立深层次的情感连接
- [ ] 具备跨文化沟通的意识
- [ ] 能够设计完整的沟通方案

## 进阶学习建议

### 继续深化的领域
1. **心理学基础**
   - 学习认知心理学
   - 了解人格心理学
   - 研究发展心理学

2. **专业技能**
   - 咨询技巧培训
   - 冲突调解技能
   - 团队沟通能力

3. **实践应用**
   - 参与沟通练习小组
   - 寻求实际练习机会
   - 接受专业指导

### 推荐资源
- 《非暴力沟通》- 马歇尔·卢森堡
- 《关键对话》- 科里·帕特森
- 《情商》- 丹尼尔·戈尔曼
- 《亲密关系》- 罗兰·米勒

## 持续改进计划

### 日常实践
1. **每日反思**
   - 回顾一天的沟通情况
   - 识别改进机会
   - 制定明天的目标

2. **定期练习**
   - 每周进行技能练习
   - 寻求反馈和指导
   - 调整学习计划

3. **长期发展**
   - 设定学习目标
   - 参加相关培训
   - 建立学习社群

## 结语

沟通是一项终身学习的技能。通过本课程的学习，你已经建立了坚实的基础。记住，理论知识只有在实践中才能真正发挥作用。

继续练习，保持开放的心态，相信你会在沟通的路上越走越远！

## 联系我们

如果你在学习过程中遇到问题，或者希望获得更多指导，欢迎：
- 加入我们的学习社群
- 参加在线答疑会
- 预约一对一咨询

祝你学习进步，关系美满！`,
            tableOfContents: [
              { title: "课程回顾", anchor: "课程回顾" },
              { title: "学习成果检验", anchor: "学习成果检验" },
              { title: "进阶学习建议", anchor: "进阶学习建议" },
              { title: "持续改进计划", anchor: "持续改进计划" }
            ]
          }
        }
      ]
    }
  ]
};

async function seedCourseData() {
  try {
    // 首先查找或创建课程
    let course = await prisma.course.findFirst({
      where: { title: courseData.title }
    });

    if (!course) {
      // 创建用户（如果不存在）
      let user = await prisma.user.findFirst({
        where: { username: 'instructor' }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            username: 'instructor',
            email: 'instructor@example.com',
            password: 'hashedpassword',
            level: 10
          }
        });
      }

      // 创建课程
      course = await prisma.course.create({
        data: {
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          difficulty: courseData.difficulty,
          userId: user.id,
          views: 1250,
          likes: 89,
          enrollments: 156,
          published: true  // 确保课程是发布状态
        }
      });

      console.log('Course created:', course.title);
    }

    // 删除现有的章节和小节
    await prisma.courseLesson.deleteMany({
      where: {
        chapter: {
          courseId: course.id
        }
      }
    });

    await prisma.courseChapter.deleteMany({
      where: { courseId: course.id }
    });

    // 创建章节和小节
    for (const chapterData of courseData.chapters) {
      const chapter = await prisma.courseChapter.create({
        data: {
          title: chapterData.title,
          description: chapterData.description,
          order: chapterData.order,
          courseId: course.id,
          duration: chapterData.lessons.reduce((sum, lesson) => sum + lesson.duration, 0)
        }
      });

      console.log('Chapter created:', chapter.title);

      // 创建小节
      for (const lessonData of chapterData.lessons) {
        const lesson = await prisma.courseLesson.create({
          data: {
            title: lessonData.title,
            type: lessonData.type,
            order: lessonData.order,
            duration: lessonData.duration,
            content: JSON.stringify(lessonData.content),
            chapterId: chapter.id
          }
        });

        console.log('Lesson created:', lesson.title);
      }
    }

    console.log('Course data seeded successfully!');
  } catch (error) {
    console.error('Error seeding course data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCourseData();