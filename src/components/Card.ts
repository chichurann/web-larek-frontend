import { IProductItem } from '../types';
import { CategoryType } from '../types';
import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';
import { CDN_URL, SETTINGS } from '../utils/constants';

export interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProductItem> {
	protected _imageElement?: HTMLImageElement;
	protected _titleElement: HTMLElement;
	protected _descriptionElement: HTMLElement;
	protected _priceElement: HTMLElement;
	protected _categoryElement: HTMLElement;
	protected _buttonElement?: HTMLButtonElement;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);
		this._initializeCardElements(blockName, container, actions);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this._titleElement.textContent = value;
	}

	get title(): string {
		return this._titleElement.textContent || '';
	}

	set image(value: string) {
		if (this._imageElement) {
			this._imageElement.src = `${CDN_URL}${value}`;
		}
	}

	set price(value: number | null) {
		this._updateCardPrice(value);
	}

	set disabled(value: boolean) {
		if (this._buttonElement) {
			this._buttonElement.disabled = value;
		}
	}

	set button(value: string) {
		if (this._buttonElement) {
			this._buttonElement.textContent =
				value === 'addToBasket' ? 'Добавить в корзину' : 'Убрать из корзины';
		}
	}

	set category(value: CategoryType) {
		this._categoryElement.textContent = value;
		this._categoryElement.classList.add(SETTINGS.categorySettings[value]);
	}

	private _initializeCardElements(
		blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		this._titleElement = container.querySelector(`.${blockName}__title`);
		this._imageElement = container.querySelector(`.${blockName}__image`);
		this._categoryElement = container.querySelector(`.${blockName}__category`);
		this._priceElement = container.querySelector(`.${blockName}__price`);
		this._buttonElement = container.querySelector(`.${blockName}__button`);

		if (actions?.onClick) {
			this._setupClickListener(container, this._buttonElement, actions.onClick);
		}
	}

	private _setupClickListener(
		container: HTMLElement,
		button: HTMLButtonElement | undefined,
		onClick: (event: MouseEvent) => void
	) {
		if (button) {
			button.addEventListener('click', onClick);
		} else {
			container.addEventListener('click', onClick);
		}
	}

	private _updateCardPrice(value: number | null) {
		if (value !== null) {
			this._priceElement.textContent = `${formatCardPrice(value)} синапсов`;
		} else {
			this._priceElement.textContent = 'Бесценно';
		}

		if (this._buttonElement && !value) {
			this._buttonElement.disabled = true;
		}
	}
}

function formatCardPrice(value: number): string {
	return `${value}`;
}

export class ProductItemPreview extends Card {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this._descriptionElement = container.querySelector(`.${this.blockName}__text`);
	}

	set description(value: string) {
		this._descriptionElement.textContent = value;
	}
}

export class ProductItem extends Card {
	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this._descriptionElement = container.querySelector(`.${this.blockName}__text`);
	}

	set description(value: string) {
		this._descriptionElement.textContent = value;
	}
}

export class BasketCard extends Card {
	protected _itemTitle: HTMLElement;
	protected _itemIndex: HTMLElement;
	protected _removeButton: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		this._itemIndex = ensureElement<HTMLElement>('.basket__item-index', container);
		this._removeButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);

		if (actions && actions.onClick) {
			this._removeButton.addEventListener('click', actions.onClick);
		}
	}

	set index(value: number) {
		this._itemIndex.textContent = `${value}`;
	}
}