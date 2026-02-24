import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !dataset) {
  console.error('[delete] Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET in environment.')
  process.exit(1)
}

if (!token) {
  console.error('[delete] Missing SANITY_WRITE_TOKEN. Create a token with write access in Sanity project settings.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })

const typesToDelete = ['user', 'customer']

async function fetchIds() {
  const query = '*[_type in $types]{ _id }'
  const docs = await client.fetch(query, { types: typesToDelete })
  return docs.map((doc) => doc._id)
}

async function deleteAll(ids) {
  if (ids.length === 0) {
    console.log('[delete] No matching documents found.')
    return
  }

  const transaction = client.transaction()
  ids.forEach((id) => transaction.delete(id))
  await transaction.commit()
  console.log(`[delete] Deleted ${ids.length} documents.`)
}

async function run() {
  try {
    const ids = await fetchIds()
    await deleteAll(ids)
  } catch (error) {
    console.error('[delete] Failed to delete documents:', error)
    process.exit(1)
  }
}

run()
