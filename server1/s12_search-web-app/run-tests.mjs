    process.env.Debug   =  0  
if (process.env.Debug   == 1 || process.env.VSCODE_INSPECTOR_OPTIONS ? 1 : 0) {    
//  process.env.LOGGER  = 'log'
    process.env.DEBUG   = "1"                             // .(50612.04.4)
    process.env.APP     = "s12"
    }
await import( '../components/search_u2.11.mjs' )          // .(50522.02b.9).(50514.07.8).(50507.05.1 RAM Put script into components)
debugger 