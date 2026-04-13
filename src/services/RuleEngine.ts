import { Category, Rule, Transaction } from './financeService';

interface SmartRule {
  keywords: string[];
  categoryName: string; // Used to find the matching category ID from user's categories
  tags: string[];
}

const GLOBAL_SMART_RULES: SmartRule[] = [
  { keywords: ['MIGROS', 'CARREFOUR', 'A101', 'BIM', 'SOK', 'FİLE'], categoryName: 'Market', tags: ['Gıda', 'Mutfak'] },
  { keywords: ['GETIR', 'YEMEKSEPETI', 'TRENDYOL GO', 'MIGROS YEMEK'], categoryName: 'Yemek', tags: ['Dışarıda Yemek'] },
  { keywords: ['STARBUCKS', 'KAHVE DUNYASI', 'ESPRESSOLAB'], categoryName: 'Cafe', tags: ['Keyif'] },
  { keywords: ['SHELL', 'OPET', 'BP', 'TOTAL'], categoryName: 'Ulaşım', tags: ['Akaryakıt'] },
  { keywords: ['NETFLIX', 'SPOTIFY', 'APPLE.COM/BILL', 'APPLE/BILL', 'GOOGLE *', 'YOUTUBE PREMIUM'], categoryName: 'Abonelik', tags: ['Eğlence', 'Dijital'] },
  { keywords: ['AMAZON', 'HEPSIBURADA', 'TRENDYOL'], categoryName: 'Alışveriş', tags: ['E-Ticaret'] },
  { keywords: ['ISTANBULKART', 'BITAKSI', 'UBER'], categoryName: 'Ulaşım', tags: ['Toplu Taşıma'] },
  { keywords: ['MAAS', 'SALARY'], categoryName: 'Maaş', tags: ['Gelir'] },
  { keywords: ['ENERJISA', 'AYESAS', 'ISKI', 'IGDAS', 'TURKCELL', 'VODAFONE', 'TURK TELEKOM'], categoryName: 'Fatura', tags: ['Sabit Gider'] },
];

export class RuleEngine {
  private rules: Rule[] = [];
  private userCategories: Category[] = [];

  public setRules(rules: Rule[]) {
    this.rules = rules;
  }

  public setCategories(categories: Category[]) {
    this.userCategories = categories;
  }

  public categorize(description: string): { category_id: string | undefined; tags: string[]; is_ignore: boolean } {
    if (!description) return { category_id: undefined, tags: [], is_ignore: false };
    const desc = description.toUpperCase().trim();
    
    // 1. Check User-Defined Rules (Highest Priority)
    // We sort rules by keyword length (descending) to match the most specific rule first
    const sortedRules = [...this.rules].sort((a, b) => b.keyword.length - a.keyword.length);
    
    for (const rule of sortedRules) {
      const keyword = rule.keyword.toUpperCase().trim();
      if (keyword && desc.includes(keyword)) {
        return {
          category_id: rule.category_id,
          tags: rule.tags || rule.metadata?.tags || [],
          is_ignore: !!rule.metadata?.is_ignore
        };
      }
    }

    // 2. Check Global Smart Rules (Fuzzy/Keyword based)
    for (const smartRule of GLOBAL_SMART_RULES) {
      const match = smartRule.keywords.find(k => desc.includes(k.toUpperCase()));
      if (match) {
        // Try to find the category ID in the user's categories by name
        const category = this.userCategories.find(c => 
          c.name.toLowerCase().trim() === smartRule.categoryName.toLowerCase().trim()
        );
        
        if (category) {
          return {
            category_id: category.id,
            tags: smartRule.tags,
            is_ignore: false
          };
        }
      }
    }

    return {
      category_id: undefined,
      tags: [],
      is_ignore: false
    };
  }

  /**
   * Suggests a category based on historical transaction descriptions.
   * Useful for transactions that don't match any rules but have been
   * categorized manually in the past.
   */
  public suggestCategoryFromHistory(description: string, history: Transaction[]): string | undefined {
    if (!description || history.length === 0) return undefined;
    const desc = description.toUpperCase();

    // Look for exact or very similar matches in history
    const matches = history.filter(tx => 
      tx.category_id && 
      tx.description && 
      (tx.description.toUpperCase() === desc || desc.includes(tx.description.toUpperCase()))
    );

    if (matches.length === 0) return undefined;

    // Count occurrences of each category_id in matches
    const counts: Record<string, number> = {};
    matches.forEach(m => {
      const cid = m.category_id as string;
      counts[cid] = (counts[cid] || 0) + 1;
    });

    // Return the most frequent category_id
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }
}

export const ruleEngine = new RuleEngine();
