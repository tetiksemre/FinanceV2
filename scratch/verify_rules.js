
const desc = "APPLE/BILL";
const keyword = "Apple";

console.log("Original match:", desc.includes(keyword));
console.log("Fixed match:", desc.includes(keyword.toUpperCase()));

const globalKeywords = ['APPLE.COM/BILL'];
console.log("Global match (existing):", globalKeywords.find(k => desc.includes(k)));

const improvedKeywords = ['APPLE.COM/BILL', 'APPLE'];
console.log("Global match (improved):", improvedKeywords.find(k => desc.includes(k)));
