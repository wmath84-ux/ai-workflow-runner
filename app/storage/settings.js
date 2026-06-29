import { getDatabase } from './db.js';
import { safeJsonParse } from '../shared/safeJson.js';
export function getSetting(key){const row=getDatabase().prepare('SELECT value_json FROM settings WHERE key=?').get(key); return row?safeJsonParse(row.value_json,null):null;}
export function setSetting(key,value){getDatabase().prepare('INSERT INTO settings (key,value_json) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json,updated_at=CURRENT_TIMESTAMP').run(key,JSON.stringify(value)); return getSetting(key);}
export function deleteSetting(key){return getDatabase().prepare('DELETE FROM settings WHERE key=?').run(key).changes>0;}
