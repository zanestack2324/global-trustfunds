// Global Trustfunds - blockchain / on chain investing (demo)
(function () {
  'use strict';

  var GT = window.GTWeb3 = {
    provider: null,
    account: null,
    chainId: null,

    // ---------- helpers ----------
    statusEl: null,
    badgeEl: null,

    store: function (key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} },
    load: function (key, def) { try { return JSON.parse(localStorage.getItem(key) || 'null') || def; } catch (e) { return def; } },

    short: function (addr) {
      if (!addr) return '';
      return addr.slice(0, 6) + '...' + addr.slice(-4);
    },

    randomHash: function () {
      var hex = '0123456789abcdef';
      var out = '0x';
      for (var i = 0; i < 64; i++) out += hex[Math.floor(Math.random() * 16)];
      return out;
    },

    // ---------- connect ----------
    connect: function () {
      var self = this;
      if (!window.ethereum && !window.ic && !window.bitkeep) {
        return Promise.resolve({ ok: false, error: 'no-wallet' });
      }
      var provider = window.ethereum || window.ic || window.bitkeep;
      self.provider = provider;
      return provider.request({ method: 'eth_requestAccounts' })
        .then(function (accounts) {
          self.account = accounts[0];
          self.chainId = provider.chainId || null;
          var wallet = { address: self.account, chainId: self.chainId, ts: Date.now() };
          self.store('gt_wallet', wallet);
          self.refreshUI();
          return { ok: true, account: self.account };
        })
        .catch(function (err) {
          return { ok: false, error: err ? err.message || 'rejected' : 'unknown' };
        });
    },

    disconnect: function () {
      this.account = null; this.chainId = null; this.provider = null;
      try { localStorage.removeItem('gt_wallet'); } catch (e) {}
      this.refreshUI();
    },

    connected: function () {
      if (this.account) return this.account;
      var w = this.load('gt_wallet', null);
      this.account = w ? w.address : null;
      this.chainId = w ? w.chainId : null;
      return this.account;
    },

    // ---------- invest ----------
    invest: function (property, amountUsd) {
      var self = this;
      var address = self.connected();
      if (!address) return { ok: false, error: 'not-connected' };
      if (!amountUsd || amountUsd < 50) return { ok: false, error: 'amount-too-low' };
      var usdc = Math.round(amountUsd * 100) / 100;      // 1-to-1 USDC
      var gas = (0.00001 + Math.random() * 0.00005).toFixed(6);
      var tx = { hash: self.randomHash(), network: 'Polygon', asset: 'USDC', amount: usdc, fee: gas };
      var record = {
        id: Date.now(),
        propertyId: property.id,
        property: property.name,
        apy: property.apy,
        amount: usdc,
        asset: tx.asset,
        hash: tx.hash,
        network: tx.network,
        date: new Date().toISOString()
      };
      var txs = self.load('gt_chain_txs', []);
      txs.unshift(record);
      self.store('gt_chain_txs', txs);
      return { ok: true, record: record };
    },

    txs: function () { return this.load('gt_chain_txs', []); }
  };

  // ---------- inject a wallet badge into nav actions ----------
  function getProviderLabel() {
    if (window.bitkeep) return 'BitKeep';
    if (window.ic) return 'WalletConnect';
    if (window.ethereum) return 'MetaMask';
    return null;
  }

  function injectNavBadge() {
    var actions = document.querySelector('.nav__actions');
    if (!actions) return;
    if (actions.querySelector('.gt-wallet')) return;
    var badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'btn btn--ghost gt-wallet';
    badge.id = 'gtWalletBtn';
    badge.setAttribute('aria-label', 'Connect wallet');
    actions.insertBefore(badge, actions.firstChild);
    GT.badgeEl = badge;
    GT.refreshUI();
  }

  // ---------- global invest modal ----------
  function ensureModal() {
    var modal = document.getElementById('gtModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'gtModal';
    modal.className = 'gt-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="gt-modal__overlay"></div>' +
      '<div class="gt-modal__box" role="dialog" aria-modal="true" aria-labelledby="gtModalTitle">' +
        '<button type="button" class="gt-modal__close" aria-label="Close">×</button>' +
        '<h3 id="gtModalTitle">Invest on chain</h3>' +
        '<div class="gt-modal__body">' +
          '<div class="gt-wallet-row" id="gtWalletStatus"></div>' +
          '<label class="calc__field"><span>Property</span>' +
            '<select id="gtInvestProp"></select>' +
          '</label>' +
          '<label class="calc__field"><span>Investment Amount (USD)</span>' +
            '<div class="calc__input"><span class="calc__prefix">$</span><input type="number" id="gtInvestAmount" value="1000" min="50" step="50" /></div>' +
          '</label>' +
          '<p class="gt-modal__note">You will receive <b id="gtReceive">1000.00 USDC</b> on the Polygon network as tokenized ownership of this property.</p>' +
          '<button type="button" class="btn btn--gold btn--lg gt-invest-btn" id="gtInvestBtn">Connect to continue</button>' +
          '<p class="form-msg" id="gtInvestMsg" role="status"></p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.querySelector('.gt-modal__overlay').addEventListener('click', closeModal);
    modal.querySelector('.gt-modal__close').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

    var amount = modal.querySelector('#gtInvestAmount');
    amount.addEventListener('input', function () {
      var v = parseFloat(amount.value) || 0;
      modal.querySelector('#gtReceive').textContent = v.toFixed(2) + ' USDC';
    });

    modal.querySelector('#gtInvestBtn').addEventListener('click', function () {
      var btn = modal.querySelector('#gtInvestBtn');
      var msg = modal.querySelector('#gtInvestMsg');
      var sel = modal.querySelector('#gtInvestProp');
      var propId = sel.value;
      var prop = null;
      if (window.PROPERTIES) {
        prop = window.PROPERTIES.filter(function (p) { return p.id === propId; })[0];
      }
      if (!prop) { prop = { id: propId, name: sel.options[sel.selectedIndex].text, apy: '12' }; }
      var amountUsd = parseFloat(modal.querySelector('#gtInvestAmount').value) || 0;

      if (!GT.connected()) {
        GT.connect().then(function (res) {
          if (!res.ok) { showMsg(msg, 'Please install MetaMask or another crypto wallet to invest on chain.', 'error'); return; }
          doInvest(btn, msg, modal, prop, amountUsd);
        });
        return;
      }
      doInvest(btn, msg, modal, prop, amountUsd);
    });

    return modal;
  }

  function doInvest(btn, msg, modal, prop, amountUsd) {
    btn.disabled = true;
    btn.textContent = 'Confirming transaction...';
    showMsg(msg, 'Please review and approve the transaction in your wallet.', '');
    setTimeout(function () {
      var res = GT.invest(prop, amountUsd);
      if (!res.ok) {
        showMsg(msg, 'Could not complete the transaction. Please try again.', 'error');
        btn.disabled = false; btn.textContent = 'Retry invest'; return;
      }
      showMsg(msg, 'Confirmed on chain. Transaction ' + GT.short(res.record.hash), 'success');
      btn.disabled = false; btn.textContent = 'Invest on chain';
      document.dispatchEvent(new CustomEvent('gt:invested', { detail: { record: res.record } }));
    }, 1400);
  }

  function showMsg(el, text, type) {
    el.textContent = text;
    el.className = 'form-msg ' + (type || '');
  }

  function openModal(propId) {
    var modal = ensureModal();
    var status = modal.querySelector('#gtWalletStatus');
    var btn = modal.querySelector('#gtInvestBtn');
    var sel = modal.querySelector('#gtInvestProp');
    var connected = GT.connected();

    // fill select
    var current = sel.value;
    sel.innerHTML = '';
    var opts = window.PROPERTIES || [];
    (opts.length ? opts : []).forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.id; o.textContent = p.name + '  |  ' + p.apy + '% APY';
      sel.appendChild(o);
    });
    if (propId && current === propId) sel.value = propId;
    else if (propId) sel.value = propId;
    var chosen = (window.PROPERTIES || []).filter(function (p) { return p.id === sel.value; })[0];
    if (chosen) btn.textContent = connected ? 'Invest in ' + chosen.name : 'Connect to continue';

    if (connected) {
      status.innerHTML = '<span class="gt-dot"></span> Connected <b>' + GT.short(connected) + '</b>';
      status.className = 'gt-wallet-row'; 
    } else {
      status.innerHTML = 'Please connect a wallet to begin an on chain investment.';
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    var modal = document.getElementById('gtModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ---------- wire up invest buttons ----------
  function wireChainButtons() {
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.invest-chain') : null;
      if (b && b.dataset) { openModal(b.dataset.propid || ''); }
    });
  }

  // ---------- refresh nav + any dashboard wallet card ----------
  function renderDashboard() {
    var addrEl = document.getElementById('dashWalletAddr');
    var statusEl = document.getElementById('dashWalletStatus');
    var tokenEl = document.getElementById('dashTokenBalance');
    var chainEl = document.getElementById('dashChain');
    var txList = document.getElementById('dashChainTxs');
    if (!addrEl) return;
    var connected = GT.connected();
    if (connected) {
      addrEl.textContent = GT.short(connected);
      if (statusEl) statusEl.innerHTML = '<span class="gt-dot"></span> Connected';
    } else {
      addrEl.textContent = 'Not connected';
      if (statusEl) statusEl.innerHTML = 'Connect a wallet to start on chain investing.';
    }
    var txs = GT.txs();
    var total = txs.reduce(function (s, t) { return s + (t.amount || 0); }, 0);
    if (tokenEl) tokenEl.textContent = '$' + total.toFixed(2);
    if (chainEl) chainEl.textContent = GT.provider && GT.provider.chainId ? ('Chain ' + GT.provider.chainId) : 'Polygon';
    if (txList) {
      if (!txs.length) {
        txList.innerHTML = '<p style="color:var(--muted);font-size:14px;margin-top:12px">No on chain transactions yet. Click "Invest on chain" to buy tokenized ownership with your wallet.</p>';
        return;
      }
      txList.innerHTML = '<p style="font-weight:700;color:var(--ink);margin:18px 0 4px">Recent On Chain Activity</p>' + txs.map(function (t) {
        var short = (t.hash || '').slice(0, 10) + '...' + (t.hash || '').slice(-6);
        return '<div class="chaintx">' +
          '<div><b>' + t.property + '</b><div class="chaintx__hash">' + short + ' on ' + t.network + '</div></div>' +
          '<div class="chaintx__amt"><b>' + t.amount.toFixed(2) + ' USDC</b><span style="color:var(--muted);font-size:12px">' + new Date(t.date).toLocaleDateString() + '</span></div>' +
          '</div>';
      }).join('');
    }
  }

  window.GTWalletRender = renderDashboard;

  function wireDashboard() {
    var openBtn = document.getElementById('dashOpenInvest');
    if (openBtn) {
      openBtn.addEventListener('click', function () { openModal(''); });
    }
  }

  GT.refreshUI = function () {
    var connected = GT.connected();
    if (GT.badgeEl) {
      GT.badgeEl.innerHTML = connected ? ('Wallet  ' + GT.short(connected)) : 'Connect Wallet';
      GT.badgeEl.className = 'btn gt-wallet ' + (connected ? 'btn--gold' : 'btn--ghost');
    }
    if (GT.statusEl) {
      if (connected) {
        GT.statusEl.innerHTML = '<span class="gt-dot"></span> Connected <b>' + GT.short(connected) + '</b>';
      } else {
        GT.statusEl.textContent = 'Not connected';
      }
    }
    if (window.GTWalletRender) window.GTWalletRender();
  };

  function init() {
    var providerLabel = getProviderLabel();
    // persist known provider label for messaging
    if (providerLabel) { try { localStorage.setItem('gt_provider', providerLabel); } catch (e) {} }

    injectNavBadge();

    if (GT.badgeEl) {
      GT.badgeEl.addEventListener('click', function () {
        if (GT.connected()) {
          if (window.confirm('Disconnect your crypto wallet?')) GT.disconnect();
        } else {
          GT.connect().then(function (res) {
            if (!res.ok && res.error === 'no-wallet') {
              window.alert('No crypto wallet detected. Install MetaMask, then return to connect your wallet.');
            }
          });
        }
      });
    }

    wireChainButtons();
    wireDashboard();
    GT.connected();
    GT.refreshUI();
    renderDashboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();