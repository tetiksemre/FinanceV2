import { createClient } from '@/lib/supabase'

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  icon?: string
  user_id?: string
  metadata: Record<string, any>
}

export interface Transaction {
  id: string
  user_id: string
  category_id?: string
  asset_id?: string
  amount: number
  description?: string
  metadata: Record<string, any>
  transaction_date: string
  categories?: Category
  deleted_at?: string | null
}

export interface Asset {
  id: string
  user_id: string
  name: string
  type: 'Gayrimenkul' | 'Araç' | 'Elektronik' | 'Nakit/Banka' | 'Yatırım' | 'Diğer/Kişisel'
  balance: number
  metadata: Record<string, any>
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export const ASSET_TYPES = ['Gayrimenkul', 'Araç', 'Elektronik', 'Nakit/Banka', 'Yatırım', 'Diğer/Kişisel'] as const;

export interface Rule {
  id: string
  user_id: string
  keyword: string
  category_id?: string
  tags?: string[]
  metadata: {
    is_ignore?: boolean;
    [key: string]: any;
  }
  created_at?: string
  deleted_at?: string | null
}

export interface Schedule {
  id: string
  rotation_type: string
  responsible_user_id: string | null
  description?: string
  expected_amount?: number
  due_date?: string
  metadata: Record<string, any>
  created_at?: string
  deleted_at?: string | null
}

export interface Liability {
  id: string
  user_id: string
  family_id?: string
  name: string
  type: 'LOAN' | 'PERSONAL' | 'CREDIT_CARD_DEBT' | 'TAX'
  principal_amount: number
  remaining_amount: number
  interest_rate?: number
  start_date: string
  term_months?: number
  metadata: Record<string, any>
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface Tag {
  id: string
  user_id: string
  name: string
  color?: string
  metadata: Record<string, any>
  created_at?: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  family_id?: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  status?: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  metadata: Record<string, any>
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

// FAZ 27: Alacak (Receivable) — Biri̇ne verilen borç kaydı
export interface Receivable {
  id: string
  user_id: string
  debtor_name: string           // Borçlunun adı
  principal_amount: number      // Verilen tutar
  collected_amount: number      // Tahsilat edilen tutar (kısmi için)
  due_date?: string             // Ödeme vadesi
  status: 'PENDING' | 'PARTIAL' | 'COLLECTED'
  asset_id?: string             // Tahsilat varlığa işlenecekse
  metadata: {
    purpose?: string            // Borç veriliş amacı
    reminder_days?: number      // Hatırlatma periyotu (gün)
    linked_transaction_id?: string
    [key: string]: any
  }
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

// FAZ 28: Asset History kaydı
export interface AssetHistoryEntry {
  id: string
  asset_id: string
  amount: number
  user_id: string
  metadata: Record<string, any>
  created_at?: string
}

export const financeService = {
  async getCategories() {
    const supabase = createClient()
    await supabase.auth.getSession() 
    
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    let query = supabase.from('categories').select('*').is('deleted_at', null);
    
    if (manualId) {
      query = query.or(`user_id.is.null,user_id.eq.${manualId}`);
    }

    const { data, error } = await query.order('name')
    if (error) throw error
    return data as Category[]
  },

  // Hata 3 Düzeltmesi: createCategory artık bu servis üzerinden geçiyor
  async createCategory(category: Omit<Category, 'id'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID || user?.id;

    if (!targetUserId) {
      return {
        ...category,
        id: `local-cat-${Date.now()}`,
        user_id: 'local-user'
      } as Category;
    }

    const payload = { ...category, user_id: targetUserId };

    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('KRITIK HATA TESPITI (Create Category):', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }

    return data as Category;
  },

  async updateCategory(id: string, updates: Partial<Omit<Category, 'id' | 'user_id'>>) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)

    if (error) {
       console.error("KRITIK HATA TESPITI (Update Category):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
       throw error;
    }
  },

  async deleteCategory(id: string) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { error } = await supabase
      .from('categories')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
       console.error("KRITIK HATA TESPITI (Delete Category):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
       throw error;
    }
  },

  // Düzeltme 7: limit=100 sabit değeri kaldırıldı.
  // Analytics motorları (ForecastEngine, AnalyticsEngine, BurnRate) TÜM işlemleri görmeli.
  // Sayfalama gerekirse ayrı getTransactionsPaged(page, pageSize) metodu kullanılacak.
  async getTransactions(limit = 5000) {
    const supabase = createClient()
    await supabase.auth.getSession()
    
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    let query = supabase.from('transactions').select('*, categories(*)').is('deleted_at', null);
    
    if (manualId) {
      query = query.eq('user_id', manualId);
    }

    const { data, error } = await query
      .order('transaction_date', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data as Transaction[]
  },

  // Sayfalandırılmış veri çekme — Master Ledger sayfa bazlı yükleme için (Faz 12.7)
  async getTransactionsPaged(page = 0, pageSize = 50) {
    const supabase = createClient()
    await supabase.auth.getSession()
    
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    let query = supabase.from('transactions').select('*, categories(*)', { count: 'exact' }).is('deleted_at', null);
    if (manualId) query = query.eq('user_id', manualId);

    const { data, error, count } = await query
      .order('transaction_date', { ascending: false })
      .range(from, to)
    if (error) throw error
    return { data: data as Transaction[], total: count || 0 }
  },

  async getSchedules() {
    const supabase = createClient()
    await supabase.auth.getSession()
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .is('deleted_at', null)
      .order('id')
    if (error) throw error
    return data as Schedule[]
  },

  async createTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'categories'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Dev-Mode Bypass: Priority to manual ID if auth is missing
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    if (!targetUserId) {
      console.warn('Local mode: Unauthenticated and no Manual ID. Inserting transaction locally.');
      return {
        ...transaction,
        id: `local-tx-${Date.now()}`,
        user_id: 'local-user',
        transaction_date: transaction.transaction_date || new Date().toISOString()
      } as Transaction;
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        user_id: targetUserId
      })
      .select('*, categories(*)')
      .single()

    if (error) {
       console.error("KRITIK HATA TESPITI (Transaction):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
       throw error;
    }

    const newTx = data as Transaction;

    // 22.2: Link tags to junction table if they exist in metadata
    if (newTx.metadata?.tags && Array.isArray(newTx.metadata.tags)) {
      const { data: tagInfos } = await supabase
        .from('tags')
        .select('id')
        .in('name', newTx.metadata.tags);
      
      if (tagInfos && tagInfos.length > 0) {
        await supabase
          .from('transaction_tags')
          .insert(tagInfos.map(t => ({ transaction_id: newTx.id, tag_id: t.id })));
      }
    }

    // 23.6: Debt Auto-Reduction (Eğer işlem giderse ve liability_id varsa bakiyeyi düşür)
    if (newTx.metadata?.liability_id && Number(newTx.amount) < 0) {
      await this._internalReduceLiability(newTx.metadata.liability_id, Number(newTx.amount));
    }

    // 27.X: Receivable Auto-Reduction (Eğer işlem gelirse ve receivable_id varsa tahsilatı artır)
    if (newTx.metadata?.receivable_id && Number(newTx.amount) > 0) {
      await this._internalReduceReceivable(newTx.metadata.receivable_id, Number(newTx.amount));
    }

    return newTx;
  },

  // Yardımcı Metot: Borç bakiyesini düşür
  async _internalReduceLiability(liabilityId: string, amount: number) {
    const supabase = createClient();
    const { data: liability } = await supabase
      .from('liabilities')
      .select('remaining_amount')
      .eq('id', liabilityId)
      .single();
    
    if (liability) {
      const newRemaining = Math.max(0, (Number(liability.remaining_amount) || 0) + amount);
      await supabase
        .from('liabilities')
        .update({ remaining_amount: newRemaining, updated_at: new Date().toISOString() })
        .eq('id', liabilityId);
    }
  },

  // Yardımcı Metot: Alacak tahsilatını artır
  async _internalReduceReceivable(receivableId: string, amount: number) {
    const supabase = createClient();
    const { data: rec } = await supabase
      .from('receivables')
      .select('principal_amount, collected_amount')
      .eq('id', receivableId)
      .single();
    
    if (rec) {
      const newCollected = (Number(rec.collected_amount) || 0) + amount;
      const newStatus = newCollected >= Number(rec.principal_amount) ? 'COLLECTED' : 'PARTIAL';
      await supabase
        .from('receivables')
        .update({ 
            collected_amount: newCollected, 
            status: newStatus,
            updated_at: new Date().toISOString() 
        })
        .eq('id', receivableId);
    }
  },

  async getAssets() {
    const supabase = createClient()
    await supabase.auth.getSession()
    
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

    if (!targetUserId) {
      return {
        ...asset,
        id: `local-asset-${Date.now()}`,
        user_id: 'local-user'
      } as Asset;
    }

    const { data, error } = await supabase
      .from('assets')
      .insert({ ...asset, user_id: targetUserId })
      .select()
      .single()

    if (error) throw error

    // Create history record
    await supabase.from('asset_history').insert({
      asset_id: data.id,
      amount: data.balance || 0,
      user_id: targetUserId,
      metadata: { action: 'initial_creation' }
    });

    return data as Asset
  },

  async updateAsset(id: string, updates: Partial<Omit<Asset, 'id' | 'user_id'>>) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If balance changed, log to history
    if (updates.balance !== undefined) {
      const { data: { user } } = await supabase.auth.getUser()
      const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
      
      if (targetUserId) {
        await supabase.from('asset_history').insert({
          asset_id: id,
          amount: updates.balance,
          user_id: targetUserId,
          metadata: { action: 'manual_update', updates }
        });
      }
    }

    return data as Asset;
  },

