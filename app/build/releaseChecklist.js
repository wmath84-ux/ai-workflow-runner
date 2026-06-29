export const releaseChecklist = [
  'App starts without crash','Database initializes','Migrations run safely','Settings load with defaults','Onboarding opens on first run','Browser launches','ChatGPT tab opens','Gemini tab opens','Mock workflow runs','Sequential workflow runs','Parallel mock workflow runs','Workflow validation catches bad variables','Run history opens','Result viewer opens','Markdown export works','JSON export works','Backup creation works','Health check works','Diagnostics export works','Command palette opens','Keyboard shortcuts do not trigger while typing','Production build completes'
];
export function getReleaseChecklist(){return releaseChecklist;}
