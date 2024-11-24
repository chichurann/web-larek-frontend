import {
	PaymentDetailsForm,
	ContactDetailsForm,
	IEvents,
	IActions,
} from '.././types';
import { Form } from './common/Form';
import { ensureElement } from '../utils/utils';

export class Order extends Form<PaymentDetailsForm> {
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

		this.buttonOnline.classList.add('button_alt-active');

		if (actions?.onClick) {
			this.buttonOnline.addEventListener('click', actions.onClick);
			this.buttonCash.addEventListener('click', actions.onClick);
		}
	}
	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	toggleButtons() {
		this.buttonOnline.classList.toggle('button_alt-active');
		this.buttonCash.classList.toggle('button_alt-active');
	}
}

export class Contacts extends Form<ContactDetailsForm> {
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
