import { createClient } from '@sanity/client'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_WRITE_TOKEN

if (!projectId || !dataset) {
  console.error('[types] Missing NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET in environment.')
  process.exit(1)
}

if (!token) {
  console.error('[types] Missing SANITY_WRITE_TOKEN. Create a token with read access in Sanity project settings.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: '2024-01-01', token, useCdn: false })

async function run() {
  try {
    const types = await client.fetch('array::unique(*[]._type)')
    if (!Array.isArray(types) || types.length === 0) {
      console.log('[types] No documents found in this dataset.')
      return
    }

    const counts = []
    for (const type of types) {
      const count = await client.fetch('count(*[_type == $type])', { type })
      counts.push({ type, count })
    }

    counts.sort((a, b) => a.type.localeCompare(b.type))
    console.log('[types] Document counts by type:')
    counts.forEach((entry) => {
      console.log(`${entry.type}: ${entry.count}`)
    })
  } catch (error) {
    console.error('[types] Failed to list document types:', error)
    process.exit(1)
  }
}

run()
