document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  function showMessage(id, text) {
    const messageEl = document.getElementById(id);
    if (messageEl) {
      messageEl.textContent = text;
    }
  }

  async function createOrder(form) {
    const game = form.querySelector('select[name="game"]').value;
    const playerId = form.querySelector('input[name="player-id"]').value;
    const server = form.querySelector('input[name="server"]').value;
    const pkg = form.querySelector('select[name="package"]').value;

    const response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game, playerId, server, package: pkg }),
    });

    const data = await response.json();
    if (!response.ok) {
      showMessage('order-result', data.error || 'Gagal membuat pesanan.');
      return;
    }

    localStorage.setItem('nexal_last_order', data.order.id);
    showMessage('order-result', `Pesanan dibuat: ${data.order.id}. Silakan lanjutkan ke halaman pembayaran.`);
  }

  async function checkOrder(form) {
    const orderId = form.querySelector('input[name="order-id"]').value;
    if (!orderId) {
      showMessage('order-check-result', 'Masukkan nomor pesanan terlebih dahulu.');
      return;
    }

    const response = await fetch(`/api/order/${orderId}`);
    const data = await response.json();
    if (!response.ok) {
      showMessage('order-check-result', data.error || 'Pesanan tidak ditemukan.');
      return;
    }

    const message = `Status: ${data.status}. Game: ${data.game}. Paket: ${data.package}. Total: ${data.total}.`;
    showMessage('order-check-result', message);
  }

  async function confirmPayment(form) {
    const orderId = form.querySelector('input[name="order-id"]').value;
    const method = form.querySelector('select[name="payment-method"]').value;
    const amount = form.querySelector('input[name="amount"]').value;

    if (!orderId) {
      showMessage('payment-confirm-result', 'Masukkan nomor pesanan untuk konfirmasi pembayaran.');
      return;
    }

    const response = await fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, method, amount }),
    });

    const data = await response.json();
    if (!response.ok) {
      showMessage('payment-confirm-result', data.error || 'Gagal konfirmasi pembayaran.');
      return;
    }

    showMessage('payment-confirm-result', `Pembayaran terkonfirmasi untuk ${data.order.id}. Status: ${data.order.status}.`);
  }

  document.querySelectorAll('.topup-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      createOrder(form);
    });
  });

  document.querySelectorAll('.order-check-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      checkOrder(form);
    });
  });

  document.querySelectorAll('.payment-confirm-form').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      confirmPayment(form);
    });
  });

  const lastOrder = localStorage.getItem('nexal_last_order');
  const orderIdInput = document.querySelector('input[name="order-id"]');
  if (lastOrder && orderIdInput && orderIdInput.value.trim() === '') {
    orderIdInput.value = lastOrder;
  }

  const filterButtons = document.querySelectorAll('.filter-pill');
  const dealCards = document.querySelectorAll('.deal-card');
  const gameCards = document.querySelectorAll('.game-card');

  function applyFilter(category) {
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === category);
    });

    dealCards.forEach(card => {
      const cardCategory = card.dataset.category || 'popular';
      card.style.display = category === 'ALL' || category === cardCategory ? 'grid' : 'none';
    });

    gameCards.forEach(card => {
      const cardCategory = card.dataset.category || 'popular';
      card.style.display = category === 'ALL' || category === cardCategory ? 'grid' : 'none';
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filter);
    });
  });
});