  async deleteAsset(id: string) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { error } = await supabase
      .from('assets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  },

  async getRules() {
    const supabase = createClient()
    await supabase.auth.getSession()
    
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    let query = supabase.from('rules').select('*').is('deleted_at', null);
    if (manualId) query = query.eq('user_id', manualId);

    const { data, error } = await query.order('keyword')
    if (error) throw error
    return data as Rule[]
  },

  async createRule(rule: Omit<Rule, 'id' | 'user_id' | 'created_at' | 'deleted_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    if (!targetUserId) {
        return { ...rule, id: `local-rule-${Date.now()}`, user_id: 'local-user' } as Rule;
    }

    const { data, error } = await supabase
      .from('rules')
      .insert({ ...rule, user_id: targetUserId })
      .select()
      .single()

    if (error) throw error
    return data as Rule
  },

  async deleteRule(id: string) {
    if (id && id.startsWith('local-')) return;
    const supabase = createClient()
    const { error } = await supabase
      .from('rules')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async updateRule(id: string, updates: Partial<Omit<Rule, 'id' | 'user_id' | 'created_at'>>) {
    if (id && id.startsWith('local-')) return;
    const supabase = createClient()
    const { error } = await supabase
      .from('rules')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  },

  async bulkUpdateTransactions(ids: string[], updates: Partial<Transaction>) {
    const supabase = createClient()
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .in('id', ids)
      .is('deleted_at', null);

    if (error) {
       console.error("KRITIK HATA TESPITI (Bulk Update):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
       throw error;
    }
  },

  async linkTransactionsToRelation(ids: string[], relationType: 'liability' | 'receivable', relationId: string) {
    const supabase = createClient();
    
    // 1. Get transactions to know their amounts
    const { data: txs } = await supabase
      .from('transactions')
      .select('id, amount, metadata')
      .in('id', ids)
      .is('deleted_at', null);
      
    if (!txs || txs.length === 0) return;
    
    for (const tx of txs) {
      // Avoid double-linking
      if (relationType === 'liability' && tx.metadata?.liability_id === relationId) continue;
      if (relationType === 'receivable' && tx.metadata?.receivable_id === relationId) continue;
      
      const newMetadata = { ...tx.metadata };
      if (relationType === 'liability') {
        newMetadata.liability_id = relationId;
        if (Number(tx.amount) < 0) {
           await this._internalReduceLiability(relationId, Number(tx.amount));
        }
      } else {
        newMetadata.receivable_id = relationId;
        if (Number(tx.amount) > 0) {
           await this._internalReduceReceivable(relationId, Number(tx.amount));
        }
      }
      
      await supabase
        .from('transactions')
        .update({ metadata: newMetadata })
        .eq('id', tx.id);
    }
  },

  async updateTransaction(id: string, updates: Partial<Transaction>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select('*, categories(*)')
      .single()

    if (error) throw error
    return data as Transaction
  },

  async bulkDeleteTransactions(ids: string[]) {
    const supabase = createClient()
    
    // Faz 23.6: Silinen işlemlerin borç/alacak etkisini geri al
    const { data: txsToDelete } = await supabase
      .from('transactions')
      .select('amount, metadata')
      .in('id', ids)
      .is('deleted_at', null);
      
    if (txsToDelete) {
      for (const tx of txsToDelete) {
         if (tx.metadata?.liability_id && Number(tx.amount) < 0) {
            await this._internalReduceLiability(tx.metadata.liability_id, -Number(tx.amount));
         }
         if (tx.metadata?.receivable_id && Number(tx.amount) > 0) {
            await this._internalReduceReceivable(tx.metadata.receivable_id, -Number(tx.amount));
         }
      }
    }

    const { error } = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids)

    if (error) {
       console.error("KRITIK HATA TESPITI (Bulk Delete):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
       throw error;
    }
  },

  async bulkCreateTransactions(transactions: Omit<Transaction, 'id' | 'user_id'>[]) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    if (!targetUserId) {
      return transactions.map(t => ({
        ...t,
        id: `local-tx-${Math.random().toString(36).substr(2, 9)}`,
        user_id: 'local-user',
        transaction_date: t.transaction_date || new Date().toISOString()
      })) as Transaction[];
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(transactions.map(t => ({ 
        ...t, 
        user_id: targetUserId,
        category_id: t.category_id === "" ? null : t.category_id, // Safety check for empty strings
        transaction_date: t.transaction_date || (t as any).date || new Date().toISOString()
      })))
      .select('*, categories(*)')

    if (error) {
      console.error("KRITIK HATA TESPITI (Bulk Create):", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }

    const newTransactions = data as Transaction[];

    // Faz 23.6 ve 27.X: Toplu içe aktarımda borçları düşür ve alacakları tahsil et
    for (const tx of newTransactions) {
      if (tx.metadata?.liability_id && Number(tx.amount) < 0) {
        await this._internalReduceLiability(tx.metadata.liability_id, Number(tx.amount));
      }
      if (tx.metadata?.receivable_id && Number(tx.amount) > 0) {
        await this._internalReduceReceivable(tx.metadata.receivable_id, Number(tx.amount));
      }
    }

    return newTransactions;
  },

  async getTags() {
    const supabase = createClient()
    await supabase.auth.getSession()
    const { data: { user } } = await supabase.auth.getUser()
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    const targetUserId = user?.id || manualId;

    if (!targetUserId) return [] as Tag[];

    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', targetUserId)
      .order('name')

    if (error) throw error
    return data as Tag[]
  },



  async createTag(tag: Omit<Tag, 'id' | 'user_id' | 'created_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    if (!targetUserId) throw new Error('Unauthenticated');

    const { data, error } = await supabase
      .from('tags')
      .insert({ ...tag, user_id: targetUserId })
      .select()
      .single()

    if (error) throw error
    return data as Tag
  },

  async updateTag(id: string, updates: Partial<Tag>) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Tag
  },

  async deleteTag(id: string, mergeToTagId?: string) {
    const supabase = createClient()
    
    // 22.4 Merge Logic: If mergeToTagId is provided, move all transaction associations first
    if (mergeToTagId) {
      // Find all transaction IDs associated with this tag
      const { data: associations } = await supabase
        .from('transaction_tags')
        .select('transaction_id')
        .eq('tag_id', id);

      if (associations && associations.length > 0) {
        const txIds = associations.map(a => a.transaction_id);
        
        // Remove existing associations with target tag to avoid PK conflicts
        await supabase
          .from('transaction_tags')
          .delete()
          .in('transaction_id', txIds)
          .eq('tag_id', mergeToTagId);

        // Re-assign to target tag
        const newAssociations = txIds.map(tid => ({ transaction_id: tid, tag_id: mergeToTagId }));
        await supabase.from('transaction_tags').insert(newAssociations);

        // SYNC METADATA for merged transactions
        const { data: targetTag } = await supabase.from('tags').select('name').eq('id', mergeToTagId).single();
        const { data: sourceTag } = await supabase.from('tags').select('name').eq('id', id).single();
        
        if (targetTag && sourceTag) {
          const { data: txsToUpdate } = await supabase
            .from('transactions')
            .select('id, metadata')
            .in('id', txIds)
            .is('deleted_at', null);
          if (txsToUpdate) {
            await Promise.all(txsToUpdate.map(async tx => {
              const currentTags = tx.metadata?.tags || [];
              const filteredTags = currentTags.filter((t: string) => t !== sourceTag.name);
              const mergedTags = Array.from(new Set([...filteredTags, targetTag.name]));
              return supabase.from('transactions').update({ metadata: { ...tx.metadata, tags: mergedTags } }).eq('id', tx.id);
            }));
          }
        }
      }
    }

    // Hata 1 Düzeltmesi: Fiziksel DELETE yerine Soft Delete kullanılıyor (Manifest Kural 6)
    // Not: transaction_tags junction tablosundaki ilişki silinmeye devam eder (referential integrity)
    await supabase
      .from('transaction_tags')
      .delete()
      .eq('tag_id', id);

    const { error } = await supabase
      .from('tags')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error
  },

  async linkTransactionsToTags(transactionIds: string[], tagNamesOrIds: string[]) {
    const supabase = createClient()
    
    // 22.2: Ensure we have actual Tag IDs if names were passed
    let tagIds = tagNamesOrIds;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    // Check if the inputs are names or IDs by testing the first element (if exists)
    if (tagNamesOrIds.length > 0 && !isUuid.test(tagNamesOrIds[0])) {
      const { data: tagInfos } = await supabase
        .from('tags')
        .select('id')
        .in('name', tagNamesOrIds);
      
      if (tagInfos) {
        tagIds = tagInfos.map(t => t.id);
      }
    }

    if (tagIds.length === 0) return;

    // 1. Bulk delete existing associations to avoid duplicates
    await supabase
      .from('transaction_tags')
      .delete()
      .in('transaction_id', transactionIds)
      .in('tag_id', tagIds);

    // 2. Bulk insert new associations
    const associations = transactionIds.flatMap(tid => 
      tagIds.map(tgid => ({ transaction_id: tid, tag_id: tgid }))
    );

    const { error: junctionError } = await supabase
      .from('transaction_tags')
      .insert(associations);

    if (junctionError) throw junctionError;

    // 3. Keep metadata synced (Faz 22 Mandatory)
    const { data: tagsInfo } = await supabase
      .from('tags')
      .select('name')
      .in('id', tagIds);

    if (tagsInfo) {
      const tagNames = tagsInfo.map(t => t.name);
      
      for (const tid of transactionIds) {
        const { data: tx } = await supabase
          .from('transactions')
          .select('metadata')
          .eq('id', tid)
          .is('deleted_at', null)
          .single();

        if (tx) {
          const currentTags = tx.metadata?.tags || [];
          const updatedTags = Array.from(new Set([...currentTags, ...tagNames]));
          await supabase
            .from('transactions')
            .update({ metadata: { ...tx.metadata, tags: updatedTags } })
            .eq('id', tid)
            .is('deleted_at', null);
        }
      }
    }
  },

  // Faz 23: Liabilities CRUD
  async getLiabilities() {
    const supabase = createClient()
    await supabase.auth.getSession()
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    let query = supabase.from('liabilities').select('*').is('deleted_at', null);
    if (manualId) query = query.eq('user_id', manualId);

    const { data, error } = await query.order('name')
    if (error) throw error
    return data as Liability[]
  },

  async createLiability(liability: Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    if (!targetUserId) {
        return { ...liability, id: `local-debt-${Date.now()}`, user_id: 'local-user' } as Liability;
    }

    const { data, error } = await supabase
      .from('liabilities')
      .insert({ ...liability, user_id: targetUserId })
      .select()
      .single()

    if (error) throw error
    return data as Liability
  },

  async updateLiability(id: string, updates: Partial<Liability>) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { data, error } = await supabase
      .from('liabilities')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (error) throw error
    return data as Liability
  },

  async deleteLiability(id: string) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { error } = await supabase
      .from('liabilities')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  // Faz 25.5: Clean-up Service
  async cleanupIgnoredTransactions() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    if (!targetUserId) return;

    // Delete transactions that are ignored and soft-deleted
    const { error } = await supabase
      .from('transactions')
      .delete() // Physical delete for cleanup
      .eq('user_id', targetUserId)
      .not('deleted_at', 'is', null)
      .eq('metadata->>status', 'ignored');

    if (error) throw error;
  },

