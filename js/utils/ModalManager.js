export default class ModalManager {
    constructor() {
        // We will pass references to Modals later, or retrieve them dynamically
    }

    openModal(modalId, titleId, titleText) {
        const modal = document.getElementById(modalId);
        const title = document.getElementById(titleId);
        if (title) {
            title.innerText = titleText;
        }
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId, formId) {
        const modal = document.getElementById(modalId);
        const form = document.getElementById(formId);
        if (modal) {
            modal.style.display = 'none';
        }
        if (form) {
            form.reset();
            const idField = form.querySelector('input[type="hidden"]');
            if(idField) idField.value = '';
        }
    }

    setupCloseListeners() {
        // Setup close buttons (.close class)
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    const form = modal.querySelector('form');
                    this.closeModal(modal.id, form ? form.id : null);
                }
            });
        });

        // Setup click outside modal content
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                const form = e.target.querySelector('form');
                this.closeModal(e.target.id, form ? form.id : null);
            }
        });
    }
}
