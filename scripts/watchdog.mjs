import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WATCH_DIR = path.join(__dirname, '../local_imports');

if (!fs.existsSync(WATCH_DIR)) {
  fs.mkdirSync(WATCH_DIR, { recursive: true });
}

console.log(`[Watchdog] Monitoring started for: ${WATCH_DIR}`);

fs.watch(WATCH_DIR, (eventType, filename) => {
  if (filename && eventType === 'rename') {
    const filePath = path.join(WATCH_DIR, filename);
    
    // Check if file still exists (not a deletion)
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        console.log(`[Watchdog] New file detected: ${filename}`);
        
        // Bu noktada normalde bir API veya CLI komutu tetiklenebilir
        // Örn: npx next start --import [filePath]
        // Şimdilik sadece logluyoruz.
      }
    }
  }
});