  // Faz 29: Savings Goals CRUD
  async getGoals() {
    const supabase = createClient()
    await supabase.auth.getSession()
    
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    let query = supabase.from('savings_goals').select('*').is('deleted_at', null);
    
    if (manualId) {
      query = query.eq('user_id', manualId);
    }

    const { data, error } = await query.order('target_date')
    if (error) throw error
    return data as SavingsGoal[]
  },

  async createGoal(goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    if (!targetUserId) {
      return { 
        ...goal, 
        id: `local-goal-${Date.now()}`, 
        user_id: 'local-user', 
        current_amount: goal.current_amount || 0 
      } as SavingsGoal;
    }

    const { data, error } = await supabase
      .from('savings_goals')
      .insert({ ...goal, user_id: targetUserId })
      .select()
      .single()

    if (error) throw error
    return data as SavingsGoal
  },

  async updateGoal(id: string, updates: Partial<SavingsGoal>) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { data, error } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as SavingsGoal
  },

  async deleteGoal(id: string) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { error } = await supabase
      .from('savings_goals')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  // ─── FAZ 27: Receivables CRUD ─────────────────────────────────────────────
  async getReceivables() {
    const supabase = createClient()
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    let query = supabase.from('receivables').select('*').is('deleted_at', null);
    if (manualId) query = query.eq('user_id', manualId);
    const { data, error } = await query.order('due_date', { ascending: true });
    if (error) throw error
    return data as Receivable[]
  },

