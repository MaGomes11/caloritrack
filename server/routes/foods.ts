import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import pool from '../db'

const router = Router()

function getUserId(req: Request): string | null {
  return (req as any).userId || null
}

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const [rows] = await pool.query(
    'SELECT * FROM foods WHERE is_default = TRUE OR user_id = ? ORDER BY name',
    [userId]
  )
  res.json(rows)
})

router.get('/search', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const q = req.query.q as string || ''
  const [rows] = await pool.query(
    'SELECT * FROM foods WHERE (is_default = TRUE OR user_id = ?) AND name LIKE ? ORDER BY name LIMIT 20',
    [userId, `%${q}%`]
  )
  res.json(rows)
})

router.post('/', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const { name, calories, protein, carbs, fat } = req.body
  const id = uuid()

  await pool.query(
    'INSERT INTO foods (id, name, calories, protein, carbs, fat, is_default, user_id) VALUES (?, ?, ?, ?, ?, ?, FALSE, ?)',
    [id, name, calories, protein || 0, carbs || 0, fat || 0, userId]
  )

  const [rows] = await pool.query('SELECT * FROM foods WHERE id = ?', [id])
  res.json((rows as any[])[0])
})

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  await pool.query('DELETE FROM foods WHERE id = ? AND user_id = ? AND is_default = FALSE', [req.params.id, userId])
  res.json({ success: true })
})

export default router
