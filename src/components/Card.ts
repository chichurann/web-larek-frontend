import { ICard, IActions, CategoryType } from '../types';
import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { categorySettings } from '../utils/constants';

export class Card extends Component<ICard> {
	protected _imageElement?: HTMLImageElement;
	protected _titleElement: HTMLElement;
	protected _priceElement: HTMLElement;
	protected _categoryElement?: HTMLElement;
	protected _buttonElement?: HTMLButtonElement;
	protected _descriptionElement?: HTMLElement;
	protected _itemIndex: HTMLElement;
	protected _removeButton: HTMLButtonElement;
	protected _buttonTitle: string;

	constructor(container: HTMLElement, actions?: IActions) {
		super(container);
		this._titleElement = ensureElement<HTMLElement>('.card__title', container);
		this._priceElement = ensureElement<HTMLElement>('.card__price', container);
		this._categoryElement = container.querySelector('.card__category');
		this._imageElement = container.querySelector('.card__image');
		this._buttonElement = container.querySelector('.card__button');
		this._descriptionElement = container.querySelector(`.card__text`);
		this._itemIndex = container.querySelector('.basket__item-index');
		this._removeButton = container.querySelector('.basket__item-delete');

		if (actions?.onClick) {
			if (this._buttonElement) {
				this._buttonElement.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._titleElement, value);
	}

	get title(): string {
		return this._titleElement.textContent || '';
	}

	set price(value: number | null) {
		if (value !== null) {
			this.setText(this._priceElement, `${value.toString()} синапсов`);
		} else {
			this.setText(this._priceElement, 'Бесценно');
		}

		if (this._buttonElement && !value) {
			this._buttonElement.disabled = true;
		}
	}

	set category(value: CategoryType) {
		this.setText(this._categoryElement, value);
		this._categoryElement.classList.add(categorySettings[value]);
	}

	set image(value: string) {
		this.setImage(this._imageElement, value, this.title);
	}

	set description(value: string) {
		this.setText(this._descriptionElement, value);
	}

	set index(value: number) {
		this.setText(this._itemIndex, `${value.toString()}`);
	}

	set buttonTitle(value: string) {
		if (this._buttonElement) {
			this.setText(this._buttonElement, value);
		}
	}
}
