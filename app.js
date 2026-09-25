document.addEventListener('DOMContentLoaded', () => {
    let expenses = JSON.parse(localStorage.getItem('spendwise_expenses')) || [];
    
    const expenseList = document.getElementById('expense-list');
    const totalAmountEl = document.getElementById('total-amount');
    const categorySummaryEl = document.getElementById('category-summary');
    const filterCategory = document.getElementById('filter-category');
    const modal = document.getElementById('modal-overlay');
    const expenseForm = document.getElementById('expense-form');
    const fabAdd = document.getElementById('fab-add');
    const btnCancel = document.getElementById('btn-cancel');
    const modalTitle = document.getElementById('modal-title');

    const saveToStorage = () => {
        localStorage.setItem('spendwise_expenses', JSON.stringify(expenses));
    };

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
    };

    const render = () => {
        const selectedFilter = filterCategory.value;
        const filtered = selectedFilter === 'All' 
            ? expenses 
            : expenses.filter(e => e.category === selectedFilter);

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        expenseList.innerHTML = '';
        let total = 0;

        filtered.forEach(exp => {
            total += parseFloat(exp.amount);
            const item = document.createElement('div');
            item.className = 'expense-item';
            item.innerHTML = `
                <div class="expense-info">
                    <span class="expense-desc">${exp.description}</span>
                    <span class="expense-meta">${exp.category} • ${exp.date}</span>
                </div>
                <div class="expense-amount-group">
                    <span class="expense-val">${formatCurrency(exp.amount)}</span>
                    <div class="item-actions">
                        <button class="btn-icon btn-edit" data-id="${exp.id}">Edit</button>
                        <button class="btn-icon btn-delete" data-id="${exp.id}">Delete</button>
                    </div>
                </div>
            `;
            expenseList.appendChild(item);
        });

        totalAmountEl.textContent = formatCurrency(total);
        updateSummary();
    };

    const updateSummary = () => {
        const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];
        categorySummaryEl.innerHTML = '';
        
        categories.forEach(cat => {
            const sum = expenses
                .filter(e => e.category === cat)
                .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
            
            if (sum > 0) {
                const div = document.createElement('div');
                div.className = 'summary-item';
                div.innerHTML = `${cat}<span>${formatCurrency(sum)}</span>`;
                categorySummaryEl.appendChild(div);
            }
        });
    };

    const openModal = (id = null) => {
        if (id) {
            const exp = expenses.find(e => e.id === id);
            modalTitle.textContent = 'Edit Expense';
            document.getElementById('edit-id').value = exp.id;
            document.getElementById('amount').value = exp.amount;
            document.getElementById('category').value = exp.category;
            document.getElementById('description').value = exp.description;
            document.getElementById('date').value = exp.date;
        } else {
            modalTitle.textContent = 'Add Expense';
            expenseForm.reset();
            document.getElementById('edit-id').value = '';
            document.getElementById('date').value = new Date().toISOString().split('T')[0];
        }
        modal.classList.remove('hidden');
    };

    const closeModal = () => {
        modal.classList.add('hidden');
    };

    fabAdd.addEventListener('click', () => openModal());
    btnCancel.addEventListener('click', closeModal);

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const data = {
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            date: document.getElementById('date').value,
        };

        if (id) {
            const index = expenses.findIndex(e => e.id === id);
            expenses[index] = { ...data, id };
        } else {
            expenses.push({ ...data, id: Date.now().toString() });
        }

        saveToStorage();
        closeModal();
        render();
    });

    expenseList.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains('btn-delete')) {
            expenses = expenses.filter(exp => exp.id !== id);
            saveToStorage();
            render();
        } else if (e.target.classList.contains('btn-edit')) {
            openModal(id);
        }
    });

    filterCategory.addEventListener('change', render);

    render();
});