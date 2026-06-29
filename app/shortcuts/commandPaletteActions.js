export const commandPaletteActions = [
  { id:'run', label:'Run workflow', description:'Open the Run Panel', keywords:['run','workflow'], page:'run' },
  { id:'library', label:'Open Workflow Library', description:'Manage saved workflows', keywords:['workflow','library'], page:'library' },
  { id:'templates', label:'Open Workflow Templates', description:'Create from templates', keywords:['templates'], page:'templates' },
  { id:'prompts', label:'Open Prompt Library', description:'Manage prompts', keywords:['prompts'], page:'prompts' },
  { id:'browser', label:'Open Browser Panel', description:'Prepare manual login', keywords:['browser'], page:'browser' },
  { id:'readiness', label:'Check connector readiness', description:'Open App Status', keywords:['readiness','connectors'], page:'status' },
  { id:'history', label:'View Run History', description:'Open run history', keywords:['history'], page:'history' },
  { id:'results', label:'View Results', description:'Open results', keywords:['results'], page:'results' },
  { id:'backup', label:'Create backup', description:'Open Backup & Restore', keywords:['backup'], page:'backup' },
  { id:'diagnostics', label:'Export diagnostics', description:'Open Diagnostics', keywords:['diagnostics'], page:'diagnostics' },
  { id:'settings', label:'Open Settings', description:'Configure app', keywords:['settings'], page:'settings' },
  { id:'help', label:'Open Help', description:'Open help and troubleshooting', keywords:['help'], page:'help' }
];
export function listCommandPaletteActions(){return commandPaletteActions;}
