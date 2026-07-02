import { supabase } from './supabase'

// Capture un email : enregistré en base (visible dans l'admin) + envoyé à Make
export function captureEmail(email: string, source: string) {
  supabase.from('email_captures')
    .upsert({ email: email.trim().toLowerCase(), source }, { onConflict: 'email,source', ignoreDuplicates: true })
    .then(() => {})
  fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK || '', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim(), source }),
  }).catch(() => {})
}
