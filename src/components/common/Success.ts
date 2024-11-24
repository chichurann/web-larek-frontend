import { ISuccess, ISuccessHandler } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';

export class Success extends Component<ISuccess> {
	protected close: HTMLElement;
	protected _success_description: HTMLElement;

	constructor(container: HTMLElement, actions: ISuccessHandler) {
		super(container);
		this._success_description = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this.close = ensureElement<HTMLElement>(
			'.order-success__close',
			this.container
		);

		if (actions.onClick) {
			this.close.addEventListener('click', actions.onClick);
		}
	}

	set total(total: string) {
		this.setText(this._success_description, `Списано ${total} синапсов`);
	}
}
