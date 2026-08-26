import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import pool from '../db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'caloritrack-secret-change-in-production'

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if ((existing as any[]).length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' })
    }

    const id = uuid()
    const passwordHash = await bcrypt.hash(password, 10)
    await pool.query(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [id, email, passwordHash]
    )

    const token = jwt.sign({ userId: id }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id, email } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    const users = rows as any[]
    if (users.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' })
    }

    const user = users[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos' })
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
