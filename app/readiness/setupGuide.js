export const onboardingSteps = [
  { id:'welcome', title:'Welcome', description:'Set up your local AI workflow runner.' },
  { id:'folders', title:'Choose folders', description:'Review output and backup folder locations.' },
  { id:'browser', title:'Launch persistent browser', description:'Open the visible Chromium browser with persistent profile.' },
  { id:'chatgpt_login', title:'Login to ChatGPT manually', description:'Open ChatGPT and complete login yourself.' },
  { id:'gemini_login', title:'Login to Gemini manually', description:'Open Gemini and complete login yourself.' },
  { id:'readiness', title:'Check connector readiness', description:'Verify mock, ChatGPT, Gemini, and generic readiness.' },
  { id:'workflow', title:'Choose a workflow', description:'Pick a sample or template workflow.' },
  { id:'mock_run', title:'Run first mock workflow', description:'Confirm local execution works.' },
  { id:'browser_run', title:'Run first browser workflow', description:'Run browser workflow only after manual login.' },
  { id:'finish', title:'Finish setup', description:'You can restart onboarding anytime from Help or Settings.' }
];
export function getSetupChecklistItems(){return [
  {id:'database',label:'Database initialized',required:true},{id:'folders',label:'Required folders created',required:true},{id:'settings',label:'Settings valid',required:true},{id:'browser_profile',label:'Browser profile folder ready',required:true},{id:'playwright',label:'Playwright Chromium available',required:true},{id:'workflow_available',label:'At least one workflow available',required:true},{id:'chatgpt_login',label:'ChatGPT login checked',required:false},{id:'gemini_login',label:'Gemini login checked',required:false},{id:'backup_folder',label:'Backup folder configured',required:false},{id:'prompts',label:'Default prompts seeded',required:false},{id:'templates',label:'Default templates seeded',required:false}
];}
