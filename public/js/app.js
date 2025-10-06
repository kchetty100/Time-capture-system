// REVERSIDE Time Tracker - Client-side JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Auto-hide alerts after 5 seconds
    autoHideAlerts();
    
    // Initialize form validations
    initializeFormValidations();
    
    // Initialize interactive elements
    initializeInteractiveElements();
}

function autoHideAlerts() {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
}

function initializeFormValidations() {
    // Real-time form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remove existing error styling
    clearFieldError(event);
    
    // Validate based on field type
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    if (field.type === 'number' && value) {
        const num = parseFloat(value);
        const min = parseFloat(field.getAttribute('min'));
        const max = parseFloat(field.getAttribute('max'));
        
        if (isNaN(num)) {
            showFieldError(field, 'Please enter a valid number');
            return false;
        }
        
        if (min !== null && num < min) {
            showFieldError(field, `Value must be at least ${min}`);
            return false;
        }
        
        if (max !== null && num > max) {
            showFieldError(field, `Value must be no more than ${max}`);
            return false;
        }
    }
    
    return true;
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');
    const errorMsg = field.parentNode.querySelector('.form-error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initializeInteractiveElements() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize confirmations
    initializeConfirmations();
    
    // Initialize loading states
    initializeLoadingStates();
}

function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(event) {
    const element = event.target;
    const tooltipText = element.getAttribute('data-tooltip');
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = tooltipText;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--dark-gray);
        color: var(--white);
        padding: 0.5rem;
        border-radius: var(--border-radius);
        font-size: 0.75rem;
        z-index: 1000;
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function initializeConfirmations() {
    const confirmButtons = document.querySelectorAll('[data-confirm]');
    confirmButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                event.preventDefault();
            }
        });
    });
}

function initializeLoadingStates() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                showLoadingState(submitBtn);
            }
        });
    });
}

function showLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
    
    // Re-enable after 10 seconds as fallback
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 10000);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

// API helper functions
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, mergedOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        ${message}
    `;
    
    // Add to page
    const container = document.querySelector('.main .container') || document.body;
    container.insertBefore(notification, container.firstChild);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Table utilities
function sortTable(table, columnIndex, ascending = true) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aVal = a.cells[columnIndex].textContent.trim();
        const bVal = b.cells[columnIndex].textContent.trim();
        
        // Try to parse as numbers
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return ascending ? aNum - bNum : bNum - aNum;
        }
        
        // Sort as strings
        return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    
    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Search functionality
function initializeSearch(inputSelector, tableSelector) {
    const searchInput = document.querySelector(inputSelector);
    const table = document.querySelector(tableSelector);
    
    if (!searchInput || !table) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Export functions for global use
window.ReversideApp = {
    showNotification,
    formatDate,
    formatDateTime,
    formatCurrency,
    formatNumber,
    apiRequest,
    sortTable,
    initializeSearch
};
