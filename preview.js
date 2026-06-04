



(function () {
  function FunctionData(signature, name, params, code) {
    this.signature = signature;
    this.name = name;
    this.params = params;
    this.code = code;
  }

  let functions = new Map();

  function injectRunnerStyles() {
    if (document.head.querySelector('#snippet-runner-styles')) return;
    const style = document.createElement('style');
    style.id = 'snippet-runner-styles';
    style.textContent = `
      .snippet-runner {
        margin: 18px 0 30px;
        padding: 18px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }
      .snippet-runner .snippet-controls {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        margin-bottom: 14px;
      }
      .snippet-runner .snippet-label {
        margin: 0;
        font-family: var(--sans, system-ui, sans-serif);
        color: var(--ink, #111);
        font-size: 0.98rem;
        font-weight: 700;
      }
      .snippet-runner .snippet-button {
        appearance: none;
        border: none;
        background: var(--accent, #ed225d);
        color: white;
        font-family: var(--sans, system-ui, sans-serif);
        font-size: 0.93rem;
        font-weight: 700;
        padding: 0.85rem 1.15rem;
        border-radius: 999px;
        cursor: pointer;
        transition: background 0.18s ease, transform 0.18s ease;
      }
      .snippet-runner .snippet-button:hover {
        background: var(--accent-dark, #b8174a);
        transform: translateY(-1px);
      }
      .snippet-output {
        display: none;
        width: 400px;
        max-width: 100%;
        height: 400px;
        border-radius: 16px;
        overflow: hidden;
        background: #111;
      }
      .snippet-output.active {
        display: block;
      }
      .snippet-output iframe {
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
      }
      @media (max-width: 600px) {
        .snippet-runner .snippet-controls {
          flex-direction: column;
          align-items: stretch;
        }
        .snippet-runner .snippet-button {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function shouldAttachRunner(code) {
    const pausedToggleSnippet = /let\s+isPaused\s*=\s*false\s*;/.test(code) &&
      /\bfunction\s+mousePressed\s*\(/.test(code) &&
      /\bif\s*\(\s*isPaused\s*\)/.test(code);
    if (pausedToggleSnippet) return false;

    const ignoreTopLeftBoxSnippet = /inside a\s+100x100\s+box/i.test(code) &&
      /out of bounds!/i.test(code);
    if (ignoreTopLeftBoxSnippet) return false;

    const triggers = [
      'createCanvas',
      'function setup',
      'function draw(',
      'mouseX',
      'mouseY',
      'ellipse(',
      'rect(',
      'background(',
      'fill(',
      'stroke(',
      'noStroke(',
      'noFill(',
      'line(',
      'triangle(',
      'width',
      'height',
    ];
    const hasInteractiveTrigger = triggers.some((trigger) => code.includes(trigger));
    const hasDefinition = /(^|\n)\s*(function\s+\w+|const\s+\w+|let\s+\w+|var\s+\w+)\b/.test(code);
    return hasInteractiveTrigger || hasDefinition;
  }

  function isDefinitionOnlySnippet(code) {
    const withoutComments = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    let depth = 0;
    let index = 0;
    const normalized = withoutComments.replace(/\r\n/g, '\n');

    while (index < normalized.length) {
      const remaining = normalized.slice(index);
      const match = remaining.match(/^\s*/);
      index += match[0].length;
      if (index >= normalized.length) break;

      if (depth === 0) {
        if (/^function\s+\w+\s*\(/.test(normalized.slice(index))) {
          const braceIndex = normalized.indexOf('{', index);
          if (braceIndex === -1) return false;
          depth += 1;
          index = braceIndex + 1;
          continue;
        }
        if (/^(?:const|let|var)\s+\w+/.test(normalized.slice(index))) {
          const semicolonIndex = normalized.indexOf(';', index);
          if (semicolonIndex === -1) {
            const nextLine = normalized.indexOf('\n', index);
            index = nextLine === -1 ? normalized.length : nextLine + 1;
          } else {
            index = semicolonIndex + 1;
          }
          continue;
        }
        if (normalized[index] === '}') {
          index += 1;
          continue;
        }
        return false;
      }

      const char = normalized[index];
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
      }
      index += 1;
    }

    return true;
  }

  function extractFunctionDeclarations(code) {
    const results = [];
    const re = /function\s+([A-Za-z_$][\w$]*)\s*\(.*\)/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      console.log(m);
      const signature = m[0];
      const name = m[1];
      console.log("CODE EXTRACTION: " + code);

      if (name !== "setup" && name !== "draw" && name !== "mousePressed") {
        let functionData = new FunctionData(signature, name, "", code);

        functions.set(signature, functionData);
        console.log("FUNCTION NAME: " + name);
        console.log("Functions size: " + functions.size);
      }

      const start = m.index;
      const braceIndex = code.indexOf('{', re.lastIndex - 1);
      if (braceIndex === -1) continue;
      let pos = braceIndex + 1;
      let depth = 1;
      while (pos < code.length && depth > 0) {
        const ch = code[pos];
        if (ch === '{') depth += 1;
        else if (ch === '}') depth -= 1;
        pos += 1;
      }
      const decl = code.slice(start, pos);
      results.push({ name, decl });
      re.lastIndex = pos;
    }
    return results;
  }

  let mouseListenerAttached = false;

  function attachSnippetRunners() {
    injectRunnerStyles();
    ensureMouseListener();
    const codeBlocks = Array.from(document.querySelectorAll('main pre code'));
    let persistedDefinitions = '';
    codeBlocks.forEach((codeEl) => {
      const codeText = codeEl.textContent.trim();
      if (!codeText) return;
      if (!shouldAttachRunner(codeText)) return;

      // extract top-level function declarations and persist those that are not called here
      const decls = extractFunctionDeclarations(codeText);


      let hasFunctionOtherThanSetupDraw = false;

      const uncalledDecls = [];
      decls.forEach((d) => {
        console.log("name: " + d.name);

        if (d.name === 'setup' || d.name === 'draw') return;
        hasFunctionOtherThanSetupDraw = true;
        const callRe = new RegExp('\\b' + d.name + '\\s*\\(');
        const isCalled = callRe.test(codeText);
        if (!isCalled) uncalledDecls.push(d.decl);
      });


      let hasSetupOrDraw;

      if (hasFunctionOtherThanSetupDraw) {
        decls.forEach((d) => {
          console.log("namen: " + d.name);

          if (d.name === 'setup' || d.name === 'draw') {
            hasSetupOrDraw = true;
          }
        })
      }

      if (hasFunctionOtherThanSetupDraw && !hasSetupOrDraw) {
        return;
      }

      // build runner code with definitions that appeared earlier on the page
      const runnerCode = (persistedDefinitions ? persistedDefinitions + '\n\n' : '') + codeText;

      // now persist any new uncalled declarations for later snippets
      if (uncalledDecls.length) {
        persistedDefinitions += (persistedDefinitions ? '\n\n' : '') + uncalledDecls.join('\n\n');
      }

      const runner = document.createElement('div');
      runner.className = 'snippet-runner';

      const controls = document.createElement('div');
      controls.className = 'snippet-controls';
      const label = document.createElement('p');
      label.className = 'snippet-label';
      label.textContent = 'Run this code example';

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'snippet-button';
      button.textContent = 'Run snippet';

      const stopButton = document.createElement('button');
      stopButton.type = 'button';
      stopButton.className = 'snippet-button';
      stopButton.textContent = 'Stop';
      stopButton.disabled = true;
      stopButton.style.background = '#6b7280';
      stopButton.style.opacity = '0.5';

      const output = document.createElement('div');
      output.className = 'snippet-output';

      controls.appendChild(label);
      controls.appendChild(button);
      controls.appendChild(stopButton);
      runner.appendChild(controls);
      runner.appendChild(output);
      codeEl.parentElement.insertAdjacentElement('afterend', runner);

      button.addEventListener('click', function () {
        runCodeSnippet(runnerCode, output, button, stopButton);
      });
      stopButton.addEventListener('click', function () {
        stopSnippet(output, button, stopButton);
      });
    });
  }

  function ensureMouseListener() {
    if (mouseListenerAttached) return;
    mouseListenerAttached = true;
    window.addEventListener('mousemove', function (event) {
      const iframes = Array.from(document.querySelectorAll('.snippet-output.active iframe'));
      iframes.forEach((iframe) => {
        if (!iframe.contentWindow) return;
        const rect = iframe.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        iframe.contentWindow.postMessage({ type: 'mouse', x: mouseX, y: mouseY }, '*');
      });
    });
  }

  function runCodeSnippet(codeText, output, button, stopButton) {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('sandbox', 'allow-scripts');
    iframe.srcdoc = generateIframeSrcdoc(codeText);

    output.innerHTML = '';
    output.appendChild(iframe);
    output.classList.add('active');
    button.textContent = 'Running…';
    stopButton.disabled = false;
    stopButton.style.opacity = '1';

    iframe.addEventListener('load', function () {
      button.textContent = 'Run snippet';
    });
  }

  function stopSnippet(output, button, stopButton) {
    const iframe = output.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'pause' }, '*');
    }
    button.textContent = 'Run snippet';
    stopButton.disabled = true;
    stopButton.style.opacity = '0.5';
  }

  function generateIframeSrcdoc(codeText) {
    const snippetSource = JSON.stringify(codeText);
    const hasSetup = /\bfunction\s+setup\s*\(/.test(codeText);
    const hasDraw = /\bfunction\s+draw\s*\(/.test(codeText);
    const hasCreateCanvas = /\bcreateCanvas\s*\(/.test(codeText);
    const hasInteractive = /\b(mouseX|mouseY|pmouseX|pmouseY|frameCount|keyIsDown|mouseIsPressed|touches)\b/.test(codeText);
    const strippedCreateCanvas = codeText.replace(/\bcreateCanvas\s*\([^)]*\)\s*;?/g, '');

    console.log(`GEN FUNCTION SIZE: ${functions.size}`)

    functions.forEach((functionData) => {
      console.log(`Function Data: ${functionData.name} ${functionData.signature}`);

    });

    let bootCode;
    if (hasSetup) {
      bootCode = `const code = ${snippetSource}; eval(code);`;
    } else if (hasDraw) {
      if (hasCreateCanvas) {
        bootCode = `const code = ${snippetSource}; eval(code);`;
      } else {
        bootCode = `function setup() { createCanvas(400, 400); } const code = ${snippetSource}; eval(code);`;
      }
    } else if (hasInteractive) {
      bootCode = `function setup() { createCanvas(400, 400); } function draw() { ${strippedCreateCanvas || codeText} }`;
    } else if (hasCreateCanvas) {
      bootCode = `function setup() { ${codeText} }`;
    } else {
      bootCode = `function setup() { createCanvas(400, 400); background(255); ${codeText}; noLoop(); }`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html, body { margin: 0; padding: 0; background: #121214; color: #f8f8f2; }
    body { min-height: 100vh; overflow: hidden; }
    canvas { display: block; width: 100%; height: 100%; }
    pre.error { margin: 0; padding: 1rem; white-space: pre-wrap; word-break: break-word; color: #ffeef0; background: #1b1f24; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
  </style>
</head>
<body>
  <script>
    // inject the raw snippet source early so recovery logic can re-evaluate it if needed
    window.__runner_code = ${snippetSource};
    window.__runner_tries = 0;
  </script>
  <script src="p5.js"></script>
  <script src="p5.sound.min.js"></script>
  <script>
    window.onerror = function(message, source, lineno, colno, error) {
      // If setup threw because a function was undefined (race), try to recover once by
      // evaluating the snippet code and re-calling setup.
      try {
        if (/ReferenceError/.test(message) && /is not defined/.test(message) && window.__runner_code && window.__runner_tries < 1) {
          window.__runner_tries += 1;
          try { eval(window.__runner_code); } catch (e) { /* fall through to display error below */ }
          if (typeof window.setup === 'function') {
            try { window.setup(); } catch (e) { /* ignore secondary errors */ }
            return true;
          }
        }
      } catch (e) {
        // ignore handler errors
      }

      document.body.innerHTML = '<pre class="error">' + message + ' at line ' + lineno + '</pre>';
      return true;
    };
    window.addEventListener('message', function(event) {
      if (!event.data) return;
      if (event.data.type === 'pause' && typeof noLoop === 'function') {
        noLoop();
        return;
      }
      if (event.data.type === 'mouse') {
        if (typeof window.mouseX !== 'undefined') {
          window.pmouseX = window.mouseX;
          window.pmouseY = window.mouseY;
        } else {
          window.pmouseX = event.data.x;
          window.pmouseY = event.data.y;
        }
        window.mouseX = event.data.x;
        window.mouseY = event.data.y;
      }
    });
  </script>
  <script>
    try {
      ${bootCode}
    } catch (error) {
      document.body.innerHTML = '<pre class="error">' + error.toString() + '</pre>';
    }
  </script>
</body>
</html>`;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const chapter = parseInt(document.body.dataset.chapter, 10);
    if (!chapter || chapter < 2) return;
    attachSnippetRunners();
  });
})();
