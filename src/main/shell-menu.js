'use strict';
// Isolated STA shell host, compiled with the same installed .NET compiler as
// the icon helper. Arguments travel over stdin JSON, never shell command text.
const { app } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFile, spawn } = require('node:child_process');
let compiled = null, active = false;
async function executable() {
  if (compiled) return compiled;
  compiled = (async () => {
    const source = await fs.readFile(path.join(__dirname, 'native', 'ShellMenu.cs'));
    const hash = createHash('sha256').update(source).digest('hex').slice(0, 16);
    const output = path.join(app.getPath('userData'), `ql-shell-menu-${hash}.exe`);
    try { await fs.access(output); return output; } catch { /* new source version */ }
    const root = process.env.WINDIR || 'C:\\Windows';
    let compiler = null;
    for (const dir of ['Framework64', 'Framework']) {
      const candidate = path.join(root, 'Microsoft.NET', dir, 'v4.0.30319', 'csc.exe');
      try { await fs.access(candidate); compiler = candidate; break; } catch { /* next */ }
    }
    if (!compiler) throw new Error('Windows shortcut menus are unavailable: the .NET compiler is missing.');
    const input = path.join(app.getPath('temp'), `QLShellMenu-${hash}.cs`);
    await fs.writeFile(input, source);
    try {
      await new Promise((resolve, reject) => execFile(compiler, ['/nologo', '/target:exe', '/optimize',
        '/reference:System.Windows.Forms.dll', '/reference:System.Drawing.dll', '/reference:System.Web.Extensions.dll', `/out:${output}`, input],
      { windowsHide: true, timeout: 30000 }, error => error ? reject(new Error('Windows shortcut menus could not be initialized.')) : resolve()));
    } finally { await fs.unlink(input).catch(() => {}); }
    return output;
  })();
  try { return await compiled; } catch (error) { compiled = null; throw error; }
}
async function invoke(request, ownerWindow) {
  if (active) return { ok: false, error: 'Close the open Windows shortcut menu first.' };
  active = true;
  const contents = ownerWindow && ownerWindow.webContents;
  let ownerInvalid = false;
  const invalidate = () => { ownerInvalid = true; };
  if (ownerWindow) ownerWindow.once('closed', invalidate);
  if (contents) { contents.once('did-start-loading', invalidate); contents.once('render-process-gone', invalidate); }
  try {
    const exe = await executable();
    if (ownerInvalid || (ownerWindow && ownerWindow.isDestroyed())) return { ok: false, error: 'The region was closed or reloaded.' };
    return await new Promise(resolve => {
      const child = spawn(exe, [], { windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
      const ownerContents = ownerWindow && ownerWindow.webContents;
      let output = '', result = null, interruption = null, timer = null, finished = false, phase = 'initial';
      const complete = value => {
        if (finished) return; finished = true; clearTimeout(timer);
        app.removeListener('before-quit', cancel);
        if (ownerWindow) ownerWindow.removeListener('closed', cancel);
        if (ownerContents) { ownerContents.removeListener('did-start-loading', cancel); ownerContents.removeListener('render-process-gone', cancel); }
        resolve(value);
      };
      const cancel = () => {
        if (finished || interruption) return;
        interruption = { ok: false, error: 'The Windows shortcut action was interrupted. Its recovery record was kept.' };
        clearTimeout(timer); timer = null;
        // Reconciliation must wait for the owned process to actually exit:
        // termination requests can race an in-flight filesystem command.
        child.kill();
      };
      const deadline = next => {
        if (next === phase && timer) return;
        phase = next; clearTimeout(timer); timer = null;
        // User menu/dialog interaction has no deadline. Only initialization
        // and noninteractive extension work can time out; kill this helper
        // alone, never any application launched by its selected command.
        if (next !== 'menu' && next !== 'interactive') timer = setTimeout(cancel, next === 'invoke' ? 120000 : 30000);
      };
      app.once('before-quit', cancel); if (ownerWindow) ownerWindow.once('closed', cancel);
      if (ownerContents) { ownerContents.once('did-start-loading', cancel); ownerContents.once('render-process-gone', cancel); }
      deadline('initial');
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', chunk => {
        if (finished || interruption) return;
        output += chunk; if (output.length > 65536) { cancel(); return; }
        let newline;
        while ((newline = output.indexOf('\n')) >= 0) {
          const line = output.slice(0, newline); output = output.slice(newline + 1);
          try { const message = JSON.parse(line); if (message.phase) deadline(message.phase); else result = message; } catch { /* fail at process completion */ }
        }
      });
      child.stderr.resume();
      child.stdin.on('error', () => {});
      child.on('error', () => { if (!child.pid) complete({ ok: false, error: 'Windows could not open the shortcut menu.' }); });
      child.on('close', () => {
        complete(interruption || result || { ok: false, error: 'Windows could not complete the shortcut action. Refresh and try again.' });
      });
      child.stdin.end(JSON.stringify(request));
    });
  } catch (error) { return { ok: false, error: error.message }; }
  finally {
    if (ownerWindow) ownerWindow.removeListener('closed', invalidate);
    if (contents) { contents.removeListener('did-start-loading', invalidate); contents.removeListener('render-process-gone', invalidate); }
    active = false;
  }
}
module.exports = { invoke, prepare: executable };
