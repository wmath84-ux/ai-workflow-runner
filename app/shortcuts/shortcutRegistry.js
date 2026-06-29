export const shortcutRegistry = [
  { id:'command_palette', label:'Open command palette', windows:'Ctrl+K', mac:'Cmd+K' },
  { id:'new_workflow', label:'New workflow', windows:'Ctrl+N', mac:'Cmd+N' },
  { id:'run_workflow', label:'Run current workflow after preflight', windows:'Ctrl+R', mac:'Cmd+R' },
  { id:'launch_browser', label:'Launch browser', windows:'Ctrl+Shift+B', mac:'Cmd+Shift+B' },
  { id:'open_chatgpt', label:'Open ChatGPT', windows:'Ctrl+Shift+C', mac:'Cmd+Shift+C' },
  { id:'open_gemini', label:'Open Gemini', windows:'Ctrl+Shift+G', mac:'Cmd+Shift+G' },
  { id:'open_help', label:'Open Help', windows:'Ctrl+Shift+H', mac:'Cmd+Shift+H' },
  { id:'open_settings', label:'Open Settings', windows:'Ctrl+,', mac:'Cmd+,' },
  { id:'show_shortcuts', label:'Show keyboard shortcuts', windows:'Ctrl+?', mac:'Cmd+?' },
  { id:'close_modal', label:'Close modal or palette', windows:'Esc', mac:'Esc' }
];
export function listShortcuts(){return shortcutRegistry;}
