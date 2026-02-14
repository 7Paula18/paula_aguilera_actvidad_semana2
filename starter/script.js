/**
 * ============================================
 * PROYECTO SEMANA 02 - FINTECH ASSET MANAGER
 * Dominio: Servicios Financieros y FinTech
 * ============================================
 */

// ============================================
// ESTADO GLOBAL
// ============================================
let items = [];
let editingItemId = null;

// ============================================
// TODO 1: CATEGORÍAS FINTECH
// ============================================
const CATEGORIES = {
  crypto: { name: 'Criptoactivo', emoji: '🪙' },
  stock: { name: 'Acción / ETF', emoji: '📈' },
  loan: { name: 'Préstamo', emoji: '🏦' },
  saving: { name: 'Ahorro', emoji: '💰' },
  other: { name: 'Otro', emoji: '📑' }
};

const PRIORITIES = {
  high: { name: 'Riesgo Alto', color: '#dc2626' },
  medium: { name: 'Riesgo Medio', color: '#d97706' },
  low: { name: 'Riesgo Bajo', color: '#059669' },
};

// ============================================
// TODO 2: PERSISTENCIA
// ============================================
const loadItems = () => JSON.parse(localStorage.getItem('fintech_assets') ?? '[]');

const saveItems = itemsToSave => {
  localStorage.setItem('fintech_assets', JSON.stringify(itemsToSave));
};

// ============================================
// TODO 3: CRUD - CREAR
// ============================================
const createItem = (itemData = {}) => {
  const newItem = {
    id: Date.now(),
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    // Valores por defecto combinados con spread
    name: '',
    description: '',
    category: 'other',
    priority: 'medium',
    amount: 0,
    yield: 0,
    ...itemData 
  };

  const newItems = [...items, newItem];
  saveItems(newItems);
  return newItems;
};

// ============================================
// TODO 4: CRUD - ACTUALIZAR
// ============================================
const updateItem = (id, updates) => {
  const updatedItems = items.map(item =>
    item.id === id
      ? { ...item, ...updates, updatedAt: new Date().toISOString() }
      : item
  );
  saveItems(updatedItems);
  return updatedItems;
};

// ============================================
// TODO 5: CRUD - ELIMINAR
// ============================================
const deleteItem = id => {
  const filteredItems = items.filter(item => item.id !== id);
  saveItems(filteredItems);
  return filteredItems;
};

// ============================================
// TODO 6: CRUD - TOGGLE ACTIVO
// ============================================
const toggleItemActive = id => {
  const updatedItems = items.map(item =>
    item.id === id
      ? { ...item, active: !item.active, updatedAt: new Date().toISOString() }
      : item
  );
  saveItems(updatedItems);
  return updatedItems;
};

const clearInactive = () => {
  const activeItems = items.filter(item => item.active);
  saveItems(activeItems);
  return activeItems;
};

// ============================================
// TODO 7: FILTROS Y BÚSQUEDA
// ============================================
const applyFilters = (itemsToFilter, filters = {}) => {
  const { status = 'all', category = 'all', priority = 'all', search = '' } = filters;

  return itemsToFilter
    .filter(item => {
      if (status === 'active') return item.active;
      if (status === 'inactive') return !item.active;
      return true;
    })
    .filter(item => (category === 'all' ? true : item.category === category))
    .filter(item => (priority === 'all' ? true : item.priority === priority))
    .filter(item => {
      const term = search.toLowerCase();
      return item.name.toLowerCase().includes(term) || 
             (item.description ?? '').toLowerCase().includes(term);
    });
};

// ============================================
// TODO 8: ESTADÍSTICAS (Uso de Reduce)
// ============================================
const getStats = (itemsToAnalyze = []) => {
  return itemsToAnalyze.reduce((acc, item) => {
    acc.total++;
    item.active ? acc.active++ : acc.inactive++;
    
    // Conteo por categoría
    acc.byCategory[item.category] = (acc.byCategory[item.category] ?? 0) + 1;
    
    // Suma de capital total (Plus extra para FinTech)
    acc.totalCapital += Number(item.amount || 0);
    
    return acc;
  }, { total: 0, active: 0, inactive: 0, byCategory: {}, totalCapital: 0 });
};

// ============================================
// TODO 9 & 10: RENDERIZADO
// ============================================
const getCategoryEmoji = category => CATEGORIES[category]?.emoji ?? '📌';

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
};

const renderItem = item => {
  const { id, name, amount, yield: yld, category, priority, active, createdAt } = item;
  
  return `
    <div class="task-item ${active ? '' : 'inactive'} priority-${priority}" data-item-id="${id}">
      <input type="checkbox" class="task-checkbox" ${active ? 'checked' : ''}>
      <div class="task-content">
        <h3>${name} <span class="item-amount">$${Number(amount).toLocaleString()}</span></h3>
        <div class="task-meta">
          <span class="task-badge badge-category">${getCategoryEmoji(category)} ${CATEGORIES[category]?.name}</span>
          <span class="task-badge badge-priority priority-${priority}">${PRIORITIES[priority].name}</span>
          <span class="task-date">📈 Retorno: ${yld}% | 📅 ${formatDate(createdAt)}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-edit" title="Editar">✏️</button>
        <button class="btn-delete" title="Eliminar">🗑️</button>
      </div>
    </div>
  `;
};

