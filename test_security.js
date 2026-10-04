const assert=require('node:assert/strict'),fs=require('node:fs'),Security=require('./security.js');
const cases=JSON.parse(fs.readFileSync('guard_cases.json','utf8'));
for(const c of cases)for(const modelChoice of ['release','question','alert']){const data={ticket:'N-123',supervisor:'IVES',badge:false,severity:1,attempt:0,strikes:0,...c.data};assert.equal(Security.policy(data,modelChoice),c.expected,c.name)}
console.log(`PASS: ${cases.length} guard-story cases, including reasonable passes, follow-ups, contradictions and restricted-room failures.`);
