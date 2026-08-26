import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import pool from '../db'

const router = Router()

function getUserId(req: Request): string | null {
  return (req as any).userId || null
}

router.get('/:date', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const [rows] = await pool.query(
    'SELECT * FROM meals WHERE user_id = ? AND date = ? ORDER BY created_at ASC',
    [userId, req.params.date]
  )
  res.json(rows)
})

router.get('/range/:from/:to', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const [rows] = await pool.query(
    'SELECT * FROM meals WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
    [userId, req.params.from, req.params.to]
  )
  res.json(rows)
})

router.post('/', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const { food_id, food_name, meal_type, quantity, calories, protein, carbs, fat, date } = req.body
  const id = uuid()

  await pool.query(
    `INSERT INTO meals (id, user_id, food_id, food_name, meal_type, quantity, calories, protein, carbs, fat, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, food_id, food_name, meal_type, quantity, calories, protein || 0, carbs || 0, fat || 0, date]
  )

  const [rows] = await pool.query('SELECT * FROM meals WHERE id = ?', [id])
  res.json((rows as any[])[0])
})

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  await pool.query('DELETE FROM meals WHERE id = ? AND user_id = ?', [req.params.id, userId])
  res.json({ success: true })
})

export default router
