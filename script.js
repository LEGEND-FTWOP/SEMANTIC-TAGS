/**
 * ==========================================================================
 * Single-Page Portfolio & Task Manager — Vanilla JavaScript
 * Features:
 *  1. Light/Dark Theme Switcher (with localStorage & system preference)
 *  2. Scroll-Spy Navigation (highlights active section on scroll)
 *  3. Interactive To-Do List (Full CRUD, localStorage, filters, delegation)
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. Theme Switcher (Runs immediately to prevent theme flash)
// --------------------------------------------------------------------------
(function () {
    const savedTheme = localStorage.getItem('site-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', initialTheme);

    window.addEventListener('DOMContentLoaded', () => {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        function updateIcon(theme) {
            const icon = toggleBtn.querySelector('.theme-icon') || toggleBtn;
            if (theme === 'dark') {
                icon.textContent = '☀️';
                toggleBtn.setAttribute('title', 'Switch to Light Mode');
                toggleBtn.setAttribute('aria-label', 'Switch to Light Mode');
            } else {
                icon.textContent = '🌙';
                toggleBtn.setAttribute('title', 'Switch to Dark Mode');
                toggleBtn.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        }

        updateIcon(initialTheme);

        toggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('site-theme', nextTheme);
            updateIcon(nextTheme);
        });
    });
})();

// --------------------------------------------------------------------------
// 2. DOM Ready Logic
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // A. Active Navigation Link on Scroll (Scroll-Spy)
    // ----------------------------------------------------------------------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    function updateActiveNav() {
        const scrollPosition = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${id}` || (id === 'hero' && href === '#top')) {
                        link.setAttribute('aria-current', 'page');
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // ----------------------------------------------------------------------
    // B. Interactive To-Do List Application
    // ----------------------------------------------------------------------
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const itemsCount = document.getElementById('items-left-count');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const emptyMessage = document.getElementById('empty-state-message');

    if (!taskForm || !taskList) return;

    // Load tasks from localStorage or seed initial tasks
    const STORAGE_KEY = 'portfolio_tasks';
    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
        { id: 1, text: 'Review CSS Grid & Flexbox layouts', completed: true },
        { id: 2, text: 'Test light/dark mode theme switch', completed: true },
        { id: 3, text: 'Prepare notes for internship evaluation', completed: false }
    ];

    let currentFilter = 'all'; // 'all' | 'active' | 'completed'

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function renderTasks() {
        // Filter tasks
        let visibleTasks = tasks;
        if (currentFilter === 'active') {
            visibleTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            visibleTasks = tasks.filter(t => t.completed);
        }

        // Clear existing DOM
        taskList.innerHTML = '';

        // Empty state check
        if (visibleTasks.length === 0) {
            if (emptyMessage) {
                emptyMessage.style.display = 'block';
                emptyMessage.textContent = tasks.length === 0 ? 'No tasks on your list! Add one above.' : 'No matching tasks.';
            }
        } else if (emptyMessage) {
            emptyMessage.style.display = 'none';
        }

        // Dynamically build elements
        visibleTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);

            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'todo-checkbox';
            checkbox.checked = task.completed;
            checkbox.setAttribute('data-action', 'toggle');
            checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`);

            // Text
            const span = document.createElement('span');
            span.className = 'todo-text';
            span.textContent = task.text;
            span.title = 'Double-click to edit';
            span.setAttribute('data-action', 'edit');

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn-icon btn-delete';
            deleteBtn.setAttribute('data-action', 'delete');
            deleteBtn.setAttribute('title', 'Delete task');
            deleteBtn.setAttribute('aria-label', `Delete "${task.text}"`);
            deleteBtn.innerHTML = '🗑️';

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);

            taskList.appendChild(li);
        });

        // Update items left counter
        if (itemsCount) {
            const activeCount = tasks.filter(t => !t.completed).length;
            itemsCount.textContent = `${activeCount} item${activeCount === 1 ? '' : 's'} left`;
        }

        // Update Clear Completed button visibility
        if (clearCompletedBtn) {
            const completedCount = tasks.filter(t => t.completed).length;
            clearCompletedBtn.style.visibility = completedCount > 0 ? 'visible' : 'hidden';
            clearCompletedBtn.textContent = `Clear completed (${completedCount})`;
        }

        // Update active filter button state
        filterButtons.forEach(btn => {
            const isActive = btn.dataset.filter === currentFilter;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    // 1. CREATE: Add new task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;

        tasks.push({
            id: Date.now(),
            text: text,
            completed: false
        });

        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
    });

    // 2. UPDATE & DELETE: Delegated click listener on parent <ul>
    taskList.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const action = actionBtn.dataset.action;
        const li = actionBtn.closest('.todo-item');
        if (!li) return;

        const taskId = Number(li.dataset.id);

        if (action === 'toggle') {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
            }
        } else if (action === 'delete') {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }
    });

    // 3. UPDATE: Inline double-click to edit text
    taskList.addEventListener('dblclick', (e) => {
        const textSpan = e.target.closest('.todo-text');
        if (!textSpan) return;

        const li = textSpan.closest('.todo-item');
        const taskId = Number(li.dataset.id);
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'inline-edit-input';
        input.value = task.text;

        textSpan.replaceWith(input);
        input.focus();

        let finished = false;

        function finishEdit() {
            if (finished) return;
            finished = true;
            const newText = input.value.trim();
            if (newText) {
                task.text = newText;
            } else {
                tasks = tasks.filter(t => t.id !== taskId);
            }
            saveTasks();
            renderTasks();
        }

        input.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') finishEdit();
            if (evt.key === 'Escape') {
                finished = true;
                renderTasks();
            }
        });

        input.addEventListener('blur', finishEdit);
    });

    // 4. FILTER: Tab switching
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // 5. BULK DELETE: Clear completed
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', () => {
            tasks = tasks.filter(t => !t.completed);
            saveTasks();
            renderTasks();
        });
    }

    // Initial load
    renderTasks();
});
