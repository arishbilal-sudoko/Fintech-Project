function getUsers(){try{return JSON.parse(localStorage.getItem('ss_users')||'{}')}catch(e){return{}}}
function saveUsers(u){localStorage.setItem('ss_users',JSON.stringify(u))}
(function(){const u=getUsers();if(!u.admin){u.admin={password:'1234',name:'Admin'};saveUsers(u)}})();
let currentUser=null,currentName='';
document.getElementById('tab-login-btn').addEventListener('click',()=>{document.getElementById('tab-login-btn').classList.add('active');document.getElementById('tab-reg-btn').classList.remove('active');document.getElementById('login-form').classList.remove('hidden');document.getElementById('reg-form').classList.add('hidden')});
document.getElementById('tab-reg-btn').addEventListener('click',()=>{document.getElementById('tab-reg-btn').classList.add('active');document.getElementById('tab-login-btn').classList.remove('active');document.getElementById('reg-form').classList.remove('hidden');document.getElementById('login-form').classList.add('hidden')});
function showAlert(id,msg,type){const el=document.getElementById(id);el.textContent=msg;el.className='auth-alert '+(type||'error');el.classList.remove('hidden')}
document.getElementById('btn-register').addEventListener('click',()=>{
  const name=document.getElementById('reg-name').value.trim(),user=document.getElementById('reg-user').value.trim().toLowerCase(),pass=document.getElementById('reg-pass').value,pass2=document.getElementById('reg-pass2').value;
  document.getElementById('reg-alert').classList.add('hidden');
  if(!name||!user||!pass)return showAlert('reg-alert','All fields are required.');
  if(pass.length<4)return showAlert('reg-alert','Password must be at least 4 characters.');
  if(pass!==pass2)return showAlert('reg-alert','Passwords do not match.');
  const users=getUsers();if(users[user])return showAlert('reg-alert','Username already taken.');
  users[user]={password:pass,name};saveUsers(users);showAlert('reg-alert','Account created! You can now sign in.','success');
  setTimeout(()=>{document.getElementById('tab-login-btn').click();document.getElementById('login-user').value=user},1200);
});
function doLogin(){
  const u=document.getElementById('login-user').value.trim().toLowerCase(),p=document.getElementById('login-pass').value;
  document.getElementById('login-alert').classList.add('hidden');
  const users=getUsers();
  if(users[u]&&users[u].password===p){
    currentUser=u;currentName=users[u].name||u;
    document.getElementById('auth-screen').style.display='none';document.getElementById('app-screen').style.display='block';
    document.getElementById('nav-avatar').textContent=currentName[0].toUpperCase();document.getElementById('nav-name').textContent=currentName;
    loadData();render();renderSalaryTab();
  }else showAlert('login-alert','Incorrect username or password.');
}
document.getElementById('btn-login').addEventListener('click',doLogin);
['login-user','login-pass'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()}));
document.getElementById('btn-logout').addEventListener('click',()=>{currentUser=null;document.getElementById('app-screen').style.display='none';document.getElementById('auth-screen').style.display='flex';document.getElementById('login-user').value='';document.getElementById('login-pass').value='';document.getElementById('login-alert').classList.add('hidden');document.getElementById('tab-login-btn').click()});

