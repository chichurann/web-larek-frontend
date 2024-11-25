import { IOrder, IContact, IEvents, IActions } from '.././types';
import { Form } from './common/Form';
import { PaymentMethods } from '../utils/constants';
import { ensureElement } from '../utils/utils';

export class Order extends Form<IOrder> {
	protected buttonOnline: HTMLButtonElement;
	protected buttonCash: HTMLButtonElement;

	constructor(container: HTMLFormElement, events: IEvents, actions?: IActions) {
		super(container, events);

		this.buttonOnline = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.container
		);
		this.buttonCash = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.container
		);

		if (actions?.onClick) {
			this.buttonOnline.addEventListener('click', actions.onClick);
			this.buttonCash.addEventListener('click', actions.onClick);
		}
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	toggleButtons(target: HTMLElement, value: string) {
		if (PaymentMethods[value] === PaymentMethods.card) {
			this.toggleClass(
				this.buttonOnline,
				'button_alt-active',
				!target.classList.contains('button_alt-active') ? true : false
			);
			this.toggleClass(this.buttonCash, 'button_alt-active', false);
		} else {
			this.toggleClass(
				this.buttonCash,
				'button_alt-active',
				!target.classList.contains('button_alt-active') ? true : false
			);
			this.toggleClass(this.buttonOnline, 'button_alt-active', false);
		}
	}

	disableButtons() {
		this.toggleClass(this.buttonCash, 'button_alt-active', false);
		this.toggleClass(this.buttonOnline, 'button_alt-active', false);
	}
}

export class Contacts extends Form<IContact> {
	protected _phone: HTMLInputElement;
	protected _email: HTMLInputElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
		this._phone = container.elements.namedItem('phone') as HTMLInputElement;
		this._email = container.elements.namedItem('email') as HTMLInputElement;
	}

	set phone(value: string) {
		this._phone.value = value;
	}

	set email(value: string) {
		this._email.value = value;
	}
}
