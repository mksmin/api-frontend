

document.addEventListener('DOMContentLoaded', () => {

    window.elements = {
        statusBlock: document.getElementById('statusBlock')
    };

    window.hideResult = () => {
        console.log('Скрываем результат!');

        if (!elements?.statusBlock) {
            console.error('Элемент statusBlock не найден!');
            return;
        };

        setTimeout(function() {
            if (!elements.statusBlock) return;

            elements.statusBlock.classList.add('fade-out');

            elements.statusBlock.addEventListener('transitionend', function() {
                this.style.transition = 'transform 0.5s ease';
                this.style.transform = 'scale(0) ';

                this.addEventListener('transitionend', function() {
                    this.remove();
                    window.elements.statusBlock = null;
                }, { once: true });
            });
        }, 5000);
    };


});

