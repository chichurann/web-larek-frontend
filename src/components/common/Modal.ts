import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IModalData, IEvents } from '../../types';

export class Modal extends Component<IModalData> {
	private modalContent: HTMLElement;
	private closeButton: HTMLButtonElement;

	constructor(container: HTMLElement, private events: IEvents) {
		super(container);

		this.modalContent = ensureElement<HTMLElement>(
			'.modal__content',
			container
		);
		this.closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);

		this._initializeEventListeners();
	}

	private _initializeEventListeners() {
		this.container.addEventListener('click', this.closeModal.bind(this));
		this.closeButton.addEventListener('click', this.closeModal.bind(this));
		this.modalContent.addEventListener('click', (event) =>
			event.stopPropagation()
		);
	}

	set content(value: HTMLElement) {
		this.modalContent.replaceChildren(value);
	}

	openModal() {
		this.events.emit('modal:open');
		this.toggleClass(this.container, 'modal_active', true);
	}

	closeModal() {
		this.content = null;
		this.toggleClass(this.container, 'modal_active', false);
		this.events.emit('modal:close');
	}

	render(data: IModalData): HTMLElement {
		this.openModal();
		super.render(data);
		return this.container;
	}
}
