// shared by login.html and register.html
// must be the same as AUTH_BASE_PATH and OAUTH_BASE_PATH in src/constants/auth.constant.ts
// if the api is mounted somewhere else, change these two lines only
const API_BASE = '/api/auth'; // login and register
const AUTHORIZE_PATH = '/api/oauth/authorize'; // where returnTo has to point

// returnTo is the original /authorize url the user was sent here from.
// only accept the authorize path of THIS server, otherwise this page becomes an open redirect
// (an attacker could send the user to ?returnTo=https://evil.com after a real login)
function getSafeReturnTo() {
  const raw = new URLSearchParams(window.location.search).get('returnTo');
  if (!raw) return null;

  try {
    const url = new URL(raw, window.location.origin);

    if (url.origin !== window.location.origin || url.pathname !== AUTHORIZE_PATH) return null;

    return url.pathname + url.search;
  } catch {
    return null;
  }
}

const form = document.querySelector('form');
const messageBox = document.querySelector('#message');
const submitButton = form.querySelector('button');
const returnTo = getSafeReturnTo();

function showMessage(text, isError) {
  messageBox.textContent = text;
  messageBox.className = isError ? 'message error' : 'message success';
}

// the "create account" / "back to login" link must keep returnTo, otherwise it is lost
const switchLink = document.querySelector('a[data-switch]');
if (switchLink && returnTo) {
  switchLink.href = `${switchLink.getAttribute('href')}?returnTo=${encodeURIComponent(returnTo)}`;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const body = Object.fromEntries(new FormData(form));

  submitButton.disabled = true;
  showMessage('Please wait...', false);

  try {
    // same origin, so the browser accepts the cookies the server sets
    const response = await fetch(`${API_BASE}/${form.dataset.action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!result.success) {
      showMessage(result.message || 'Something went wrong', true);
      submitButton.disabled = false;
      return;
    }

    // the cookie is set now: go back to /authorize, which will now find a logged in user
    if (returnTo) {
      window.location.assign(returnTo);
      return;
    }

    showMessage('You are logged in. You can close this page.', false);
  } catch {
    showMessage('Could not reach the server', true);
    submitButton.disabled = false;
  }
});
