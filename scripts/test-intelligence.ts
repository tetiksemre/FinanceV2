import { RuleEngine } from '../src/services/RuleEngine';
import { subscriptionService } from '../src/services/SubscriptionService';

async function testIntelligence() {
    console.log('--- PHASE 16 INTELLIGENCE TEST ---');

    // 1. Test Smart Categorization
    const engine = new RuleEngine();
    engine.setCategories([
        { id: 'cat-market', name: 'Market', type: 'expense', metadata: {} },
        { id: 'cat-yemek', name: 'Yemek', type: 'expense', metadata: {} }
    ]);

    const test1 = engine.categorize('MIGROS TURK ISTANBUL');
    console.log('Test 1 (MIGROS):', test1.category_id === 'cat-market' ? 'PASS' : 'FAIL', test1);

    const test2 = engine.categorize('GETIR*YEMEK');
    console.log('Test 2 (GETIR):', test2.category_id === 'cat-yemek' ? 'PASS' : 'FAIL', test2);

    // 2. Test Subscription Radar
    const transactions: any[] = [
        { id: '1', amount: -150, description: 'NETFLIX.COM', transaction_date: '2026-01-10T10:00:00Z', metadata: {} },
        { id: '2', amount: -150, description: 'NETFLIX.COM', transaction_date: '2026-02-11T10:00:00Z', metadata: {} },
        { id: '3', amount: -150, description: 'NETFLIX.COM', transaction_date: '2026-03-12T10:00:00Z', metadata: {} },
        { id: '4', amount: -200, description: 'MIGROS', transaction_date: '2026-01-15T10:00:00Z', metadata: {} },
    ];

    const subs = subscriptionService.detectSubscriptions(transactions);
    console.log('Detected Subscriptions:', subs.length);
    if (subs.length > 0) {
        console.log('Sample Sub:', subs[0]);
        const isNetflix = subs[0].description.includes('NETFLIX');
        console.log('Netflix Detected:', isNetflix ? 'PASS' : 'FAIL');
    } else {
        console.log('Radar Failure: No subscriptions detected');
    }
}

testIntelligence().catch(console.error);