const CAT={Food:{emoji:'🍔',color:'#137CC8',bg:'#e8f4fd'},Transport:{emoji:'🚗',color:'#0F6E56',bg:'#e1f5ee'},Housing:{emoji:'🏠',color:'#533AB7',bg:'#eeedfe'},Health:{emoji:'💊',color:'#D4537E',bg:'#fbeaf0'},Entertainment:{emoji:'🎮',color:'#BA7517',bg:'#faeeda'},Shopping:{emoji:'🛍️',color:'#D85A30',bg:'#faece7'},Utilities:{emoji:'💡',color:'#639922',bg:'#eaf3de'},Education:{emoji:'📚',color:'#185FA5',bg:'#e6f1fb'},Other:{emoji:'📦',color:'#888780',bg:'#f1efe8'}};
let data={budget:0,expenses:[],salary:[]};
function storageKey(){return 'ss_data_'+(currentUser||'guest')}
function loadData(){try{const s=localStorage.getItem(storageKey());if(s)data=JSON.parse(s);else data={budget:0,expenses:[],salary:[]}}catch(e){data={budget:0,expenses:[],salary:[]}}if(!data.salary)data.salary=[];document.getElementById('budget-input').value=data.budget>0?data.budget:''}
function save(){localStorage.setItem(storageKey(),JSON.stringify(data))}
const now=new Date();
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
function getMonthItems(arr){return(arr||[]).filter(e=>{const d=new Date(e.date+'T00:00:00');return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear()})}
function fmt(n){return'₹'+Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function dateLabel(ds){return new Date(ds+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function drawDonut(spent,budget){
  const svg=document.getElementById('donut-svg'),cx=65,cy=65,r=50,stroke=14,circ=2*Math.PI*r;
  const pct=budget>0?Math.min(spent/budget,1):0,remaining=budget>0?Math.max(budget-spent,0):0;
  let color='#137CC8';if(pct>=1)color='#e53e3e';else if(pct>=0.8)color='#f59e0b';
  svg.innerHTML=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f0f4f8" stroke-width="${stroke}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${circ*pct} ${circ*(1-pct)}" stroke-dashoffset="${circ*0.25}" stroke-linecap="round" style="transition:stroke-dasharray .6s ease"/>`;
  document.getElementById('donut-pct').textContent=Math.round(pct*100)+'%';
  document.getElementById('leg-spent').textContent=fmt(spent);document.getElementById('leg-remain').textContent=fmt(remaining);document.getElementById('leg-budget').textContent=fmt(budget);
}
function render(){
  document.getElementById('nav-month').textContent=monthNames[now.getMonth()]+' '+now.getFullYear();
  const exps=getMonthItems(data.expenses),salaries=getMonthItems(data.salary);
  const total=exps.reduce((s,e)=>s+e.amount,0),totalSalary=salaries.reduce((s,e)=>s+e.amount,0);
  const budget=data.budget||0,rem=budget-total,avg=total/Math.max(now.getDate(),1);
  document.getElementById('card-salary').textContent=fmt(totalSalary);document.getElementById('card-salary-sub').textContent=totalSalary>0?'Received this month':'No income logged yet';
  document.getElementById('card-budget').textContent=fmt(budget);
  const rc=document.getElementById('hcard-remain');
  if(budget>0&&total>budget){document.getElementById('card-remain').textContent='-'+fmt(total-budget);document.getElementById('card-remain-sub').textContent='Over budget!';rc.className='hcard hcard-danger'}
  else{document.getElementById('card-remain').textContent=budget>0?fmt(rem):'—';document.getElementById('card-remain-sub').textContent=budget>0?'Available to spend':'Set a budget first';rc.className='hcard hcard-remain'}
  const wb=document.getElementById('warn-box');
  if(budget>0&&total>budget){wb.classList.remove('hidden');document.getElementById('warn-text').textContent='⚠️ Budget exceeded by '+fmt(total-budget)+'! You set '+fmt(budget)+' but spent '+fmt(total)+'.'}else wb.classList.add('hidden');
  document.getElementById('stat-spent').textContent=fmt(total);document.getElementById('stat-salary').textContent=fmt(totalSalary);document.getElementById('stat-txn').textContent=exps.length;document.getElementById('stat-avg').textContent=fmt(avg)+'/day';
  drawDonut(total,budget);
  const pct=budget>0?Math.min((total/budget)*100,100):0,fill=document.getElementById('prog-fill');
  fill.style.width=pct.toFixed(1)+'%';fill.classList.toggle('danger',total>budget);
  document.getElementById('prog-label').textContent=budget>0?Math.round(pct)+'% of budget used':'No budget set';
  renderList(exps,'expense-list','count-badge');
}
function renderList(exps,listId,badgeId){
  const list=document.getElementById(listId),badge=document.getElementById(badgeId),sorted=[...exps].sort((a,b)=>new Date(b.date)-new Date(a.date));
  badge.textContent=sorted.length===1?'1 item':sorted.length+' items';
  if(sorted.length===0){list.innerHTML='<li class="empty-state"><div class="empty-icon">📭</div>Nothing here yet!</li>';return}
  list.innerHTML='';
  sorted.forEach(e=>{const c=CAT[e.category]||CAT.Other,li=document.createElement('li');li.className='expense-item';li.innerHTML=`<div class="exp-icon" style="background:${c.bg}">${c.emoji}</div><div class="exp-info"><div class="exp-title">${escHtml(e.title)}</div><div class="exp-meta">${dateLabel(e.date)} <span class="cat-pill" style="background:${c.bg};color:${c.color}">${e.category}</span></div></div><div class="exp-amount">${fmt(e.amount)}</div><button class="btn-del" data-id="${e.id}"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>`;list.appendChild(li)});
}

function renderSalaryTab(){
  const salaries=getMonthItems(data.salary);
  const exps=getMonthItems(data.expenses);
  const total=salaries.reduce((s,e)=>s+e.amount,0);
  const spent=exps.reduce((s,e)=>s+e.amount,0);
  const budget=data.budget||0;
  const pct=budget>0?Math.round(Math.min((spent/budget)*100,999)):0;
  document.getElementById('sal-hero-val').textContent=fmt(total);
  document.getElementById('sal-hero-sub').textContent=total>0?salaries.length+' income entr'+(salaries.length===1?'y':'ies')+' this month':'No income logged yet';
  document.getElementById('sal-stat-spent').textContent=fmt(spent);
  document.getElementById('sal-stat-save').textContent=fmt(total-spent);
  document.getElementById('sal-stat-budget').textContent=fmt(budget);
  document.getElementById('sal-stat-pct').textContent=pct+'%';
  document.getElementById('sal-stat-save').className='sinfo-val '+(total-spent>=0?'green':'red');
  const list=document.getElementById('salary-list');
  const cnt=document.getElementById('sal-count');
  cnt.textContent=salaries.length===1?'1 entry':salaries.length+' entries';
  if(salaries.length===0){list.innerHTML='<li class="empty-state"><div class="empty-icon">💸</div>No income logged yet.</li>';return;}
  list.innerHTML='';
  [...salaries].sort((a,b)=>new Date(b.date)-new Date(a.date)).forEach(e=>{
    const li=document.createElement('li');li.className='sh-item';
    li.innerHTML=`<div class="sh-icon">💰</div><div class="sh-info"><div class="sh-title">${escHtml(e.title)}</div><div class="sh-date">${dateLabel(e.date)}</div></div><div class="sh-amount">${fmt(e.amount)}</div><button class="btn-del-sm" data-sal-id="${e.id}"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>`;
    list.appendChild(li);
  });
}

let pendingDeleteId=null,pendingDeleteType='expense';
function openDeleteModal(id,title,type){pendingDeleteId=id;pendingDeleteType=type||'expense';document.getElementById('del-item-name').textContent='"'+title+'"';document.getElementById('delete-modal').classList.remove('hidden');}
function closeDeleteModal(){pendingDeleteId=null;document.getElementById('delete-modal').classList.add('hidden');}
document.getElementById('del-cancel').addEventListener('click',closeDeleteModal);
document.getElementById('delete-modal').addEventListener('click',function(e){if(e.target===this)closeDeleteModal();});
document.getElementById('del-confirm').addEventListener('click',()=>{
  if(pendingDeleteId!==null){
    if(pendingDeleteType==='salary'){data.salary=data.salary.filter(x=>x.id!==pendingDeleteId);}
    else{data.expenses=data.expenses.filter(x=>x.id!==pendingDeleteId);}
    save();render();renderSalaryTab();closeDeleteModal();
  }
});
document.getElementById('expense-list').addEventListener('click',function(e){const btn=e.target.closest('[data-id]');if(!btn)return;const expId=parseInt(btn.dataset.id),exp=data.expenses.find(x=>x.id===expId);if(exp)openDeleteModal(expId,exp.title,'expense')});
document.getElementById('salary-list').addEventListener('click',function(e){const btn=e.target.closest('[data-sal-id]');if(!btn)return;const salId=parseInt(btn.dataset.salId),sal=data.salary.find(x=>x.id===salId);if(sal)openDeleteModal(salId,sal.title,'salary')});
document.querySelectorAll('.main-tab').forEach(btn=>{btn.addEventListener('click',function(){document.querySelectorAll('.main-tab').forEach(b=>b.classList.remove('active'));this.classList.add('active');const tab=this.dataset.tab;['expenses','salary','summary'].forEach(t=>{document.getElementById('tab-'+t).classList.toggle('hidden',t!==tab)});if(tab==='salary')renderSalaryTab();if(tab==='summary')renderSummary();})});
const expDate=document.getElementById('exp-date');expDate.value=now.toISOString().split('T')[0];expDate.max=now.toISOString().split('T')[0];
function saveBudget(){
  const inp=document.getElementById('budget-input');
  const val=Math.max(0,parseFloat(inp.value)||0);
  if(!inp.value.trim()||isNaN(parseFloat(inp.value))||val<=0){
    document.getElementById('bi-hint-text').textContent='⚠️ Please enter a valid amount first!';
    document.getElementById('bi-hint-text').style.color='#e53e3e';
    inp.focus();
    setTimeout(()=>{
      document.getElementById('bi-hint-text').textContent='✏️ Type a value and click Set Limit';
      document.getElementById('bi-hint-text').style.color='';
    },2500);
    return;
  }

  const exps = getMonthItems(data.expenses);
  const totalSpent = exps.reduce((s,e)=>s+e.amount,0);
  const budgetBefore = data.budget || 0;

  data.budget=val;
  inp.value=val;
  save();
  render();
  renderSalaryTab();
  renderSummary();

  // If budget was not exceeded before (or wasn't set) but is exceeded now, show popup alert modal
  if (val > 0 && (budgetBefore === 0 || totalSpent <= budgetBefore) && totalSpent > val) {
    document.getElementById('overbudget-modal').classList.remove('hidden');
  }

  document.getElementById('bi-hint-text').textContent='✅ Budget saved!';
  document.getElementById('bi-hint-text').style.color='#16a34a';
  setTimeout(()=>{
    document.getElementById('bi-hint-text').textContent='✏️ Type a value and click Set Limit';
    document.getElementById('bi-hint-text').style.color='';
  },2500);
}
document.addEventListener('click',function(e){if(e.target.closest('#btn-set-budget'))saveBudget();});
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.id==='budget-input')saveBudget();});
document.getElementById('btn-add').addEventListener('click',()=>{
  const title=document.getElementById('exp-title').value.trim(),amountVal=document.getElementById('exp-amount').value,amount=parseFloat(amountVal),date=document.getElementById('exp-date').value,category=document.getElementById('exp-cat').value;
  if(!title)return alert('Please enter a title.');if(!amountVal||isNaN(amount)||amount<=0)return alert('Please enter a valid amount.');if(!date)return alert('Please select a date.');
  
  // Calculate total spent before adding the new expense
  const expsBefore = getMonthItems(data.expenses);
  const totalBefore = expsBefore.reduce((s,e)=>s+e.amount,0);
  const budget = data.budget || 0;

  data.expenses.push({id:Date.now(),title,amount:Math.round(amount*100)/100,date,category});
  save();
  render();

  // Calculate total spent after adding the new expense
  const expsAfter = getMonthItems(data.expenses);
  const totalAfter = expsAfter.reduce((s,e)=>s+e.amount,0);

  // If budget is set, was not exceeded before, but is exceeded now, show popup alert modal
  if (budget > 0 && totalBefore <= budget && totalAfter > budget) {
    document.getElementById('overbudget-modal').classList.remove('hidden');
  }

  document.getElementById('exp-title').value='';
  document.getElementById('exp-amount').value='';
  expDate.value=now.toISOString().split('T')[0];
  document.getElementById('exp-title').focus();
});
['exp-title','exp-amount'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('btn-add').click()}));
const salDate=document.getElementById('sal-date');salDate.value=now.toISOString().split('T')[0];salDate.max=now.toISOString().split('T')[0];
document.getElementById('btn-add-salary').addEventListener('click',()=>{
  const title=document.getElementById('sal-title').value.trim()||'Salary',amountVal=document.getElementById('sal-amount').value,amount=parseFloat(amountVal),date=document.getElementById('sal-date').value;
  if(!amountVal||isNaN(amount)||amount<=0)return alert('Please enter a valid amount.');if(!date)return alert('Please select a date.');
  if(!data.salary)data.salary=[];data.salary.push({id:Date.now(),title,amount:Math.round(amount*100)/100,date});save();render();renderSalaryTab();document.getElementById('sal-title').value='';document.getElementById('sal-amount').value='';salDate.value=now.toISOString().split('T')[0];
});
['sal-title','sal-amount'].forEach(id=>document.getElementById(id).addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('btn-add-salary').click()}));






