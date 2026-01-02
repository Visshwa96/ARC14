import dotenv from 'dotenv'
import { sendTestEmail } from './services/emailService.js'

dotenv.config()

console.log('🔍 Testing Email Service...')
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? `EXISTS (${process.env.SENDGRID_API_KEY.substring(0, 15)}...)` : 'MISSING')
console.log('SENDER_EMAIL:', process.env.SENDER_EMAIL || 'MISSING')
console.log('')

const result = await sendTestEmail('interfrost.14@gmail.com')
console.log('\n📧 Result:', result)
