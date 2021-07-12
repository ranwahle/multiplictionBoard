import './guess-component.js';

const ProgressInterval = 10000;

export class MultiplictionBoard extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    guessFocus = () => {
        if (this.startTime) {
            return;
        }
        this.startTime = Date.now();
        setTimeout(this.sendProgress, ProgressInterval);
    }

    sendProgress = async () => {
        const progress = {
            time: Date.now() - this.startTime, progress: this.querySelector('progress').value
                / this.guesses
        };

        const response = await fetch('/api/progress', {
            method: 'post',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(progress)
        });

        const progressList = await response.json();

        console.log(progressList);

        if (progress !== 1) {
            setTimeout(this.sendProgress, ProgressInterval);
        }
    }

    answer = (evt) => {
        const { isRight } = evt.detail;
        const { target } = evt;
        const cell = target.parentNode;

        if (isRight) {
            cell.classList.add('right');
            cell.classList.remove('wrong');
            cell.innerText = target.row * target.col;
            this.querySelector('progress').value++;
            if (this.querySelector('progress').value === this.guesses) {
                this.dispatchEvent(new CustomEvent('play-all-success'));
            } else {
                this.dispatchEvent(new CustomEvent('play-success'))
            }
        } else {
            cell.classList.add('wrong');
            cell.classList.remove('right');
            this.dispatchEvent(new CustomEvent('play-mistake'))
        }
    }

    renderCell(row, col) {
        const random = Math.round(Math.random() * 2);
        if (random % 2 === 0 || row === 0 || col === 0) {
            return `${(row + 1) * (col + 1)}`;
        }
        this.guesses++;
        return `<guess-component col="${col + 1}" row="${row + 1}"></guess-component>`;
    }
    cells() {
        let result = '';
        for (let rows = 0; rows < 10; rows++) {
            result += `<div class="row">`;
            for (let cols = 0; cols < 10; cols++) {
                result += `<div class="cell">${this.renderCell(rows, cols)}</div>`
            }
            result += `</div>`;

        }
        return result;
    }



    render() {
        this.guesses = 0;
        this.innerHTML = `<div>
            ${this.cells()}
            <progress max="${this.guesses}" value="0"></progress>
</div>

`
        this.querySelectorAll('guess-component').forEach(item => {
            item.addEventListener('answer', this.answer);
            item.addEventListener('guessFocus', this.guessFocus);
        })
    }

}

customElements.define('multipliction-board', MultiplictionBoard);