/* ── SUMMARY TAB ── */
let summaryOffset = 0; // 0 = current month, -1 = last month, etc.

function getSummaryMonth() {
  const d = new Date(now.getFullYear(), now.getMonth() + summaryOffset, 1);
  return { year: d.getFullYear(), month: d.getMonth(), label: monthNames[d.getMonth()] + ' ' + d.getFullYear() };
}

function getItemsForSummaryMonth(arr) {
  const { year, month } = getSummaryMonth();
  return (arr || []).filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

function renderSummary() {
  const { label } = getSummaryMonth();
  document.getElementById('smn-title').textContent = label;
  const isCurrentMonth = summaryOffset === 0;
  document.getElementById('smn-sub').textContent = isCurrentMonth ? 'Current Month Summary' : 'Monthly Budget Summary';

  const exps = getItemsForSummaryMonth(data.expenses);
  const sals = getItemsForSummaryMonth(data.salary);
  const totalSpent = exps.reduce((s, e) => s + e.amount, 0);
  const totalIncome = sals.reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalSpent;
  const budget = data.budget || 0;
  const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const remaining = budget > 0 ? budget - totalSpent : 0;

  document.getElementById('sum-income').textContent = fmt(totalIncome);
  document.getElementById('sum-income-sub').textContent = sals.length + ' entr' + (sals.length === 1 ? 'y' : 'ies');
  document.getElementById('sum-spent').textContent = fmt(totalSpent);
  document.getElementById('sum-spent-sub').textContent = exps.length + ' transaction' + (exps.length === 1 ? '' : 's');
  document.getElementById('sum-savings').textContent = fmt(Math.abs(savings));
  document.getElementById('sum-savings-sub').textContent = savings >= 0 ? '✅ Surplus' : '⚠️ Deficit';
  document.getElementById('sum-savings').style.color = savings >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('sum-budget').textContent = fmt(budget);
  document.getElementById('sum-budget-sub').textContent = budget > 0 ? 'Monthly limit set' : 'No budget set';

  // Progress bar
  const bar = document.getElementById('sum-bar');
  bar.style.width = pct.toFixed(1) + '%';
  bar.className = 'sum-bar-fill' + (pct >= 100 ? ' danger' : pct >= 80 ? ' warn' : '');
  document.getElementById('sum-pct-label').textContent = budget > 0 ? Math.round(pct) + '%' : 'No budget set';
  document.getElementById('sum-bar-spent-label').textContent = 'Spent: ' + fmt(totalSpent);
  document.getElementById('sum-bar-remain-label').textContent = budget > 0 ? 'Remaining: ' + fmt(remaining) : '';

  // Category breakdown
  const catTotals = {};
  exps.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });
  const catSorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const catContainer = document.getElementById('sum-cat-list');
  if (catSorted.length === 0) {
    catContainer.innerHTML = '<div class="sum-empty">No expenses recorded</div>';
  } else {
    catContainer.innerHTML = '';
    const maxAmt = catSorted[0][1];
    catSorted.forEach(([cat, amt]) => {
      const c = CAT[cat] || CAT.Other;
      const barPct = (amt / maxAmt) * 100;
      const pctOfTotal = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
      const row = document.createElement('div');
      row.className = 'sum-cat-row';
      row.innerHTML = `
        <div class="sum-cat-icon" style="background:${c.bg}">${c.emoji}</div>
        <div class="sum-cat-info">
          <div class="sum-cat-name">${cat}</div>
          <div class="sum-cat-bar-bg"><div class="sum-cat-bar-fill" style="width:${barPct.toFixed(1)}%;background:${c.color}"></div></div>
        </div>
        <div class="sum-cat-amt">${fmt(amt)}</div>
        <div class="sum-cat-pct">${pctOfTotal}%</div>`;
      catContainer.appendChild(row);
    });
  }

  // All transactions list
  const sorted = [...exps].sort((a, b) => new Date(b.date) - new Date(a.date));
  const txnList = document.getElementById('sum-expense-list');
  const txnBadge = document.getElementById('sum-txn-badge');
  txnBadge.textContent = sorted.length === 1 ? '1 item' : sorted.length + ' items';
  if (sorted.length === 0) {
    txnList.innerHTML = '<li class="empty-state"><div class="empty-icon">📭</div>No transactions this month</li>';
  } else {
    txnList.innerHTML = '';
    sorted.forEach(e => {
      const c = CAT[e.category] || CAT.Other;
      const li = document.createElement('li');
      li.className = 'expense-item';
      li.innerHTML = `<div class="exp-icon" style="background:${c.bg}">${c.emoji}</div>
        <div class="exp-info"><div class="exp-title">${escHtml(e.title)}</div>
        <div class="exp-meta">${dateLabel(e.date)} <span class="cat-pill" style="background:${c.bg};color:${c.color}">${e.category}</span></div></div>
        <div class="exp-amount">${fmt(e.amount)}</div>`;
      txnList.appendChild(li);
    });
  }
}

