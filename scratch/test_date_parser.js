
const parseDate = (input) => {
    if (!input) return new Date().toISOString();
    let d;
    
    if (input instanceof Date) {
      d = input;
    } else {
      const str = String(input);
      if (str.includes('/')) {
        const [day, month, year] = str.split('/').map(Number);
        d = new Date(year, month - 1, day);
      } else if (str.includes('.')) {
        const [day, month, year] = str.split('.').map(Number);
        d = new Date(year, month - 1, day);
      } else {
        d = new Date(str);
      }
    }

    if (isNaN(d.getTime())) return new Date().toISOString();
    
    // Safety check for years (1920-2100)
    const year = d.getFullYear();
    if (year < 1920 || year > 2100) {
       console.warn(`[Parser] Limit disi tarih tespit edildi (${year}), bugun kullaniliyor.`);
       return new Date().toISOString();
    }
    
    return d.toISOString();
};

console.log("Test 1: Excel Serial Number (46109) as String");
console.log("Result:", parseDate("46109")); 

console.log("\nTest 2: Valid Date String (08/04/2026)");
console.log("Result:", parseDate("08/04/2026"));

console.log("\nTest 3: Native Date Object");
console.log("Result:", parseDate(new Date(2026, 3, 8)));

console.log("\nTest 4: Empty input");
console.log("Result:", parseDate(""));
