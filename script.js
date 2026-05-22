document.getElementById('yr').textContent = new Date().getFullYear();

  var PRODUCTS = [
    {
      id:'starter', name:'PMG Starter Pack', price:2900, icon:'\uD83D\uDE80',
      features:['10 ready-to-use flow templates','Step-by-step setup guide','Lead-capture form pack','Email and community support']
    },
    {
      id:'pro', name:'PMG Pro Toolkit', price:7900, icon:'\u26A1',
      features:['Everything in Starter','Advanced multi-step automations','Broadcast and pipeline templates','White-label asset pack','Priority support']
    },
    {
      id:'agency', name:'PMG Agency License', price:19900, icon:'\uD83C\uDFC6',
      features:['Everything in Pro','Client-ready campaign templates','Resell and white-label rights','Onboarding playbook','One-on-one setup call']
    }
  ];

  var money = function(c){ return '$' + (c/100).toFixed(2); };
  var cart = {};

  var grid = document.getElementById('productGrid');
  PRODUCTS.forEach(function(p){
    var card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<div class="icon">'+p.icon+'</div>'+
      '<h3>'+p.name+'</h3>'+
      '<div class="price">'+money(p.price)+' <span>one-time</span></div>'+
      '<ul>'+p.features.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul>'+
      '<button class="add-btn" id="btn-'+p.id+'" onclick="addToCart(\''+p.id+'\')">A&ntilde;adir al carrito</button>';
    grid.appendChild(card);
  });

  function addToCart(id){
    cart[id] = (cart[id]||0) + 1;
    var btn = document.getElementById('btn-'+id);
    btn.textContent = 'A\u00f1adido';
    btn.classList.add('in-cart');
    setTimeout(function(){ btn.textContent='A\u00f1adir al carrito'; btn.classList.remove('in-cart'); }, 1100);
    renderCart();
  }

  function changeQty(id, delta){
    cart[id] = (cart[id]||0) + delta;
    if(cart[id] <= 0) delete cart[id];
    renderCart();
  }

  function removeItem(id){ delete cart[id]; renderCart(); }

  function cartCount(){
    return Object.keys(cart).reduce(function(a,k){return a+cart[k];},0);
  }

  function subtotalCents(){
    return Object.keys(cart).reduce(function(sum,id){
      var p = PRODUCTS.filter(function(x){return x.id===id;})[0];
      return sum + (p.price * cart[id]);
    },0);
  }

  function renderCart(){
    document.getElementById('cartCount').textContent = cartCount();
    var body = document.getElementById('drawerBody');
    var foot = document.getElementById('drawerFoot');
    var ids = Object.keys(cart);

    if(ids.length === 0){
      body.innerHTML = '<div class="empty">Your cart is empty.<br>Add a toolkit to get started.</div>';
      foot.style.display = 'none';
      return;
    }

    foot.style.display = 'block';
    body.innerHTML = ids.map(function(id){
      var p = PRODUCTS.filter(function(x){return x.id===id;})[0];
      var qty = cart[id];
      return ''+
        '<div class="line">'+
          '<div class="li-icon">'+p.icon+'</div>'+
          '<div class="li-info">'+
            '<h4>'+p.name+'</h4>'+
            '<div class="li-price">'+money(p.price)+' each</div>'+
            '<div class="qty">'+
              '<button onclick="changeQty(\''+id+'\',-1)" aria-label="Decrease">-</button>'+
              '<span>'+qty+'</span>'+
              '<button onclick="changeQty(\''+id+'\',1)" aria-label="Increase">+</button>'+
            '</div>'+
            '<button class="remove" onclick="removeItem(\''+id+'\')">Remove</button>'+
          '</div>'+
          '<div class="li-sub">'+money(p.price*qty)+'</div>'+
        '</div>';
    }).join('');

    document.getElementById('subtotal').textContent = money(subtotalCents());
  }

  function openCart(){
    document.getElementById('overlay').classList.add('open');
    document.getElementById('drawer').classList.add('open');
  }
  function closeCart(){
    document.getElementById('overlay').classList.remove('open');
    document.getElementById('drawer').classList.remove('open');
  }

  function checkout(){
    var ids = Object.keys(cart);
    if(ids.length === 0) return;

    var email = document.getElementById('email').value.trim();
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      alert('Please enter a valid email address for your receipt and delivery.');
      document.getElementById('email').focus();
      return;
    }

    var totalCents = subtotalCents();
    var totalDollars = totalCents / 100;

    var items = ids.map(function(id){
      var p = PRODUCTS.filter(function(x){return x.id===id;})[0];
      return {
        name: p.name,
        amount: p.price / 100,
        price: p.price / 100,
        quantity: cart[id]
      };
    });
    var summary = items.map(function(i){return i.quantity+'x '+i.name;}).join(', ');

    var btn = document.getElementById('checkoutBtn');
    btn.disabled = true;
    btn.textContent = 'Redirigiendo a Stripe...';

    function reset(){
      btn.disabled = false;
      btn.textContent = 'Pagar de forma segura';
    }

    try{
      var maybePromise = window.__processDonation({
        amount: totalDollars,
        email: email,
        label: 'PayMeGPT Store order',
        items: items,
        productName: summary,
        message: summary
      });
      if(maybePromise && typeof maybePromise.catch === 'function'){
        maybePromise.catch(function(){ reset(); });
      }
    }catch(e){
      reset();
    }
  }

  renderCart();