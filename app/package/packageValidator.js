import { safeJsonParse } from '../shared/safeJson.js';
export function validatePackageManifest(manifest){const errors=[]; if(!manifest?.packageId) errors.push('Missing package ID.'); if(manifest?.type!=='workflow-package') errors.push('Invalid package type.'); return {valid:errors.length===0,errors};}
export function parsePackageFile(text){const pkg=safeJsonParse(text,null); const validation=validatePackageManifest(pkg?.manifest); return {pkg,validation};}
