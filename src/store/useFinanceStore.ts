import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { financeService, Transaction, Category, Schedule, Asset, Rule, Liability, Tag, SavingsGoal, Receivable } from '@/services/financeService'
import { toast } from 'sonner'
import { forecastEngine } from '@/services/ForecastEngine'    // Düzeltme 8: require() → ES import
import { analyticsEngine } from '@/services/AnalyticsEngine'  // Düzeltme 8: require() → ES import
import { ruleEngine } from '@/services/RuleEngine'            // Faz 30.1: require() → ES import düzeltmesi

interface FinanceState {
  transactions: Transaction[]
  categories: Category[]
  assets: Asset[]
  liabilities: Liability[]
  rules: Rule[]
  schedules: Schedule[]
  tags: Tag[]
  goals: SavingsGoal[]
  receivables: Receivable[]
  offlineQueue: any[]
  loading: boolean
  error: string | null
  lastFetchedAt: number | null  // Faz 30.1: TTL cache guard
  fetchStats: () => Promise<void>
  
  // Actions
  fetchFinanceData: (force?: boolean) => Promise<void>
  addTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'transaction_date' | 'categories'> & { transaction_date?: string }) => Promise<void>
  bulkAddTransactions: (transactions: (Omit<Transaction, 'id' | 'user_id' | 'transaction_date' | 'categories'> & { transaction_date?: string })[]) => Promise<void>
  syncOfflineTransactions: () => Promise<void>
  
  // Category Management
  addCategory: (category: Omit<Category, 'id' | 'user_id'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Omit<Category, 'id' | 'user_id'>>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  setCategoryBudget: (id: string, limit: number) => Promise<void>

  // Asset Management
  addAsset: (asset: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateAsset: (id: string, updates: Partial<Omit<Asset, 'id' | 'user_id'>>) => Promise<void>
  deleteAsset: (id: string) => Promise<void>

  // Liability Management
  addLiability: (liability: Omit<Liability, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<void>
  updateLiability: (id: string, updates: Partial<Liability>) => Promise<void>
  deleteLiability: (id: string) => Promise<void>

  // Rule Management
  addRule: (rule: Omit<Rule, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateRule: (id: string, updates: Partial<Rule>) => Promise<void>
  deleteRule: (id: string) => Promise<void>
  updateTransactionsCategory: (ids: string[], categoryId: string) => Promise<void>
  deleteTransactions: (ids: string[]) => Promise<void>
  linkTransactionsToRelation: (ids: string[], relationType: 'liability' | 'receivable', relationId: string) => Promise<void>
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>
  addTagsToTransactions: (ids: string[], tagIds: string[]) => Promise<void>
  cleanupIgnoredTransactions: () => Promise<void>
  
  // Goal Management
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<SavingsGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  // Receivable Management (FAZ 27)
  addReceivable: (rec: Omit<Receivable, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<void>
  updateReceivable: (id: string, updates: Partial<Receivable>) => Promise<void>
  deleteReceivable: (id: string) => Promise<void>
  collectReceivable: (id: string, amount: number, assetId?: string) => Promise<void>
  
  // Tag Management
  addTag: (tag: Omit<Tag, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>
  deleteTag: (id: string, mergeToTagId?: string) => Promise<void>
  
  // Computed (Getters)
  getIncomeTotal: () => number
  getExpenseTotal: () => number
  getNetWorth: () => number
  getReceivableNetBalance: () => number  // Faz 30.4: Tahsil edilmemiş alacak tutarı (pozitif varlık)
  getRunningBalance: (days: number) => { date: string, balance: number }[]
  getSpendingVelocity: () => { dailyAverage: number, daysRemaining: number | 'infinite' }
  getForecastData: (days?: number) => import('@/services/ForecastEngine').ProjectionPoint[]
  getCategoryBurnRates: () => { categoryId: string, burnRate: number, status: 'safe' | 'warning' | 'danger' }[]
  getCategoryTrend: (categoryId: string) => import('@/services/AnalyticsEngine').CategoryTrend[]
  getCategoryAnomalies: (categoryId: string) => import('@/services/AnalyticsEngine').Anomaly[]
  getSuggestedRulesForTransactions: () => { transaction: Transaction, suggestedCategory: Category }[]
  getTagTrend: (tagName: string) => import('@/services/AnalyticsEngine').CategoryTrend[]
  getTagCategoryDistribution: (tagName: string) => { categoryName: string, amount: number, color: string }[]
  getCategoryMerchantDistribution: (categoryId: string) => { merchantName: string, amount: number, count: number, color: string }[]
  getTagMerchantDistribution: (tagName: string) => { merchantName: string, amount: number, count: number, color: string }[]
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: [],
      assets: [],
      liabilities: [],
      rules: [],
      schedules: [],
      tags: [],
      goals: [],
      receivables: [],
      offlineQueue: [],
      loading: false,
      error: null,
      lastFetchedAt: null,  // Faz 30.1: TTL cache guard

      fetchFinanceData: async (force = false) => {
        // Faz 30.1: TTL Cache Guard — 60 saniyelik önbellekleme
        const CACHE_TTL = 60_000; // 60 saniye
        const now = Date.now();
        const { lastFetchedAt, loading } = get();

        if (!force && !loading && lastFetchedAt && (now - lastFetchedAt) < CACHE_TTL) {
          return; // Cache hâlâ geçerli, fetch atla
        }

        if (loading) return; // Zaten devam eden bir fetch var

        set({ loading: true, error: null })
        try {
          const supabase = (await import('@/lib/supabase')).createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          const manualId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID;

          if (!user && !manualId) {
            console.warn('Local mode: User not authenticated and no Manual ID. Fetching from local storage fallback.');
            set({ loading: false });
            return;
          }

          const [transactions, categories, schedules, assets, rules, tags, liabilities, goals, receivables] = await Promise.all([
            financeService.getTransactions().catch(err => { console.error("Txs fetch failed:", err); return []; }),
            financeService.getCategories().catch(err => { console.error("Cats fetch failed:", err); return []; }),
            financeService.getSchedules().catch(err => { console.error("Schedules fetch failed:", err); return []; }),
            financeService.getAssets().catch(err => { console.error("Assets fetch failed:", err); return []; }),
            financeService.getRules().catch(err => { console.error("Rules fetch failed:", err); return []; }),
            financeService.getTags().catch(err => { console.error("Tags fetch failed:", err); return []; }),
            financeService.getLiabilities().catch(err => { console.error("Liabilities fetch failed:", err); return []; }),
            financeService.getGoals().catch(err => { console.error("Goals fetch failed:", err); return []; }),
            financeService.getReceivables().catch(err => { console.error("Receivables fetch failed:", err); return []; })
          ])

          ruleEngine.setRules(rules || []);
          ruleEngine.setCategories(categories || []);

          set({ 
            transactions: transactions || [], 
            categories: categories || [], 
            schedules: schedules || [],
            assets: assets || [],
            liabilities: liabilities || [],
            rules: rules || [],
            tags: tags || [],
            goals: goals || [],
            receivables: receivables || [],
            loading: false,
            lastFetchedAt: now  // Faz 30.1: TTL damgası
          })
        } catch (err: any) {
          const errorMsg = err.message || 'Veriler yüklenirken bir hata oluştu.';
          toast.error('Hata', { description: errorMsg });
          set({ error: errorMsg, loading: false })
        }
      },

      addTransaction: async (transactionData) => {
        const isOnline = typeof navigator !== 'undefined' && navigator.onLine;

        if (!isOnline) {
          const tempId = `temp-${Date.now()}`;
          const category = get().categories.find(c => c.id === transactionData.category_id);
          const tempTransaction: any = {
            ...transactionData,
            id: tempId,
            transaction_date: transactionData.transaction_date || new Date().toISOString(),
            metadata: { ...transactionData.metadata, isOffline: true },
            categories: category // Attach category info for immediate calculation
          };

          set((state) => ({
            transactions: [tempTransaction, ...state.transactions],
            offlineQueue: [...state.offlineQueue, transactionData]
          }));
          return;
        }

        set({ loading: true, error: null })
        try {
          const newTransaction = await financeService.createTransaction(transactionData as any)
          // Faz 30.1: Optimistic update — full refetch yerine sadece state güncelle; TTL sona erince otomatik tazeler
          set((state) => ({
            transactions: [newTransaction, ...state.transactions],
            loading: false,
            lastFetchedAt: null  // Bir sonraki navigasyonda taze fetch zorla
          }))
        } catch (err: any) {
          const errorMsg = err.message || 'İşlem eklenirken bir hata oluştu.';
          toast.error('İşlem Hatası', { description: errorMsg });
          set({ error: errorMsg, loading: false })
        }
      },

      bulkAddTransactions: async (transactions) => {
        set({ loading: true, error: null });
        try {
          const newTransactions = await financeService.bulkCreateTransactions(transactions as any);
          // Faz 30.1: Toplu işlem sonrası force refresh (borç/alacak bakiyeleri değişmiş olabilir)
          set((state) => ({
            transactions: [...newTransactions, ...state.transactions],
            loading: false,
            lastFetchedAt: null  // Force refresh tetikle
          }));
          await get().fetchFinanceData(true); // force=true: borç bakiyeleri güncellendi, tazele
          toast.success(`${newTransactions.length} işlem başarıyla eklendi`);
        } catch (err: any) {
          const errorMsg = err.message || 'Toplu işlem eklenirken bir hata oluştu.';
          toast.error('İçe Aktarım Hatası', { description: errorMsg });
          set({ error: errorMsg, loading: false });
        }
      },

      syncOfflineTransactions: async () => {
        const { offlineQueue } = get();
        if (offlineQueue.length === 0) return;

        set({ loading: true });
        const remainingQueue = [...offlineQueue];
        const failedSync: any[] = [];

        for (const item of remainingQueue) {
          try {
            await financeService.createTransaction(item);
          } catch (err: any) {
            failedSync.push(item);
          }
        }

        set({ offlineQueue: failedSync, loading: false });
        await get().fetchFinanceData();
      },

      fetchStats: async (force = false) => {
        // Task 10.17: Sync Dashboard/Stats using Manual ID
        await get().fetchFinanceData(force);
      },

      updateTransactionsCategory: async (ids, categoryId) => {
        set({ loading: true, error: null });
        try {
          await financeService.bulkUpdateTransactions(ids, { category_id: categoryId } as any);
          
          toast.success('İşlemler başarıyla güncellendi');
          set({ loading: false });
          await get().fetchFinanceData(true); // Force refresh to update joined category objects
        } catch (err: any) {
          const errorMsg = err.message || 'Toplu güncelleme sırasında hata oluştu.';
          toast.error('Guncelleme Hatası', { description: errorMsg });
          set({ error: errorMsg, loading: false });
        }
      },

      deleteTransactions: async (ids) => {
        if (ids.length === 0) return;
        set({ loading: true, error: null });
        try {
          await financeService.bulkDeleteTransactions(ids);
          set((state) => ({
            transactions: state.transactions.filter(t => !ids.includes(t.id)),
            loading: false
          }));
          toast.success(`${ids.length} işlem başarıyla silindi`);
          await get().fetchStats(true);
        } catch (err: any) {
          const errorMsg = err.message || 'Silme işlemi sırasında hata oluştu.';
          toast.error('Silme Hatası', { description: errorMsg });
          set({ error: errorMsg, loading: false });
        }
      },

      linkTransactionsToRelation: async (ids, relationType, relationId) => {
        if (ids.length === 0) return;
        set({ loading: true, error: null });
        try {
          await financeService.linkTransactionsToRelation(ids, relationType, relationId);
          toast.success('İşlemler başarıyla bağlandı');
          set({ loading: false });
          await get().fetchFinanceData(true); // Force fetch to reflect metadata and remaining amount changes
        } catch (err: any) {
          const errorMsg = err.message || 'Bağlama işlemi sırasında hata oluştu.';
          toast.error('Bağlantı Hatası', { description: errorMsg });
          set({ error: errorMsg, loading: false });
        }
      },

      updateTransaction: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updated = await financeService.updateTransaction(id, updates);
          set((state) => ({
            transactions: state.transactions.map(t => t.id === id ? updated : t),
            loading: false
          }));
          toast.success('İşlem güncellendi');
          await get().fetchStats(true);
        } catch (err: any) {
          const errorMsg = err.message || 'Güncelleme sırasında hata oluştu.';
          toast.error('Guncelleme Hatası', { description: errorMsg });
          set({ error: errorMsg, loading: false });
        }
      },

      addTagsToTransactions: async (ids, tagIds) => {
        if (ids.length === 0 || tagIds.length === 0) return;
        set({ loading: true, error: null });
        try {
          await financeService.linkTransactionsToTags(ids, tagIds);
          
          toast.success('Etiketler başarıyla eklendi');
          set({ loading: false });
          await get().fetchFinanceData(true); // Full refresh to get updated metadata tag names (force=true)
        } catch (err: any) {
          const errorMsg = err.message || 'Etiketleme sırasında hata oluştu.';
          toast.error('Etiketleme Hatası', { description: errorMsg });
          set({ error: errorMsg, loading: false });
        }
      },

      cleanupIgnoredTransactions: async () => {
        set({ loading: true, error: null });
        try {
          await financeService.cleanupIgnoredTransactions();
          toast.success('Yoksayılan işlemler temizlendi');
          set({ loading: false });
          await get().fetchFinanceData(true);
        } catch (err: any) {
          toast.error('Temizlik Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      addTag: async (tagData) => {
        set({ loading: true, error: null });
        try {
          const newTag = await financeService.createTag(tagData);
          set((state) => ({
            tags: [...state.tags, newTag],
            loading: false
          }));
          toast.success('Etiket eklendi');
          // Faz 30.1: fetchFinanceData kaldırıldı — optimistic update yeterli
        } catch (err: any) {
          toast.error('Hata', { description: err.message });
          set({ loading: false });
        }
      },

      updateTag: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updated = await financeService.updateTag(id, updates);
          set((state) => ({
            tags: state.tags.map(t => t.id === id ? updated : t),
            loading: false
          }));
          toast.success('Etiket güncellendi');
        } catch (err: any) {
          toast.error('Hata', { description: err.message });
          set({ loading: false });
        }
      },

      deleteTag: async (id, mergeToTagId) => {
        set({ loading: true, error: null });
        try {
          await financeService.deleteTag(id, mergeToTagId);
          set((state) => ({
            tags: state.tags.filter(t => t.id !== id),
            loading: false
          }));
          toast.success('Etiket silindi');
          await get().fetchFinanceData();
        } catch (err: any) {
          toast.error('Hata', { description: err.message });
          set({ loading: false });
        }
      },

      addCategory: async (categoryData) => {
        set({ loading: true, error: null });
        try {
          // Hata 3 Düzeltmesi: financeService.createCategory üzerinden geçiliyor
          const newCategory = await financeService.createCategory({
            ...categoryData,
            metadata: categoryData.metadata || {}
          } as any);

          set((state) => ({
            categories: [...state.categories, newCategory],
            loading: false
          }));
          toast.success('Kategori başarıyla eklendi');
          // Faz 30.1: fetchFinanceData kaldırıldı — optimistic update yeterli
        } catch (err: any) {
          const errorMsg = err.message || 'Kategori eklenirken bir hata oluştu.';
          if (err.code === '42501') {
            toast.error('Yetki Hatası', { description: 'Bu işlemi yapmaya yetkiniz bulunmuyor (RLS).' });
          } else {
            toast.error('Kategori Hatası', { description: errorMsg });
          }
          set({ error: errorMsg, loading: false });
        }
      },

      updateCategory: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          if (id.startsWith('local-')) {
             set((state) => ({
               categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c),
               loading: false
             }));
             return;
          }

          await financeService.updateCategory(id, updates);
          
          set((state) => ({
            categories: state.categories.map(c => c.id === id ? { ...c, ...updates } : c),
            loading: false
          }));
          toast.success('Kategori güncellendi');
          // Faz 30.1: fetchFinanceData kaldırıldı — optimistic update yeterli
        } catch (err: any) {
          const errorMsg = err.message || 'Kategori güncellenirken bir hata oluştu.';
          if (err.code === '42501') {
            toast.error('Yetki Hatası', { description: 'Bu kategoriyi düzenleme yetkiniz bulunmuyor.' });
          } else {
            toast.error('Güncelleme Hatası', { description: errorMsg });
          }
          set({ error: errorMsg, loading: false });
        }
      },

      deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
          const supabase = (await import('@/lib/supabase')).createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const targetUserId = process.env.NEXT_PUBLIC_MANUAL_PROFILE_ID || user?.id;

          let stateCategories = get().categories;
          let digerCategory = stateCategories.find(c => c.name.toLowerCase() === 'diğer' || c.metadata?.isSystemFallback);
          
          if (!targetUserId && id.startsWith('local-')) {
             if (!digerCategory) {
               digerCategory = { id: `local-cat-diger`, name: 'Diğer', type: 'expense', icon: 'ShoppingCart', metadata: { isSystemFallback: true } } as Category;
               set(s => ({ categories: [...s.categories, digerCategory as Category] }));
             }
             set(s => ({
               transactions: s.transactions.map(t => t.category_id === id ? { ...t, category_id: digerCategory!.id } : t),
               categories: s.categories.filter(c => c.id !== id),
               loading: false
             }));
             return;
          }

          // Ensure "Diğer" (fallback) category exists for database rows
          if (!digerCategory && targetUserId) {
            const { data: newKat } = await supabase.from('categories')
              .insert({ name: 'Diğer', type: 'expense', icon: 'ShoppingCart', user_id: targetUserId, metadata: { isSystemFallback: true } })
              .select().single();
            if (newKat) {
              digerCategory = newKat as Category;
              set(s => ({ categories: [...s.categories, digerCategory as Category] }));
            }
          }

          if (digerCategory) {
            // Reassign transactions before deleting category
            const affectedTxIds = get().transactions.filter(t => t.category_id === id).map(t => t.id);
            if (affectedTxIds.length > 0) {
              await financeService.bulkUpdateTransactions(affectedTxIds, { category_id: digerCategory.id } as any);
              set(s => ({
                transactions: s.transactions.map(t => t.category_id === id ? { ...t, category_id: digerCategory!.id } : t)
              }));
            }
          }

          await financeService.deleteCategory(id);

          set((state) => ({
            categories: state.categories.filter(c => c.id !== id),
            loading: false
          }));
          toast.success('Kategori silindi');
          // Faz 30.1: fetchFinanceData kaldırıldı — işlem tablosu optimistic güncellendi
        } catch (err: any) {
          const errorMsg = err.message || 'Kategori silinirken bir hata oluştu.';
          if (err.code === '42501') {
            toast.error('Yetki Hatası', { description: 'Bu kategoriyi silme yetkiniz bulunmuyor.' });
          } else {
            toast.error('Silme Hatası', { description: errorMsg });
          }
          set({ error: errorMsg, loading: false });
        }
      },

      setCategoryBudget: async (id, limit) => {
        set({ loading: true, error: null });
        try {
          const category = get().categories.find(c => c.id === id);
          if (!category) throw new Error('Kategori bulunamadı');

          const metadata = { ...category.metadata, budget_limit: limit };
          await get().updateCategory(id, { metadata });
          
          set({ loading: false });
        } catch (err: any) {
          console.error(err);
          set({ loading: false });
        }
      },

      addAsset: async (assetData) => {
        set({ loading: true, error: null });
        try {
          const newAsset = await financeService.createAsset(assetData);
          set((state) => ({
            assets: [...state.assets, newAsset],
            loading: false
          }));
          toast.success('Varlık başarıyla eklendi');
          // Faz 30.1: fetchFinanceData kaldırıldı — optimistic update yeterli
        } catch (err: any) {
          toast.error('Varlık Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      updateAsset: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          await financeService.updateAsset(id, updates);
          set((state) => ({
            assets: state.assets.map(a => a.id === id ? { ...a, ...updates } : a),
            loading: false
          }));
          toast.success('Varlık güncellendi');
          // Faz 30.1: fetchFinanceData kaldırıldı — optimistic update yeterli
        } catch (err: any) {
          toast.error('Guncelleme Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      deleteAsset: async (id) => {
        set({ loading: true, error: null });
        try {
          await financeService.deleteAsset(id);
          set((state) => ({
            assets: state.assets.filter(a => a.id !== id),
            loading: false
          }));
          toast.success('Varlık silindi');
          // Faz 30.1 Override: Fetch stats to trigger full re-calculation for external dashboard listeners
          await get().fetchStats();
        } catch (err: any) {
          toast.error('Silme Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      addLiability: async (liabilityData) => {
        set({ loading: true, error: null });
        try {
          const newLiability = await financeService.createLiability(liabilityData);
          set((state) => ({
            liabilities: [...state.liabilities, newLiability],
            loading: false
          }));
          toast.success('Borç eklendi');
          // Faz 30.1: fetchFinanceData kaldırıldı — optimistic update yeterli
        } catch (err: any) {
          toast.error('Borç Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      updateLiability: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          const updated = await financeService.updateLiability(id, updates);
          set((state) => ({
            liabilities: state.liabilities.map(l => l.id === id ? (updated ?? l) : l),
            loading: false
          }));
          toast.success('Borç güncellendi');
          get().fetchStats();
        } catch (err: any) {
          toast.error('Güncelleme Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      deleteLiability: async (id) => {
        set({ loading: true, error: null });
        try {
          await financeService.deleteLiability(id);
          set((state) => ({
            liabilities: state.liabilities.filter(l => l.id !== id),
            loading: false
          }));
          toast.success('Borç silindi');
          // Faz 30.1: fetchFinanceData kaldırıldı — optimistic update yeterli
        } catch (err: any) {
          toast.error('Silme Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      // Goal Actions
      addGoal: async (goal) => {
        set({ loading: true });
        try {
          const newGoal = await financeService.createGoal(goal);
          set(state => ({ goals: [...state.goals, newGoal], loading: false }));
          toast.success('Yeni hedef başarıyla eklendi.');
        } catch (err: any) {
          set({ loading: false, error: err.message });
          toast.error('Hedef eklenirken hata: ' + err.message);
        }
      },

      updateGoal: async (id, updates) => {
        set({ loading: true });
        try {
          const updatedGoal = await financeService.updateGoal(id, updates);
          if (updatedGoal) {
            set(state => ({
              goals: state.goals.map(g => g.id === id ? updatedGoal : g),
              loading: false
            }));
          }
          toast.success('Hedef güncellendi.');
        } catch (err: any) {
          set({ loading: false, error: err.message });
          toast.error('Hedef güncellenirken hata: ' + err.message);
        }
      },

      deleteGoal: async (id) => {
        set({ loading: true });
        try {
          await financeService.deleteGoal(id);
          set(state => ({
            goals: state.goals.filter(g => g.id !== id),
            loading: false
          }));
          toast.success('Hedef silindi.');
        } catch (err: any) {
          set({ loading: false, error: err.message });
          toast.error('Hedef silinirken hata: ' + err.message);
        }
      },

      addRule: async (ruleData) => {
        set({ loading: true, error: null });
        try {
          const newRule = await financeService.createRule(ruleData);
          set((state) => ({
            rules: [...state.rules, newRule],
            loading: false
          }));
          ruleEngine.setRules([...get().rules]);
          ruleEngine.setCategories([...get().categories]);
          toast.success('Kural başarıyla eklendi');
          // Faz 30.1: fetchFinanceData kaldırıldı — kural motoru optimistic güncellendi
        } catch (err: any) {
          toast.error('Kural Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      updateRule: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          await financeService.updateRule(id, updates);
          set((state) => ({
            rules: state.rules.map(r => r.id === id ? { ...r, ...updates } : r),
            loading: false
          }));
          ruleEngine.setRules([...get().rules]);
          ruleEngine.setCategories([...get().categories]);
          toast.success('Kural güncellendi');
          // Faz 30.1: fetchFinanceData kaldırıldı — kural motoru optimistic güncellendi
        } catch (err: any) {
          toast.error('Guncelleme Hatası', { description: err.message });
          set({ loading: false });
        }
      },

      deleteRule: async (id) => {
        set({ loading: true, error: null });
        try {
          // 1. Get next rules list
          const nextRules = get().rules.filter(r => r.id !== id);
          
          // 2. Local update (Optimistic)
          set({ rules: nextRules });
          
          // 3. Update related engines (Faz 30.1: require() → ES import)
          ruleEngine.setRules(nextRules);
          
          // 4. Remote delete
          await financeService.deleteRule(id);
          
          set({ loading: false });
          toast.success('Kural silindi');
          // Faz 30.1: fetchFinanceData kaldırıldı — optimistic update yeterli
        } catch (err: any) {
          toast.error('Silme Hatası', { description: err.message });
          set({ loading: false });
          // Hata durumunda force refresh yaparak state'i geri yükle
          await get().fetchFinanceData(true);
        }
      },

      // Düzeltme 5: amount işareti tek doğru kaynak (Single Source of Truth)
      // Pozitif amount = Gelir, Negatif amount = Gider
      // Önceki OR mantığı (categories.type || import_type) çakışma üretiyordu:
      //   Örnek: kategori=income ama import_type=EXPENSE → her iki toplamda birden sayılırdı
      getIncomeTotal: () => {
        return (get().transactions || [])
          .filter(t => Number(t.amount) > 0)
          .reduce((sum, t) => sum + Number(t.amount), 0)
      },

      getExpenseTotal: () => {
        return (get().transactions || [])
          .filter(t => Number(t.amount) < 0)
          .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
      },

      getNetWorth: () => {
        const totalAssets = (get().assets || []).reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
        const totalLiabilities = (get().liabilities || [])
          .filter(l => !l.deleted_at)
          .reduce((sum, l) => sum + (Number(l.remaining_amount) || 0), 0);
        // Faz 30.4: Tahsil edilmemiş alacaklar pozitif varlık olarak ekleniyor
        const totalReceivables = (get().receivables || [])
          .filter(r => !r.deleted_at && r.status !== 'COLLECTED')
          .reduce((sum, r) => sum + Math.max(0, r.principal_amount - (r.collected_amount || 0)), 0);
        return totalAssets - totalLiabilities + totalReceivables;
      },

      getReceivableNetBalance: () => {
        // Faz 30.4: Bekleyen ve kısmen tahsil edilmiş alacakların toplam kalan tutarı
        return (get().receivables || [])
          .filter(r => !r.deleted_at && r.status !== 'COLLECTED')
          .reduce((sum, r) => sum + Math.max(0, r.principal_amount - (r.collected_amount || 0)), 0);
      },

      getRunningBalance: (days: number) => {
        const transactions = get().transactions || [];
        const assets = get().assets || [];
        
        // 1. Calculate current liquid balance (Accounts & Credit Cards)
        // Note: Based on user request "Hesap & Kredi Kartı", we filter these specifically
        const liquidAssets = assets.filter(a => 
          a.type === 'Nakit/Banka' || 
          a.name.toLowerCase().includes('hesap') || 
          a.name.toLowerCase().includes('kart')
        );

        let currentBalance = liquidAssets.reduce((sum, a) => {
          return sum + (Number(a.balance) || 0);
        }, 0);

        // FALLBACK: Eğer tanımlı likit varlık yoksa veya bakiyeler 0 ise, 
        // tüm işlemlerin kümülatif toplamını (Net Balance) baz al.
        if (currentBalance === 0) {
          currentBalance = get().getIncomeTotal() - get().getExpenseTotal();
        }

        const timeline: { date: string, balance: number }[] = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Sorting transactions from newest to oldest for easier back-calculation
        const sortedTransactions = [...transactions]
          .filter(t => t.transaction_date)
          .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

        let tempBalance = currentBalance;
        let txIdx = 0;

        for (let i = 0; i < days; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];

          // Calculate balance for this day's END
          // Since we start from current balance (which is AFTER all transactions), 
          // to find balance for "yesterday", we need to:
          // Balance(Yesterday) = Balance(Today) - Income(Today) + Expense(Today)
          
          // But wait, it's easier to build it backwards from 'Now'
          timeline.unshift({ date: dateStr, balance: tempBalance });

          // Now adjust tempBalance for the day BEFORE (subtracting today's impact)
          const startOfCurrentDay = new Date(d);
          startOfCurrentDay.setHours(0, 0, 0, 0);
          const endOfCurrentDay = new Date(d);
          endOfCurrentDay.setHours(23, 59, 59, 999);

          while (txIdx < sortedTransactions.length) {
            const tx = sortedTransactions[txIdx];
            const txDate = new Date(tx.transaction_date);
            
            if (txDate > endOfCurrentDay) {
              txIdx++;
              continue;
            }
            if (txDate < startOfCurrentDay) break;

            // Transaction is within this day
            const amount = Number(tx.amount);
            const isIncome = tx.categories?.type === 'income' || tx.metadata?.import_type === 'INCOME';
            
            // If it was income, it ADDED to our balance, so moving backwards we SUBTRACT it.
            // If it was expense, it SUBTRACTED from our balance, so moving backwards we ADD it.
            if (isIncome) {
              tempBalance -= Math.abs(amount);
            } else {
              tempBalance += Math.abs(amount);
            }
            txIdx++;
          }
        }

        return timeline;
      },

      getSpendingVelocity: () => {
        const { transactions, assets } = get();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentExpenses = transactions.filter(t => {
          const isExpense = t.categories?.type === 'expense' || t.metadata?.import_type === 'EXPENSE';
          return isExpense && new Date(t.transaction_date) >= thirtyDaysAgo;
        });

        const totalExpense = recentExpenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
        const dailyAverage = totalExpense / 30;

        // Calculate current liquidity back again (or use a shared helper if common)
        const liquidAssets = assets.filter(a => 
          a.type === 'Nakit/Banka' || 
          a.name.toLowerCase().includes('hesap') || 
          a.name.toLowerCase().includes('kart')
        );

        let currentBalance = liquidAssets.reduce((sum, a) => {
          return sum + (Number(a.balance) || 0);
        }, 0);

        if (currentBalance === 0) {
          currentBalance = get().getIncomeTotal() - get().getExpenseTotal();
        }

        const daysRemaining = dailyAverage > 0 ? Math.floor(currentBalance / dailyAverage) : 'infinite';

        return { dailyAverage, daysRemaining };
      },

      // Düzeltme 8: require() ES module import ile değiştirildi (SSR güvenli)
      getForecastData: (days = 180) => {
        const { assets, transactions, schedules, liabilities, receivables } = get();
        // Faz 30.4: Alacaklar vade tarihine göre projeksiyon gelirine dahil
        return forecastEngine.calculateProjection(assets, transactions, schedules, liabilities, days, receivables);
      },

      getCategoryBurnRates: () => {
        const { transactions, categories } = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const dayOfMonth = now.getDate();
        const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        return categories
          .filter(c => c.type === 'expense' && Number(c.metadata?.budget_limit) > 0)
          .map(c => {
            const budgetLimit = Number(c.metadata?.budget_limit);
            const spent = transactions
              .filter(t => t.category_id === c.id && new Date(t.transaction_date) >= startOfMonth)
              .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

            // Burn rate: How much of the proportional budget is spent?
            // If it's day 10/30, expected spend is 33%. If actual spend is 50%, burn rate > 1.
            const expectedSpendAtThisPoint = (budgetLimit / totalDaysInMonth) * dayOfMonth;
            const burnRate = spent / expectedSpendAtThisPoint;

            let status: 'safe' | 'warning' | 'danger' = 'safe';
            if (burnRate >= 1.2) status = 'danger';
            else if (burnRate >= 0.9) status = 'warning';

            return { categoryId: c.id, burnRate, status };
          });
      },

      getSuggestedRulesForTransactions: () => {
        const { transactions, categories, rules } = get();
        // Faz 30.1: require() → module-level ES import kullanılıyor
        
        // Ensure engine is up to date
        ruleEngine.setRules(rules);
        ruleEngine.setCategories(categories);

        // Filter transactions: No category OR "Diğer"/"Bilinmeyen" category
        const targetTxs = transactions.filter(t => {
          if (!t.category_id) return true;
          const cat = categories.find(c => c.id === t.category_id);
          if (!cat) return true;
          const name = cat.name.toLowerCase().trim();
          return name === 'diğer' || name === 'bilinmeyen';
        });

        const suggestions: { transaction: any, suggestedCategory: any }[] = [];

        targetTxs.forEach(tx => {
          const result = ruleEngine.categorize(tx.description || '');
          if (result.category_id && result.category_id !== tx.category_id) {
            const suggestedCat = categories.find(c => c.id === result.category_id);
            if (suggestedCat) {
              suggestions.push({
                transaction: tx,
                suggestedCategory: suggestedCat
              });
            }
          }
        });

        return suggestions;
      },

      // Düzeltme 8: require() ES module import ile değiştirildi (SSR güvenli)
      getCategoryTrend: (categoryId: string) => {
        return analyticsEngine.getCategoryTrend(categoryId, get().transactions);
      },

      getCategoryAnomalies: (categoryId: string) => {
        return analyticsEngine.detectAnomalies(categoryId, get().transactions);
      },

      getCategoryMerchantDistribution: (categoryId: string) => {
        const categoryTxs = get().transactions.filter(t => t.category_id === categoryId);
        return analyticsEngine.getMerchantDistribution(categoryTxs);
      },

      getTagTrend: (tagName: string) => {
        return analyticsEngine.getTagTrend(tagName, get().transactions);
      },

      getTagCategoryDistribution: (tagName: string) => {
        return analyticsEngine.getTagCategoryDistribution(tagName, get().transactions, get().categories);
      },

      getTagMerchantDistribution: (tagName: string) => {
        const tagTxs = get().transactions.filter(t => t.metadata?.tags?.includes(tagName));
        return analyticsEngine.getMerchantDistribution(tagTxs);
      },

      // ─── FAZ 27: Receivable Actions ───────────────────────────────────────────
      addReceivable: async (rec) => {
        set({ loading: true });
        try {
          const created = await financeService.createReceivable(rec);
          set(state => ({ receivables: [created, ...state.receivables], loading: false }));
          toast.success('Alacak kaydı eklendi');
        } catch (err: any) {
          toast.error('Hata', { description: err.message });
          set({ loading: false });
        }
      },

      updateReceivable: async (id, updates) => {
        set({ loading: true });
        try {
          const updated = await financeService.updateReceivable(id, updates);
          set(state => ({
            receivables: state.receivables.map(r => r.id === id ? (updated ?? r) : r),
            loading: false
          }));
          toast.success('Alacak güncellendi');
        } catch (err: any) {
          toast.error('Hata', { description: err.message });
          set({ loading: false });
        }
      },

      deleteReceivable: async (id) => {
        set({ loading: true });
        try {
          await financeService.deleteReceivable(id);
          set(state => ({ receivables: state.receivables.filter(r => r.id !== id), loading: false }));
          toast.success('Alacak silindi');
        } catch (err: any) {
          toast.error('Hata', { description: err.message });
          set({ loading: false });
        }
      },

      collectReceivable: async (id, amount, assetId) => {
        set({ loading: true });
        try {
          await financeService.collectReceivable(id, amount, assetId);
          // Store’u yenile
          const receivables = await financeService.getReceivables();
          const assets = await financeService.getAssets();
          set({ receivables, assets, loading: false });
          toast.success(`₺${amount.toLocaleString('tr-TR')} tahsilat yapıldı`);
        } catch (err: any) {
          toast.error('Hata', { description: err.message });
          set({ loading: false });
        }
      }
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        categories: state.categories,
        assets: state.assets,
        liabilities: state.liabilities,
        rules: state.rules,
        schedules: state.schedules,
        tags: state.tags,
        goals: state.goals,
        receivables: state.receivables,
        offlineQueue: state.offlineQueue,
        lastFetchedAt: state.lastFetchedAt  // Faz 30.1: TTL damgası persist edilir
      })
    }
  )
)
