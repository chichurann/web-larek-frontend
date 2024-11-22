import { PaymentDetailsForm, ContactDetailsForm } from '.././types';
import { Form } from './common/Form';
import { IEvents } from './base/events';

export class Order extends Form<PaymentDetailsForm> {
	protected buttonOnline: HTMLButtonElement;
	protected buttonCash: HTMLButtonElement;
	protected _address: HTMLInputElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container, events);

		this.buttonOnline = container.elements.namedItem(
			'card'
		) as HTMLButtonElement;
		this.buttonCash = container.elements.namedItem('cash') as HTMLButtonElement;

		if (this.buttonOnline) {
			this.buttonOnline.addEventListener('click', () => {
				events.emit(`order:formUpdated`, {
					button: this.buttonOnline,
					payment: this.buttonOnline.name,
				});
			});
		}

		if (this.buttonCash) {
			this.buttonCash.addEventListener('click', () => {
				events.emit(`order:formUpdated`, {
					button: this.buttonCash,
					payment: this.buttonCash.name,
				});
			});
		}

		this._address = container.elements.namedItem('address') as HTMLInputElement;
	}

	set address(value: string) {
		const addressInput = this.container.elements.namedItem(
			'address'
		) as HTMLInputElement;
		if (addressInput) {
			addressInput.value = value;
		}
	}

	switchPaymentMethod(value: HTMLElement) {
		this.clearButtonState();
		this.toggleClass(value, 'button_alt-active', true);
	}

	clearButtonState() {
		this.toggleClass(this.buttonCash, 'button_alt-active', false);
		this.toggleClass(this.buttonOnline, 'button_alt-active', false);
	}
}

export class Contacts extends Form<ContactDetailsForm> {
	protected _phone: HTMLInputElement;
	protected _email: HTMLInputElement;
	constructor(protected container: HTMLFormElement, protected events: IEvents) {
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
