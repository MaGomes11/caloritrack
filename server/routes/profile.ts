import { Router, Request, Response } from 'express'
import pool from '../db'

const router = Router()

function getUserId(req: Request): string | null {
  return (req as any).userId || null
}

router.get('/', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
  const users = rows as any[]
  if (users.length === 0) return res.status(404).json({ error: 'Perfil não encontrado' })

  const { password_hash, ...profile } = users[0]
  res.json(profile)
})

router.put('/', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const { name, weight, height, age, sex, goal, daily_calories, onboarding_done } = req.body

  await pool.query(
    `UPDATE users SET name=?, weight=?, height=?, age=?, sex=?, goal=?, daily_calories=?, onboarding_done=?
     WHERE id=?`,
    [name, weight, height, age, sex, goal, daily_calories, onboarding_done, userId]
  )

  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId])
  const { password_hash, ...profile } = (rows as any[])[0]
  res.json(profile)
})

export default router
