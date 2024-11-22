import { Component } from './base/Component';
import { createElement, ensureElement } from './../utils/utils';
import { EventEmitter } from './base/events';

interface IBasketDetails {
	products: HTMLElement[];
	totalAmount: number;
	selectedIds: string[];
}

export class Basket extends Component<IBasketDetails> {
	protected _list: HTMLElement;
	protected _amount: HTMLElement;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._amount = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:openForm');
			});
		}

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
			this.setDisabled(this._button, false);  
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this.setDisabled(this._button, true); 
		}
	}

	set selected(items: string[]) {
		this.setDisabled(this._button, items.length === 0);
	}

	set sum(amount: number) {
		this.setText(this._amount, `${amount} синапсов`);
	}
}