import express from 'express';
import { getNodes, getNode } from '../controllers/nodes';

const router = express.Router();

router.get('/', getNodes);
router.get('/:id', getNode);

export default router;