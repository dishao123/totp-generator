function getCurrentSeconds() {
  return Math.round(new Date().getTime() / 1000.0);
}

function stripSpaces(str) {
  return str.replace(/\s/g, '');
}

function truncateTo(str, digits) {
  if (str.length <= digits) {
    return str;
  }
  return str.slice(-digits);
}

function parseURLSearch(search) {
  const queryParams = search.substr(1).split('&').reduce(function (q, query) {
    const chunks = query.split('=');
    const key = chunks[0];
    let value = decodeURIComponent(chunks[1]);
    value = isNaN(Number(value)) ? value : Number(value);
    return (q[key] = value, q);
  }, {});
  return queryParams;
}

document.addEventListener('DOMContentLoaded', function () {
  let secretKey = 'JBSWY3DPEHPK3PXP';
  let digits = 6;
  let period = 30;
  let algorithm = 'SHA1';
  let updatingIn = 30;
  let token = null;
  let prevToken = null;
  let nextToken = null;

  function update() {
    updatingIn = period - (getCurrentSeconds() % period);

    const totp = new OTPAuth.TOTP({
      algorithm: algorithm,
      digits: digits,
      period: period,
      secret: OTPAuth.Secret.fromBase32(stripSpaces(secretKey)),
    });

    totp.timestamp = Date.now();
    token = truncateTo(totp.generate(), digits);

    totp.timestamp = Date.now() - period * 1000;
    prevToken = truncateTo(totp.generate(), digits);

    totp.timestamp = Date.now() + period * 1000;
    nextToken = truncateTo(totp.generate(), digits);

    document.getElementById('token').textContent = token;
    document.getElementById('prev-token').textContent = prevToken;
    document.getElementById('next-token').textContent = nextToken;
    document.getElementById('updating-in').textContent = updatingIn;
  }

  function getKeyFromUrl() {
    const key = document.location.hash.replace(/[#\/]+/, '');
    if (key.length > 0) {
      secretKey = key;
    }
  }

  function getQueryParameters() {
    const queryParams = parseURLSearch(window.location.search);
    if (queryParams.key) {
      secretKey = queryParams.key;
    }
    if (queryParams.digits) {
      digits = queryParams.digits;
    }
    if (queryParams.period) {
      period = queryParams.period;
    }
    if (queryParams.algorithm) {
      algorithm = queryParams.algorithm;
    }
  }

  getKeyFromUrl();
  getQueryParameters();
  update();
  setInterval(update, 1000);

  const clipboardButton = new ClipboardJS('#clipboard-button');
});
