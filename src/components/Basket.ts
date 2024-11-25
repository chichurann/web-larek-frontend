import { Component } from './base/Component';
import { createElement, ensureElement } from './../utils/utils';
import { EventEmitter } from './base/events';
import { IProductItem } from '../types';

export class Basket extends Component<IProductItem[]> {
	protected _list: HTMLElement;
	protected _amount: HTMLElement;
	protected _button: HTMLButtonElement;

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
		this.toggleButton(true);
	}

	toggleButton(isDisabled: boolean) {
		this.setDisabled(this._button, isDisabled);
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}

	set sum(amount: number) {
		this.setText(this._amount, `${amount.toString()} синапсов`);
	}
}
