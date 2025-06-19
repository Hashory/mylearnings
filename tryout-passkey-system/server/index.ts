import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { sqlite3 } from 'sqlite3'

const app = new Hono()

app.get('/api', (c) => {
  return c.json({ message: 'Hello from API!' })
})

app.post('/api/send-email-to-student', (c) => {
  // Logic to send email 
  return c.json({ success: true })
})

app.post('/api/send-email-to-teacher', (c) => {
  // Logic to send email
  return c.json({ success: true })
})

serve(app)