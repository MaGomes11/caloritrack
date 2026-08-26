import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import pool from '../db'

const router = Router()

function getUserId(req: Request): string | null {
  return (req as any).userId || null
}

const DEFAULT_TYPES = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar']

async function ensureDefaults(userId: string) {
  const [existing] = await pool.query('SELECT id FROM meal_types WHERE user_id = ? LIMIT 1', [userId])
  if ((existing as any[]).length > 0) return

  for (let i = 0; i < DEFAULT_TYPES.length; i++) {
    await pool.query(
      'INSERT INTO meal_types (id, user_id, name, sort_order) VALUES (?, ?, ?, ?)',
      [uuid(), userId, DEFAULT_TYPES[i], i + 1]
    )
  }
}

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  await ensureDefaults(userId)

  const [rows] = await pool.query(
    'SELECT * FROM meal_types WHERE user_id = ? ORDER BY sort_order ASC',
    [userId]
  )
  res.json(rows)
})

router.post('/', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' })

  const [maxOrder] = await pool.query(
    'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM meal_types WHERE user_id = ?',
    [userId]
  )
  const nextOrder = (maxOrder as any[])[0].next_order

  const id = uuid()
  await pool.query(
    'INSERT INTO meal_types (id, user_id, name, sort_order) VALUES (?, ?, ?, ?)',
    [id, userId, name.trim(), nextOrder]
  )

  const [rows] = await pool.query('SELECT * FROM meal_types WHERE id = ?', [id])
  res.json((rows as any[])[0])
})

router.put('/:id', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const { name } = req.body
  if (!name?.trim()) return res.status(400).json({ error: 'Nome é obrigatório' })

  await pool.query(
    'UPDATE meal_types SET name = ? WHERE id = ? AND user_id = ?',
    [name.trim(), req.params.id, userId]
  )

  const [rows] = await pool.query('SELECT * FROM meal_types WHERE id = ?', [req.params.id])
  res.json((rows as any[])[0])
})

router.delete('/:id', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const [meals] = await pool.query(
    'SELECT COUNT(*) AS count FROM meals WHERE user_id = ? AND meal_type = (SELECT name FROM meal_types WHERE id = ? AND user_id = ?)',
    [userId, req.params.id, userId]
  )

  if ((meals as any[])[0].count > 0) {
    return res.status(400).json({ error: 'Não é possível excluir: existem refeições usando este tipo' })
  }

  await pool.query('DELETE FROM meal_types WHERE id = ? AND user_id = ?', [req.params.id, userId])
  res.json({ success: true })
})

export default router