document.getElementById('smn-prev').addEventListener('click', () => { summaryOffset--; renderSummary(); });
document.getElementById('smn-next').addEventListener('click', () => {
  if (summaryOffset < 0) { summaryOffset++; renderSummary(); }
});

/* ── RESET BUDGET ── */
document.addEventListener('click', function(e) {
  if (!e.target.closest('#btn-reset-budget')) return;
  data.budget = 0;
  const inp = document.getElementById('budget-input');
  inp.value = '';
  inp.placeholder = 'Enter amount…';
  save();
  render();
  renderSalaryTab();
  const hint = document.getElementById('bi-hint-text');
  hint.textContent = '🔄 Budget reset to ₹0';
  hint.style.color = '#e53e3e';
  setTimeout(() => {
    hint.textContent = '✏️ Type a value and click Set Limit';
    hint.style.color = '';
  }, 2000);
});

/* ── RESET EXPENSES ── */
document.addEventListener('click', function(e) {
  if (!e.target.closest('#btn-reset-expenses')) return;
  data.expenses = [];
  save();
  render();
  renderSalaryTab();
  renderSummary();
});

/* ── RESET SALARY/INCOME ── */
document.addEventListener('click', function(e) {
  if (!e.target.closest('#btn-reset-salary')) return;
  data.salary = [];
  save();
  render();
  renderSalaryTab();
  renderSummary();
});



