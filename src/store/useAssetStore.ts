import { create } from 'zustand'
import { assetService, Asset } from '@/services/assetService'

interface AssetState {
  assets: Asset[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchAssets: () => Promise<void>
  addAsset: (asset: Omit<Asset, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<void>
  
  // Computed
  getTotalAssetValue: () => number
}

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  loading: false,
  error: null,

  fetchAssets: async () => {
    set({ loading: true, error: null })
    try {
      const assets = await assetService.getAssets()
      set({ assets, loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  addAsset: async (assetData) => {
    set({ loading: true, error: null })
    try {
      const newAsset = await assetService.createAsset(assetData)
      set((state) => ({
        assets: [...state.assets, newAsset],
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  getTotalAssetValue: () => {
    return get().assets.reduce((sum, asset) => {
      return sum + (Number(asset.balance) || 0)
    }, 0)
  }
}))