  async createReceivable(rec: Omit<Receivable, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    if (!targetUserId) {
      return { ...rec, id: `local-rec-${Date.now()}`, user_id: 'local-user' } as Receivable;
    }
    const { data, error } = await supabase
      .from('receivables')
      .insert({ ...rec, user_id: targetUserId })
      .select().single()
    if (error) throw error
    return data as Receivable
  },

  async updateReceivable(id: string, updates: Partial<Receivable>) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { data, error } = await supabase
      .from('receivables').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data as Receivable
  },

  async deleteReceivable(id: string) {
    if (id.startsWith('local-')) return;
    const supabase = createClient()
    const { error } = await supabase
      .from('receivables')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  // 27.7: Tahsilat → Asset bakiyesine ekle
  async collectReceivable(receivableId: string, amount: number, assetId?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const targetUserId = user?.id || process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

    // 1. Alacağı güncelle
    const { data: rec } = await supabase
      .from('receivables').select('*').eq('id', receivableId).single();
    if (!rec) throw new Error('Receivable bulunamadı');

    const newCollected = (Number(rec.collected_amount) || 0) + amount;
    const newStatus = newCollected >= Number(rec.principal_amount) ? 'COLLECTED' : 'PARTIAL';

    await supabase.from('receivables').update({
      collected_amount: newCollected,
      status: newStatus,
      updated_at: new Date().toISOString()
    }).eq('id', receivableId);

    // 2. Varsa ilgili varlığın bakiyesini artır
    if (assetId && !assetId.startsWith('local-') && targetUserId) {
      const { data: asset } = await supabase.from('assets').select('balance').eq('id', assetId).single();
      if (asset) {
        const newBalance = (Number(asset.balance) || 0) + amount;
        await supabase.from('assets').update({ balance: newBalance }).eq('id', assetId);
        await supabase.from('asset_history').insert({
          asset_id: assetId, amount: newBalance, user_id: targetUserId,
          metadata: { action: 'receivable_collection', receivable_id: receivableId, collected: amount }
        });
      }
    }

    // 3. İşlemler Defterine (Transactions) Gelir olarak kayıt at (Faz 27.9)
    if (targetUserId) {
      await financeService.createTransaction({
        amount: amount,
        description: `${rec.debtor_name} Tahsilatı`,
        metadata: { import_type: 'INCOME', receivable_id: receivableId },
        transaction_date: new Date().toISOString(),
        asset_id: assetId
      });
    }
  },

  // ─── FAZ 28: Asset History sorgulama ────────────────────────────────────
  async getAssetHistory(assetId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('asset_history')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data as AssetHistoryEntry[]
  },

  async getAllAssetHistory() {
    const supabase = createClient()
    const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;
    let query = supabase.from('asset_history').select('*');
    if (manualId) query = query.eq('user_id', manualId);
    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error
    return data as AssetHistoryEntry[]
  }
}
