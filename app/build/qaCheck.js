import fs from 'node:fs';
const requiredFiles=['package.json','vite.config.js','app/main.js','app/preload.js','app/dashboard/App.jsx'];
const requiredFolders=['outputs','exports','backups','diagnostics','workflows','browser-profile','logs'];
const failures=[];
for(const file of requiredFiles) if(!fs.existsSync(file)) failures.push(`Missing ${file}`);
for(const folder of requiredFolders) if(!fs.existsSync(folder)) failures.push(`Missing ${folder}`);
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const script of ['dev','build','start','electron:dev','electron:build','pack','dist','lint','test:smoke','qa:check']) if(!pkg.scripts?.[script]) failures.push(`Missing script ${script}`);
for(const file of fs.readdirSync('workflows').filter(f=>f.endsWith('.json'))) { try{JSON.parse(fs.readFileSync(`workflows/${file}`,'utf8'));}catch(e){failures.push(`Invalid workflow JSON ${file}: ${e.message}`);} }
if(failures.length){console.error(failures.join('\n')); process.exit(1);} console.log('QA check passed.');
