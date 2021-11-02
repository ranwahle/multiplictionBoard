export class GuessComponent extends HTMLElement {

    onChange = () => {
        const value = +this.inputElement.value;
        const isRight = value === (this.row * this.col);
        this.dispatchEvent(new CustomEvent('answer', {detail: {isRight}}));
    };

    connectedCallback() {
        this.render();
        this.setEventandlers();
    }

    static get observedAttribute() {
        return ['row', 'col']
    }

    get row() {
        return +this.attributes['row'].value
    }

    get col() {
        return +this.attributes['col'].value
    }
    get inputElement() {
        return this.querySelector('input')
    }

    onInputFocus = () => {
        this.dispatchEvent(new CustomEvent('guessFocus'));
    }


    setEventandlers() {
        this.inputElement.addEventListener('focus', this.onInputFocus);
        this.inputElement.addEventListener('change', this.onChange)
    }

    render() {
        this.innerHTML = `<label><div style="max-width: 0; max-height: 0; color: white; overflow: hidden">${this.row}X${this.col}</div><input type="number"></label>`
    }
}

customElements.define('guess-component', GuessComponent);
