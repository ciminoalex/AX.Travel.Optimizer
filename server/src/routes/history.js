import { Router } from 'express';
import { getSearchHistory, getSearchById, deleteSearch } from '../db/database.js';

const router = Router();

router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  const history = getSearchHistory(limit);
  res.json({ history });
});

router.get('/:id', (req, res) => {
  const search = getSearchById(parseInt(req.params.id, 10));
  if (!search) {
    return res.status(404).json({ error: 'Search not found' });
  }
  res.json({ search });
});

router.delete('/:id', (req, res) => {
  deleteSearch(parseInt(req.params.id, 10));
  res.json({ success: true });
});

export default router;
