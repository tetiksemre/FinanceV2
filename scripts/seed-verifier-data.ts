import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const manualProfileId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID

if (!supabaseUrl || !supabaseKey || !manualProfileId) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedData() {
  console.log('🌱 Seeding test data for verifier...')
  
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('user_id', manualProfileId)

  if (!categories || categories.length === 0) {
    console.error('No categories found. Please run test-importer first.')
    return
  }

  const catId = categories[0].id
  
  const transactions = [
    {
      description: 'SEED: Market Harcaması 1',
      amount: 120.50,
      category_id: catId,
      user_id: manualProfileId,
      transaction_date: new Date().toISOString(),
      metadata: { tags: ['test', 'bulk'] }
    },
    {
      description: 'SEED: Market Harcaması 2',
      amount: 85.00,
      category_id: catId,
      user_id: manualProfileId,
      transaction_date: new Date().toISOString(),
      metadata: { tags: ['test'] }
    },
    {
      description: 'SEED: Cafe Harcaması',
      amount: 45.00,
      category_id: catId,
      user_id: manualProfileId,
      transaction_date: new Date().toISOString(),
      metadata: { tags: ['test', 'coffee'] }
    }
  ]

  const { data, error } = await supabase
    .from('transactions')
    .insert(transactions)
    .select()

  if (error) {
    console.error('❌ Seeding failed:', error.message)
  } else {
    console.log(`✅ ${data.length} transactions seeded successfully!`)
  }
}

seedData().catch(console.error)
