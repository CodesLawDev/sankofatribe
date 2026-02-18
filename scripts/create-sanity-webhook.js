#!/usr/bin/env node
// =============================================================================
// Create Sanity Webhook via Management API
//
// Creates a GROQ-powered webhook that fires on product/order/event mutations
// and sends the full document to our sync endpoint.
// =============================================================================

require('dotenv').config()

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const SANITY_TOKEN = process.env.SANITY_WRITE_TOKEN
const WEBHOOK_SECRET = '7849f8e2a49d94da62a8e019870f359f46a9ff7837786f6cc1070829bdef7207'
const WEBHOOK_URL = 'https://sankofatribe.com/api/webhooks/sanity'

if (!SANITY_PROJECT_ID || !SANITY_TOKEN) {
  console.error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN')
  process.exit(1)
}

async function createWebhook() {
  const url = `https://api.sanity.io/v2021-10-04/hooks/projects/${SANITY_PROJECT_ID}`

  // First, list existing webhooks
  const listRes = await fetch(url, {
    headers: { Authorization: `Bearer ${SANITY_TOKEN}` },
  })
  if (listRes.ok) {
    const existingHooks = await listRes.json()
    console.log('Existing webhooks:', JSON.stringify(existingHooks, null, 2))
  } else {
    console.log('Note: Token lacks webhook list permission — will try create directly')
  }
  console.log()

  const webhookPayload = {
    name: 'Sync to Postgres',
    description: 'Syncs product, order, and event changes to the Postgres database',
    url: WEBHOOK_URL,
    on: ['create', 'update', 'delete'],
    dataset: SANITY_DATASET,
    secret: WEBHOOK_SECRET,
  }

  console.log(`Creating webhook for project: ${SANITY_PROJECT_ID}`)
  console.log(`URL: ${WEBHOOK_URL}`)
  console.log(`Dataset: ${SANITY_DATASET}`)
  console.log(`Filter: ${webhookPayload.filter}`)
  console.log()

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SANITY_TOKEN}`,
    },
    body: JSON.stringify(webhookPayload),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('Failed to create webhook:')
    console.error(JSON.stringify(data, null, 2))
    process.exit(1)
  }

  console.log('✅ Webhook created successfully!')
  console.log(JSON.stringify(data, null, 2))
  console.log()
  console.log('Add this to your .env:')
  console.log(`SANITY_WEBHOOK_SECRET=${WEBHOOK_SECRET}`)
}

createWebhook().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
