// ===============================================
// EcoGuard - Full Working script.js (FINAL VERSION)
// Includes: Live Stats + Cart + Fake Donations + Live Pie Chart
// ===============================================

// ===== 1. LIVE CLIMATE STATS =====
const co2Element = document.getElementById('co2');
const tempElemcent = doument.getElementById('temp');
const treesElement = document.getElementById('trees');

let baseCO2 = 421.38;
let baseTemp = 1.24;
let treesLost = 48000;

setInterval(() => {
  baseCO2 += 0.02;
  baseTemp += 0.0001;
  treesLost += 37;
  co2Element.textContent = baseCO2.toFixed(2);
  tempElement.textContent = "+" + baseTemp.toFixed(2);
  treesElement.textContent = Math.floor(treesLost).toLocaleString();
}, 3000);

// ===== 2. SHOPPING CART SYSTEM =====
let cart = JSON.parse(localStorage.getItem('ecoguardCart')) || [];

const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');

// Create cart sidebar
document.body.insertAdjacentHTML('beforeend', `
  <div class="cart-overlay" id="cartOverlay"></div>
  <div class="cart-sidebar" id="cartSidebar">
    <div class="cart-header">
      <h2>Your Cart (<span id="sidebarCount">0</span>)</h2>
      <button class="close-cart" id="closeCart">×</button>
    </div>
    <div id="cartItems"></div>
    <div class="cart-total">Total: $<span id="cartTotal">0.00</span></div>
    <button class="checkout-btn">Proceed to Checkout</button>
  </div>
`);

const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const sidebarCount = document.getElementById('sidebarCount');

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  sidebarCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty. Start saving the planet!</p>';
    cartTotalElement.textContent = '0.00';
    return;
  }

  cartItemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>$${item.price} × ${item.quantity}</p>
      </div>
      <button class="remove-item" data-index="${index}">×</button>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotalElement.textContent = total.toFixed(2);
}

function addToCart(name, price, image) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  localStorage.setItem('ecoguardCart', JSON.stringify(cart));
  updateCartUI();
  alert(`${name} added to cart!`);
}

// Add to cart buttons
document.querySelectorAll('.btn-buy').forEach(button => {
  button.addEventListener('click', () => {
    const product = button.closest('.product') || button.closest('.kit');
    const name = product.querySelector('h3').textContent;
    const priceText = product.querySelector('.price')?.textContent || button.textContent;
    const price = parseFloat(priceText.replace('$', '')) || 50;
    const image = product.querySelector('img')?.src || 'https://images.unsplash.com/photo-1613665798979-93d4318a0888?w=400';

    addToCart(name, price, image);
  });
});

// Cart open/close
cartIcon.addEventListener('click', () => {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
  updateCartUI();
});

document.getElementById('closeCart').addEventListener('click', () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
});

cartOverlay.addEventListener('click', () => {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
});

// Remove item
cartItemsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-item')) {
    const index = e.target.dataset.index;
    cart.splice(index, 1);
    localStorage.setItem('ecoguardCart', JSON.stringify(cart));
    updateCartUI();
  }
});

// ===== 3. FAKE DONATION SYSTEM + LIVE PIE CHART =====
let donationData = JSON.parse(localStorage.getItem('ecoguardDonations')) || {
  reforestation: 350000,
  methane: 250000,
  renewables: 200000,
  education: 100000,
  operations: 100000,
  totalDonated: 0
};

const donateButtons = document.querySelectorAll('.donate-btn');
const customAmountInput = document.getElementById('customAmount');
const payNowBtn = document.getElementById('payNow');
let myChart;

// Update pie chart with real donated amounts
function updateDonationChart() {
  const totalRaised = donationData.totalDonated;

  if (myChart) myChart.destroy();

  myChart = new Chart(document.getElementById('donationChart').getContext('2d'), {
    type: 'pie',
    data: {
      labels: [
        `Reforestation (35%) – $${Math.round(donationData.reforestation / 1000)}k`,
        `Methane Reduction (25%) – $${Math.round(donationData.methane / 1000)}k`,
        `Renewable Energy (20%) – $${Math.round(donationData.renewables / 1000)}k`,
        `Climate Education (10%) – $${Math.round(donationData.education / 1000)}k`,
        `Operations (10%) – $${Math.round(donationData.operations / 1000)}k`
      ],
      datasets: [{
        data: [35, 25, 20, 10, 10],
        backgroundColor: ['#1b5e20', '#2e7d32', '#66bb6a', '#a5d6a7', '#c8e6c9'],
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 20
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 20, font: { size: 13 } } },
        title: {
          display: true,
          text: `Total Raised So Far: $${(totalRaised / 1000).toFixed(1)}k — Thank You!`,
          font: { size: 20, weight: 'bold' },
          color: '#0a4d3c',
          padding: 20
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const actual = (value / 100) * totalRaised;
              return `$${actual.toLocaleString(undefined, {maximumFractionDigits: 0})} donated`;
            }
          }
        }
      }
    }
  });
}

// Process fake donation
function processDonation(amount) {
  if (!amount || amount <= 0) {
    alert("Please select or enter a valid amount!");
    return;
  }

  // Distribute according to percentages
  donationData.reforestation += amount * 0.35;
  donationData.methane += amount * 0.25;
  donationData.renewables += amount * 0.20;
  donationData.education += amount * 0.10;
  donationData.operations += amount * 0.10;
  donationData.totalDonated += amount;

  localStorage.setItem('ecoguardDonations', JSON.stringify(donationData));
  updateDonationChart();

  // Success feedback
  payNowBtn.textContent = "Thank You!";
  payNowBtn.style.background = "#1b5e20";
  setTimeout(() => {
    payNowBtn.textContent = "Donate Securely (Fake)";
    payNowBtn.style.background = "#0a4d3c";
  }, 3000);

  alert(`You just donated $${amount}! The planet thanks you`);
}

// Donation button selection
donateButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    donateButtons.forEach(b => {
      b.style.background = '#e0f2e9';
      b.style.color = '#0a4d3c';
    });
    btn.style.background = '#0a4d3c';
    btn.style.color = 'white';
    customAmountInput.value = '';
  });
});

// Pay button
payNowBtn.addEventListener('click', () => {
  let amount = parseFloat(customAmountInput.value);

  if (!amount || amount <= 0) {
    const selected = document.querySelector('.donate-btn[style*="rgb(10, 77, 60)"]');
    if (selected) amount = parseInt(selected.dataset.amount);
  }

  processDonation(amount);
  customAmountInput.value = '';
});

// ===== INITIALIZE EVERYTHING ON PAGE LOAD =====
updateCartUI();
updateDonationChart();