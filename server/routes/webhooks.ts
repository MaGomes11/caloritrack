import { Router, Request, Response } from 'express'
import pool from '../db'

const router = Router()

router.post('/cakto', async (req: Request, res: Response) => {
  const payload = req.body

  const event = payload.event
  const data = payload.data

  if (!event || !data) {
    return res.status(400).json({ error: 'Payload inválido' })
  }

  try {
    if (event === 'subscription.activated' || event === 'subscription.renewed') {
      const caktoSubId = data.id
      const [rows] = await pool.query(
        'SELECT * FROM subscriptions WHERE cakto_subscription_id = ?',
        [caktoSubId]
      )
      const subs = rows as any[]

      if (subs.length > 0) {
        await pool.query(
          'UPDATE subscriptions SET status = ?, next_payment_date = ?, current_period = ? WHERE id = ?',
          [data.status, data.next_payment_date, data.current_period || 0, subs[0].id]
        )
      } else {
        // Try to find by customer email from parent order
        const customerEmail = data.customer?.email
        if (customerEmail) {
          const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [customerEmail])
          const users = userRows as any[]
          if (users.length > 0) {
            await pool.query(
              `UPDATE subscriptions SET cakto_subscription_id = ?, status = ?, next_payment_date = ?
               WHERE user_id = ?`,
              [caktoSubId, data.status, data.next_payment_date, users[0].id]
            )
          }
        }
      }
    }

    if (event === 'subscription.canceled' || event === 'subscription.expired' || event === 'subscription.payment_failed') {
      const caktoSubId = data.id
      await pool.query(
        'UPDATE subscriptions SET status = ? WHERE cakto_subscription_id = ?',
        [data.status || 'inactive', caktoSubId]
      )
    }

    res.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