const renderItems = itemsToRender => {
  const itemList = document.getElementById('item-list');
  const emptyState = document.getElementById('empty-state');

  if (itemsToRender.length === 0) {
    itemList.innerHTML = '';
    emptyState.classList.add('show');
  } else {
    emptyState.classList.remove('show');
    itemList.innerHTML = itemsToRender.map(renderItem).join('');
  }
};

const renderStats = stats => {
  document.getElementById('stat-total').textContent = stats.total;
  document.getElementById('stat-active').textContent = stats.active;
  document.getElementById('stat-inactive').textContent = stats.inactive;

  const statsDetails = document.getElementById('stats-details');
  const categorySummary = Object.entries(stats.byCategory)
    .map(([cat, count]) => `<div class="stat-card"><h4>${getCategoryEmoji(cat)} ${cat}</h4><p>${count}</p></div>`)
    .join('');
  
  // Añadimos el capital total como una card extra
  statsDetails.innerHTML = `
    <div class="stat-card"><h4>💰 Capital Total</h4><p>$${stats.totalCapital.toLocaleString()}</p></div>
    ${categorySummary}
  `;
};

// ============================================
// TODO 11: EVENT HANDLERS
// ============================================
const handleFormSubmit = e => {
  e.preventDefault();

  const itemData = {
    name: document.getElementById('item-name').value.trim(),
    description: document.getElementById('item-description').value.trim(),
    category: document.getElementById('item-category').value,
    priority: document.getElementById('item-priority').value,
    amount: document.getElementById('item-amount').value,
    yield: document.getElementById('item-yield').value
  };

  if (!itemData.name) return alert('El nombre del activo es requerido');

  items = editingItemId 
    ? updateItem(editingItemId, itemData)
    : createItem(itemData);

  resetForm();
  updateUI();
};

const handleItemEdit = itemId => {
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('item-name').value = item.name;
  document.getElementById('item-description').value = item.description;
  document.getElementById('item-category').value = item.category;
  document.getElementById('item-priority').value = item.priority;
  document.getElementById('item-amount').value = item.amount;
  document.getElementById('item-yield').value = item.yield;

  document.getElementById('form-title').textContent = '✏️ Editar Activo';
  document.getElementById('submit-btn').textContent = 'Actualizar';
  document.getElementById('cancel-btn').style.display = 'inline-block';
  editingItemId = itemId;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const updateUI = () => {
  const filters = {
    status: document.getElementById('filter-status').value,
    category: document.getElementById('filter-category').value,
    priority: document.getElementById('filter-priority').value,
    search: document.getElementById('search-input').value
  };
  
  const filtered = applyFilters(items, filters);
  renderItems(filtered);
  renderStats(getStats(items));
};

const resetForm = () => {
  document.getElementById('item-form').reset();
  document.getElementById('form-title').textContent = '➕ Registrar Nuevo Activo';
  document.getElementById('submit-btn').textContent = 'Registrar';
  document.getElementById('cancel-btn').style.display = 'none';
  editingItemId = null;
};

// ============================================
// TODO 12: EVENT LISTENERS
// ============================================
const attachEventListeners = () => {
  document.getElementById('item-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('cancel-btn').addEventListener('click', resetForm);
  
  ['filter-status', 'filter-category', 'filter-priority'].forEach(id => {
    document.getElementById(id).addEventListener('change', updateUI);
  });
  
  document.getElementById('search-input').addEventListener('input', updateUI);

  document.getElementById('clear-inactive').addEventListener('click', () => {
    if (confirm('¿Eliminar activos liquidados/pausados?')) {
      items = clearInactive();
      updateUI();
    }
  });

  document.getElementById('item-list').addEventListener('click', e => {
    const card = e.target.closest('.task-item');
    if (!card) return;
    const id = parseInt(card.dataset.itemId);

    if (e.target.classList.contains('task-checkbox')) toggleItemActive(id), updateUI();
    else if (e.target.classList.contains('btn-edit')) handleItemEdit(id);
    else if (e.target.classList.contains('btn-delete')) {
      if(confirm('¿Eliminar este registro financiero?')) items = deleteItem(id), updateUI();
    }
  });
};

// ============================================
// INICIALIZACIÓN
// ============================================
const init = () => {
  items = loadItems();
  updateUI();
  attachEventListeners();
  console.log('✅ FinTech Manager listo.');
};

document.addEventListener('DOMContentLoaded', init);