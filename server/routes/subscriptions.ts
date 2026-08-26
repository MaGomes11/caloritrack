import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import pool from '../db'
import { createPayment, getSubscription, cancelSubscription } from '../services/cakto'

const router = Router()

function getUserId(req: Request): string | null {
  return (req as any).userId || null
}

router.get('/status', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const [rows] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ?', [userId])
  const subs = rows as any[]

  if (subs.length === 0) {
    return res.json({ status: 'none', subscription: null })
  }

  const sub = subs[0]

  if (sub.cakto_subscription_id && sub.status !== 'inactive') {
    try {
      const remote = await getSubscription(sub.cakto_subscription_id)
      await pool.query(
        'UPDATE subscriptions SET status = ?, next_payment_date = ?, current_period = ? WHERE id = ?',
        [remote.status, remote.next_payment_date, remote.current_period, sub.id]
      )
      sub.status = remote.status
      sub.next_payment_date = remote.next_payment_date
      sub.current_period = remote.current_period
    } catch {
      // keep local status
    }
  }

  res.json({ status: sub.status, subscription: sub })
})

router.post('/checkout', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const { offerId, paymentMethod, name, email, phone, doc } = req.body
  if (!offerId) return res.status(400).json({ error: 'offerId é obrigatório' })

  try {
    const result = await createPayment({
      offerId,
      customerName: name || '',
      customerEmail: email || '',
      customerPhone: phone || '',
      customerDoc: doc || '',
      paymentMethod: paymentMethod || 'pix',
    })

    const subId = uuid()
    await pool.query(
      `INSERT INTO subscriptions (id, user_id, cakto_order_id, status, amount, payment_method)
       VALUES (?, ?, ?, 'inactive', 19.90, ?)
       ON DUPLICATE KEY UPDATE cakto_order_id = VALUES(cakto_order_id), payment_method = VALUES(payment_method)`,
      [subId, userId, result.id, paymentMethod || 'pix']
    )

    res.json({
      checkoutUrl: result.checkoutUrl,
      pix: result.pix || null,
      orderId: result.id,
      status: result.status,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/cancel', async (req: Request, res: Response) => {
  const userId = getUserId(req)
  if (!userId) return res.status(401).json({ error: 'Não autorizado' })

  const [rows] = await pool.query('SELECT * FROM subscriptions WHERE user_id = ? AND status = ?', [userId, 'active'])
  const subs = rows as any[]

  if (subs.length === 0) {
    return res.status(400).json({ error: 'Nenhuma assinatura ativa encontrada' })
  }

  const sub = subs[0]
  if (sub.cakto_subscription_id) {
    await cancelSubscription(sub.cakto_subscription_id)
  }

  await pool.query('UPDATE subscriptions SET status = ? WHERE id = ?', ['canceled', sub.id])
  res.json({ success: true })
})

export default router
