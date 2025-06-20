const API_BASE_URL = 'http://localhost:8082/component';

document.addEventListener('DOMContentLoaded', () => {
    // Инициализация элементов
    const homePage = document.getElementById('homePage');
    const componentPage = document.getElementById('componentPage');
    const adminPage = document.getElementById('adminPage');
    const homeLink = document.getElementById('homeLink');
    const adminLink = document.getElementById('adminLink');
    const backButton = document.getElementById('backButton');
    const componentsGrid = document.getElementById('componentsGrid');
    const componentDetail = document.getElementById('componentDetail');
    const addComponentForm = document.getElementById('addComponentForm');
    const refreshComponentsBtn = document.getElementById('refreshComponents');
    const adminComponentsList = document.getElementById('adminComponentsList');
    const componentSearch = document.getElementById('componentSearch');
    const categoryTags = document.querySelectorAll('.category-tag');

    // Навигация
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('homePage');
        loadComponents();
    });
    
    adminLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('adminPage');
        loadAdminComponents();
    });
    
    backButton.addEventListener('click', () => showPage('homePage'));

    // Загрузка данных
    refreshComponentsBtn?.addEventListener('click', loadAdminComponents);
    addComponentForm?.addEventListener('submit', handleAddComponent);
    componentSearch?.addEventListener('input', (e) => searchComponents(e.target.value));

    // Обработка категорий
    categoryTags.forEach(tag => {
        tag.addEventListener('click', () => {
            categoryTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            filterComponentsByCategory(tag.textContent.trim());
        });
    });

    // Инициализация
    showPage('homePage');
    loadComponents();
});

// Функции
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

async function loadComponents() {
    try {
        const response = await fetch(API_BASE_URL);
        const components = await response.json();
        displayComponents(components);
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Не удалось загрузить каталог комплектующих');
    }
}

async function searchComponents(query) {
    if (!query || query.length < 2) {
        loadComponents();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
        const components = await response.json();
        displayComponents(components);
    } catch (error) {
        console.error('Ошибка поиска:', error);
    }
}

