// Terminal typewriter animation for the homepage hero.
// Types out commands character by character, then reveals outputs.
// Pink cursor ties to the "Hanazono" sakura signature.

(function () {
  const hero = document.getElementById('terminal-hero');
  if (!hero) return;

  // Respect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const lines = hero.querySelectorAll('.terminal-line');
  if (!lines.length) return;

  // Build a list of "blocks" — each block is a command line + its output lines
  const blocks = [];
  let currentBlock = null;

  lines.forEach((line) => {
    const hasCommand = line.querySelector('.command');
    const isOutput = line.querySelector('.output-prompt');

    if (hasCommand) {
      currentBlock = { command: line, outputs: [] };
      blocks.push(currentBlock);
    } else if (isOutput && currentBlock) {
      currentBlock.outputs.push(line);
    }
  });

  // --- Lock height so content below doesn't jump ---
  // Measure full rendered height before hiding anything, add buffer for cursor
  const heroHeight = hero.offsetHeight;
  hero.style.height = (heroHeight + 24) + 'px';

  const cursor = hero.querySelector('.terminal-cursor');
  if (cursor) cursor.style.display = 'none';

  const spacers = hero.querySelectorAll('.terminal-spacer');
  spacers.forEach((s) => (s.style.display = 'none'));

  lines.forEach((l) => {
    l.classList.add('typing-hidden');
  });

  // Collect text to type
  const blockData = blocks.map((b) => {
    const cmdEl = b.command.querySelector('.command');
    const cmdText = cmdEl ? cmdEl.textContent || '' : '';
    return {
      commandEl: cmdEl,
      cmdText,
      commandLine: b.command,
      outputLines: b.outputs,
    };
  });

  function findSpacerAfter(lastOutput) {
    const el = lastOutput.nextElementSibling;
    return el && el.classList.contains('terminal-spacer') ? el : null;
  }

  let blockIndex = 0;

  function typeBlock() {
    if (blockIndex >= blockData.length) {
      if (cursor) cursor.style.display = 'inline-block';
      return;
    }

    const data = blockData[blockIndex];
    if (!data.commandEl) {
      blockIndex++;
      setTimeout(typeBlock, 120);
      return;
    }

    data.commandLine.classList.remove('typing-hidden');
    data.commandLine.classList.add('typing-visible');

    // Read live text in case renderProfile updated it after blockData was built
    const liveText = data.commandEl.textContent || '';
    data.commandEl.textContent = '';
    let charIdx = 0;
    const typingSpeed = 22; // ms per character

    const typeCursor = document.createElement('span');
    typeCursor.className = 'typing-cursor';
    typeCursor.setAttribute('aria-hidden', 'true');
    data.commandEl.after(typeCursor);

    function typeChar() {
      if (charIdx < liveText.length) {
        data.commandEl.textContent += liveText[charIdx];
        charIdx++;
        setTimeout(typeChar, typingSpeed);
      } else {
        typeCursor.remove();

        const outputs = data.outputLines;
        let outputDelay = 0;

        outputs.forEach((out) => {
          setTimeout(() => {
            out.classList.remove('typing-hidden');
            out.classList.add('typing-visible');
          }, outputDelay);
          outputDelay += 120 + Math.random() * 80;
        });

        if (outputs.length) {
          const last = outputs[outputs.length - 1];
          const spacer = findSpacerAfter(last);
          if (spacer) {
            setTimeout(() => {
              spacer.style.display = 'block';
            }, outputDelay + 60);
          }
        }

        const nextDelay = Math.max(outputDelay + 200, 400);
        setTimeout(() => {
          blockIndex++;
          setTimeout(typeBlock, 80);
        }, nextDelay);
      }
    }

    setTimeout(typeChar, 150);
  }

  // Wait for profile data populated by main.js
  document.addEventListener('profile-ready', () => setTimeout(typeBlock, 400));
})();
