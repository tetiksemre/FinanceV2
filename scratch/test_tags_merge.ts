import { financeService } from '../src/services/financeService';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testTagsMerge() {
    console.log('--- TAGS MERGE TEST ---');
    
    try {
        // 1. Create two tags
        const tag1 = await financeService.createTag({ name: 'TestTag1', color: 'bg-red-100', metadata: {} });
        const tag2 = await financeService.createTag({ name: 'TestTag2', color: 'bg-blue-100', metadata: {} });
        console.log('Tags created:', tag1.name, tag2.name);

        // 2. Create a transaction
        const tx = await financeService.createTransaction({
            amount: 100,
            description: 'Merge Test Transaction',
            transaction_date: new Date().toISOString(),
            metadata: {}
        });
        console.log('Transaction created:', tx.id);

        // 3. Link tx to Tag 1
        await financeService.linkTransactionsToTags([tx.id], [tag1.id]);
        console.log('Linked tx to', tag1.name);

        // 4. Delete Tag 1 and merge to Tag 2
        console.log('Merging Tag 1 into Tag 2...');
        await financeService.deleteTag(tag1.id, tag2.id);

        // 5. Verify association
        // We can check metadata as a proxy for the junction table test since our service syncs them
        const { data: updatedTx } = await (await import('../src/lib/supabase')).createClient()
            .from('transactions')
            .select('metadata')
            .eq('id', tx.id)
            .single();

        console.log('Updated Metadata:', updatedTx?.metadata);
        
        const hasNewTag = updatedTx?.metadata?.tags?.includes(tag2.name);
        if (hasNewTag) {
            console.log('SUCCESS: Tag merged successfully!');
        } else {
            console.error('FAILED: Tag merge not reflected in metadata.');
        }

        // Cleanup
        await financeService.deleteTag(tag2.id);
        await financeService.bulkDeleteTransactions([tx.id]);
        console.log('Cleanup done.');

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testTagsMerge().catch(console.error);
