import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const manualProfileId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID

if (!supabaseUrl || !supabaseKey || !manualProfileId) {
  console.error('Missing environment variables in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testImporter() {
  console.log('🚀 Phase 11: Starting Test Importer...')
  console.log(`Target Profile ID: ${manualProfileId}`)

  // 1. Create a Test Category
  console.log('\n1. Creating Test Category...')
  const { data: category, error: catError } = await supabase
    .from('categories')
    .insert({
      name: `Test Kat ${Date.now()}`,
      type: 'expense',
      icon: 'Shield',
      user_id: manualProfileId
    })
    .select()
    .single()

  if (catError) {
    console.error('❌ Category creation failed:', catError.message)
    return
  }
  console.log('✅ Category created:', category.id)

  // 2. Create a Test Transaction
  console.log('\n2. Creating Test Transaction...')
  const { data: transaction, error: transError } = await supabase
    .from('transactions')
    .insert({
      amount: 156.45,
      description: 'Test Harcaması (Faz 11 Test)',
      category_id: category.id,
      user_id: manualProfileId,
      transaction_date: new Date().toISOString()
    })
    .select()
    .single()

  if (transError) {
    console.error('❌ Transaction creation failed:', transError.message)
    // Cleanup category if transaction fails
    await supabase.from('categories').delete().eq('id', category.id)
    return
  }
  console.log('✅ Transaction created:', transaction.id)

  console.log('\n🎉 Phase 11 Test Successful!')
  console.log('Verify these items on your Dashboard.')
}

testImporter().catch(console.error)
