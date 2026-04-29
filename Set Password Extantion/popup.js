const DEFAULT_PASSWORD = '123456789aaA!!!!';
const input = document.getElementById('password');
const status = document.getElementById('status');

chrome.storage.local.get('password', ({ password }) => {
  input.value = password ?? DEFAULT_PASSWORD;
});

input.addEventListener('change', () => {
  chrome.storage.local.set({ password: input.value });
});

document.getElementById('run').addEventListener('click', async () => {
  const password = input.value;
  chrome.storage.local.set({ password });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (P) => {
      const wait = (el) => new Promise((res, rej) => {
        const t = setTimeout(() => rej('Timeout'), 10000);
        const check = () => {
          if (el && el.offsetParent !== null) { clearTimeout(t); res(el); }
          else setTimeout(check, 100);
        };
        check();
      });

      (async () => {
        const fields = document.querySelectorAll('input[type="password"]');
        for (const field of fields) {
          await wait(field);
          field.click();
          field.value = P;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const btn = [...document.querySelectorAll('button')].find(b => /send/i.test(b.textContent));
        await wait(btn);
        btn.click();
      })();
    },
    args: [password]
  });

  status.style.display = 'block';
});
