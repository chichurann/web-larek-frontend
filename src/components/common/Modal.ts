import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

interface IModalData {
	content: HTMLElement;
}

export class Modal extends Component<IModalData> {
	private modalContent: HTMLElement;
	private closeButton: HTMLButtonElement;

	constructor(container: HTMLElement, private events: IEvents) {
		super(container);

		this.modalContent = ensureElement<HTMLElement>('.modal__content', container);
		this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);

		this._initializeEventListeners();
	}

	private _initializeEventListeners() {
		this.container.addEventListener('click', this.closeModal.bind(this));
		this.closeButton.addEventListener('click', this.closeModal.bind(this));
		this.modalContent.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement) {
		this.modalContent.replaceChildren(value);
	}

	openModal() {
		this.events.emit('modal:open');
		this.container.classList.add('modal_active');
	}

	closeModal() {
		this.content = null;
		this.container.classList.remove('modal_active');
		this.events.emit('modal:close');
	}

	render(data: IModalData): HTMLElement {
		this.openModal();
		super.render(data);

		return this.container;
	}
}
