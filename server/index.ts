import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'

import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import foodsRoutes from './routes/foods'
import mealsRoutes from './routes/meals'
import mealTypesRoutes from './routes/mealTypes'
import subscriptionRoutes from './routes/subscriptions'
import webhookRoutes from './routes/webhooks'

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'caloritrack-secret-change-in-production'
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  try {
    const token = header.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    ;(req as any).userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

app.use('/api/auth', authRoutes)
app.use('/api/profile', authMiddleware, profileRoutes)
app.use('/api/foods', authMiddleware, foodsRoutes)
app.use('/api/meals', authMiddleware, mealsRoutes)
app.use('/api/meal-types', authMiddleware, mealTypesRoutes)
app.use('/api/subscriptions', authMiddleware, subscriptionRoutes)
app.use('/api/webhooks', webhookRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