function filterComponentsByCategory(category) {
    if (category === 'Все') {
        loadComponents();
        return;
    }
    
    const typeMap = {
        'Процессоры': 'PROCESSOR',
        'Видеокарты': 'GPU',
        'Накопители': 'STORAGE',
        'Память': 'RAM',
        'Охлаждение': 'COOLING',
        'Материнские платы': 'MOTHERBOARD',
        'Блоки питания': 'POWER',
        'Корпуса': 'CASE'
    };
    
    const type = typeMap[category];
    if (!type) return;
    
    const componentsGrid = document.getElementById('componentsGrid');
    const componentCards = componentsGrid.querySelectorAll('.component-card');
    
    componentCards.forEach(card => {
        const componentType = card.getAttribute('data-type');
        if (componentType === type) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function displayComponents(components) {
    const grid = document.getElementById('componentsGrid');
    grid.innerHTML = '';
    
    if (!components?.length) {
        grid.innerHTML = '<p>Комплектующие не найдены</p>';
        return;
    }
    
    components.forEach(component => {
        const componentData = parseComponentData(component);
        
        const card = document.createElement('div');
        card.className = 'component-card';
        card.setAttribute('data-type', component.type);
        card.innerHTML = `
            <div class="component-image" style="background-image: url('${component.imageUrl || 'default-component.png'}')"></div>
            <div class="component-info">
                <h3>${component.name}</h3>
                <span class="component-type">${getTypeName(component.type)}</span>
                <p class="component-price">${componentData.price}</p>
            </div>
        `;
        card.addEventListener('click', () => showComponentDetail(component.id));
        grid.appendChild(card);
    });
}

function parseComponentData(component) {
    // Извлекаем цену из specs
    const priceMatch = component.specs?.match(/Цена:\s*(\d+)/);
    const price = priceMatch ? `${priceMatch[1]}₽` : '—';
    
    return { price };
}

function getTypeName(type) {
    const types = {
        'PROCESSOR': 'Процессор',
        'GPU': 'Видеокарта',
        'STORAGE': 'Накопитель',
        'RAM': 'Память',
        'COOLING': 'Охлаждение',
        'MOTHERBOARD': 'Материнская плата',
        'POWER': 'Блок питания',
        'CASE': 'Корпус'
    };
    return types[type] || type;
}

async function showComponentDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const component = await response.json();
        
        if (!component) throw new Error('Комплектующее не найдено');
        renderComponentDetail(component);
        showPage('componentPage');
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить информацию о комплектующем');
    }
}

function renderComponentDetail(component) {
    const detail = document.getElementById('componentDetail');
    const componentData = parseComponentData(component);
    
    detail.innerHTML = `
        <div class="detail-header">
            <div class="detail-image" style="background-image: url('${component.imageUrl || 'default-component.png'}')"></div>
            <div class="detail-title">
                <h2>${component.name}</h2>
                <div class="detail-meta">
                    <span class="component-type">${getTypeName(component.type)}</span>
                </div>
                <div class="detail-price">${componentData.price}</div>
                
                <h3>Описание:</h3>
                <p>${component.description || 'Нет описания'}</p>
                
                <h3>Характеристики:</h3>
                <ul class="component-specs">
                    ${component.specs?.split('\n').map(spec => spec.trim() ? `<li>${spec}</li>` : '').join('') || '<li>Нет характеристик</li>'}
                </ul>
            </div>
        </div>
    `;
}

async function loadAdminComponents() {
    try {
        const response = await fetch(API_BASE_URL);
        const components = await response.json();
        displayAdminComponents(components);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить каталог');
    }
}

function displayAdminComponents(components) {
    const list = document.getElementById('adminComponentsList');
    list.innerHTML = '';
    
    if (!components?.length) {
        list.innerHTML = '<p>Нет комплектующих в каталоге</p>';
        return;
    }
    
    components.forEach(component => {
        const componentData = parseComponentData(component);
        
        const item = document.createElement('div');
        item.className = 'admin-component-item';
        item.innerHTML = `
            <div>
                <h4>${component.name}</h4>
                <small>${getTypeName(component.type)} • ${componentData.price}</small>
            </div>
            <div class="admin-component-actions">
                <button class="edit-btn" data-id="${component.id}">Изменить</button>
                <button class="delete-btn" data-id="${component.id}">Удалить</button>
            </div>
        `;
        list.appendChild(item);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deleteComponent(e.target.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            editComponent(e.target.getAttribute('data-id'));
        });
    });
}

async function handleAddComponent(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        name: form.componentName.value.trim(),
        type: form.componentType.value,
        description: form.componentDesc.value,
        specs: `Цена: ${form.componentPrice.value}₽\n${form.componentSpecs.value}`.trim(),
        imageUrl: form.componentImage.value || "default-component.png"
    };
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Ошибка сервера');
        
        await response.json();
        alert(`Комплектующее "${form.componentName.value}" добавлено в каталог!`);
        form.reset();
        loadAdminComponents();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при добавлении: ' + error.message);
    }
}

async function deleteComponent(id) {
    if (!confirm('Вы уверены, что хотите удалить это комплектующее?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Ошибка при удалении');
        
        alert('Комплектующее успешно удалено');
        loadAdminComponents();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при удалении: ' + error.message);
    }
}

async function editComponent(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const component = await response.json();
        
        if (!component) throw new Error('Комплектующее не найдено');
        
        const componentData = parseComponentData(component);
        const priceMatch = component.specs?.match(/Цена:\s*(\d+)/);
        const specs = component.specs?.replace(/Цена:\s*\d+₽?\n?/, '').trim();
        
        const form = document.getElementById('addComponentForm');
        
        // Заполняем форму редактирования
        form.componentName.value = component.name;
        form.componentType.value = component.type;
        form.componentPrice.value = priceMatch?.[1] || '';
        form.componentDesc.value = component.description || '';
        form.componentSpecs.value = specs || '';
        form.componentImage.value = component.imageUrl || '';
        
        // Прокручиваем к форме
        form.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при загрузке данных комплектующего: ' + error.message);
    }
}