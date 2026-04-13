import { createClient } from '@/lib/supabase'

export interface Asset {
  id: string
  user_id: string
  name: string
  type: string
  balance: number
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export const assetService = {
  async getAssets() {
    const supabase = createClient()
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    let query = supabase.from('assets').select('*').is('deleted_at', null);
    
    if (manualId) {
      query = query.eq('user_id', manualId);
    }

    const { data, error } = await query.order('name')
    if (error) throw error
    return data as Asset[]
  },

  async createAsset(asset: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    if (!targetUserId) throw new Error('Not authenticated and no Manual ID')

    const { data, error } = await supabase
      .from('assets')
      .insert({
        ...asset,
        user_id: targetUserId
      })
      .select()
      .single()
    
    if (error) throw error

    // Create history record
    await supabase.from('asset_history').insert({
      asset_id: data.id,
      amount: data.balance || 0,
      user_id: targetUserId,
      metadata: { action: 'initial_creation_via_asset_service' }
    });

    return data as Asset
  },

  async updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'user_id' | 'created_at'>>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error

    // Log history if balance changed
    if (updates.balance !== undefined) {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
      
      if (targetUserId) {
        await supabase.from('asset_history').insert({
          asset_id: id,
          amount: updates.balance,
          user_id: targetUserId,
          metadata: { action: 'update_via_asset_service', updates }
        });
      }
    }

    return data as Asset
  },

  async deleteAsset(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('assets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}
