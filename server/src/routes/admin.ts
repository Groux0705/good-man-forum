import express from 'express';
import { requireAdmin, requireSuperAdmin } from '../middleware/adminAuth';

// 导入管理员控制器
import * as dashboardController from '../controllers/admin/dashboard';
import * as topicsController from '../controllers/admin/topics';
import * as usersController from '../controllers/admin/users';
import * as nodesController from '../controllers/admin/nodes';
import * as reportsController from '../controllers/admin/reports';
import * as logsController from '../controllers/admin/logs';

const router = express.Router();

// 所有管理员路由都需要管理员权限
router.use(requireAdmin);

// 仪表板路由
router.get('/dashboard/overview', dashboardController.getSystemOverview);
router.get('/dashboard/trends', dashboardController.getTrendData);
router.get('/dashboard/popular', dashboardController.getPopularContent);
router.get('/dashboard/health', dashboardController.getSystemHealth);

// 主题管理路由
router.get('/topics', topicsController.getTopics);
router.get('/topics/stats', topicsController.getTopicStats);
router.get('/topics/:id', topicsController.getTopicDetail);
router.put('/topics/:id/status', topicsController.updateTopicStatus);
router.delete('/topics/:id', topicsController.deleteTopic);
router.post('/topics/batch', topicsController.batchUpdateTopics);

// 用户管理路由
router.get('/users', usersController.getUsers);
router.get('/users/stats', usersController.getUserStats);
router.get('/users/:id', usersController.getUserDetail);
router.post('/users/:id/punish', usersController.punishUser);
router.get('/punishments', usersController.getAllPunishments);
router.put('/punishments/:punishmentId/revoke', usersController.revokePunishment);
router.post('/users/batch', usersController.batchOperation);
router.get('/batch-operations/:operationId', usersController.getBatchOperationStatus);

// 用户申诉路由
router.get('/appeals', usersController.getUserAppeals);
router.put('/appeals/:appealId/handle', usersController.handleAppeal);

// 节点管理路由
router.get('/nodes', nodesController.getNodes);
router.get('/nodes/stats', nodesController.getNodeStats);
router.get('/nodes/:id', nodesController.getNodeDetail);
router.post('/nodes', nodesController.createNode);
router.put('/nodes/:id', nodesController.updateNode);
router.delete('/nodes/:id', nodesController.deleteNode);
router.post('/nodes/batch', nodesController.batchUpdateNodes);

// 举报管理路由
router.get('/reports', reportsController.getReports);
router.get('/reports/stats', reportsController.getReportStats);
router.get('/reports/:id', reportsController.getReportDetail);
router.put('/reports/:id/handle', reportsController.handleReport);
router.post('/reports/batch', reportsController.batchHandleReports);

// 操作日志路由
router.get('/logs', logsController.getAdminLogs);
router.get('/logs/stats', logsController.getAdminLogStats);
router.get('/logs/:id', logsController.getAdminLogDetail);
router.post('/logs/cleanup', requireSuperAdmin, logsController.cleanupOldLogs);

export default router;