/* TIPS */
const TIPS=[
  {icon:'☕',text:'Brew coffee at home instead of buying daily. Saving just Rs.50/day adds up to Rs.1,500+ per month.',tag:'Food & Drink',tagBg:'#faeeda',tagColor:'#BA7517'},
  {icon:'📋',text:'Set your monthly budget before spending anything. Tracking without a limit makes it easy to overspend.',tag:'Budgeting',tagBg:'#eeedfe',tagColor:'#534AB7'},
  {icon:'🔔',text:'Review your expenses every Sunday. A 5-minute weekly check-in prevents big end-of-month surprises.',tag:'Habit',tagBg:'#e8f4fd',tagColor:'#137CC8'},
  {icon:'🚗',text:'Combine errands into one trip. Fuel costs add up — batching trips can cut transport spend significantly.',tag:'Transport',tagBg:'#eaf3de',tagColor:'#3B6D11'},
  {icon:'💡',text:'Switch off lights and unplug chargers when not in use. Small habits can cut your electricity bill by 10-15%.',tag:'Utilities',tagBg:'#eaf3de',tagColor:'#3B6D11'},
  {icon:'🎮',text:'Pause or cancel subscriptions you have not used in 30 days. One unused sub is easy to miss — two or three adds up fast.',tag:'Entertainment',tagBg:'#faeeda',tagColor:'#BA7517'},
  {icon:'🏦',text:'Log your salary in the Salary tab each month. Seeing income vs. spending side-by-side reveals where money actually goes.',tag:'Savings',tagBg:'#e6f1fb',tagColor:'#185FA5'},
  {icon:'🍱',text:'Meal prep on weekends. Cooking in batches reduces both food waste and the temptation to order takeout.',tag:'Food & Drink',tagBg:'#faeeda',tagColor:'#BA7517'},
  {icon:'🛍️',text:'Wait 48 hours before buying anything non-essential. Most impulse urges fade — and you will have saved the money.',tag:'Shopping',tagBg:'#faece7',tagColor:'#993C1D'},
  {icon:'📊',text:'Aim to save at least 20% of your monthly salary. Even starting with 10% builds a meaningful cushion over time.',tag:'Savings',tagBg:'#e6f1fb',tagColor:'#185FA5'},
];
let tipIdx=0,tipOpen=false,tipAuto=true,tipTimer=null;
const tipCard=document.getElementById('tips-card'),tipBtn=document.getElementById('tips-btn');
function buildDots(){const c=document.getElementById('tc-dots');c.innerHTML='';const n=Math.min(TIPS.length,8);for(let i=0;i<n;i++){const d=document.createElement('div');d.className='tc-dot'+(i===tipIdx%n?' on':'');c.appendChild(d)}}
function showTip(i){
  const t=TIPS[i];document.getElementById('tip-txt').textContent=t.text;
  const b=document.getElementById('tip-ibox');b.textContent=t.icon;b.style.background=t.tagBg;
  const p=document.getElementById('tip-tpill');p.textContent=t.tag;p.style.background=t.tagBg;p.style.color=t.tagColor;
  document.getElementById('tc-sub').textContent='Tip '+(i+1)+' of '+TIPS.length;document.getElementById('tc-badge').textContent=(i+1)+' / '+TIPS.length;buildDots();
}
function openTips(){tipOpen=true;tipCard.classList.remove('tc-hide');showTip(tipIdx);startAuto()}
function closeTips(){tipOpen=false;tipCard.classList.add('tc-hide');clearInterval(tipTimer)}
function nextTip(){tipIdx=(tipIdx+1)%TIPS.length;showTip(tipIdx)}
function prevTip(){tipIdx=(tipIdx-1+TIPS.length)%TIPS.length;showTip(tipIdx)}
function startAuto(){clearInterval(tipTimer);if(tipAuto&&tipOpen)tipTimer=setInterval(nextTip,6000)}
tipBtn.addEventListener('click',()=>tipOpen?closeTips():openTips());
document.getElementById('tc-x').addEventListener('click',closeTips);
document.getElementById('tc-next').addEventListener('click',()=>{nextTip();if(tipAuto)startAuto()});
document.getElementById('tc-prev').addEventListener('click',()=>{prevTip();if(tipAuto)startAuto()});
document.getElementById('tc-auto').addEventListener('click',function(){tipAuto=!tipAuto;this.textContent=tipAuto?'On':'Off';this.classList.toggle('on',tipAuto);startAuto()});
showTip(0);

/* ── CLOSE OVERBUDGET MODAL ── */
function closeOverbudgetModal() {
  document.getElementById('overbudget-modal').classList.add('hidden');
}
document.getElementById('ob-close-btn').addEventListener('click', closeOverbudgetModal);
document.getElementById('overbudget-modal').addEventListener('click', function(e) {
  if (e.target === this) closeOverbudgetModal();
});

