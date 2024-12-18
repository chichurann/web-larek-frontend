# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

 
## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
# Архитектура

Парадигма: MVP (Model-View-Presenter)

Архитектура разделена на три основных слоя:
Model — содержит бизнес-логику и управление состоянием приложения (базовые классы).
View — отвечает за отображение данных и взаимодействие с пользователем.
Presenter — управляет взаимодействием между Model и View, обрабатывая пользовательские события и бизнес-логику. Слой Presenter не выносится в отдельные классы и будет реализован в файле index.ts.

## Слой данных (Model)
Назначение:
Хранение состояния приложения (каталог товаров, корзина, данные заказа).
Взаимодействие с API и выполнение бизнес-логики.

### Классы и описание:

#### Класс LarekAPI
Задача: Взаимодействие с API интернет-магазина для получения данных о товарах и отправки заказов.
Конструктор: принимает три параметра:

baseUrl (строка) — базовый URL для API.
headers (объект) — заголовки для запросов.
cdnUrl (строка) — URL для работы с изображениями.
Поля:

baseUrl — базовый URL.
headers — настройки заголовков.
cdnUrl — URL для CDN.

Методы:
getProductItem(id: string): Promise<IProductItem>
Возвращает информацию о товаре. Получает id (строка) и возвращает объект товара (IProductItem).
getProductList(): Promise<IProductItem[]>
Возвращает массив всех товаров (IProductItem[]).
orderProducts(order: IOrderInfo): Promise<IOrderResult>
Отправляет заказ на сервер, принимает объект заказа (IOrderInfo), возвращает результат (IOrderResult).


#### Класс AppState
Задача: Управление состоянием приложения (товары, корзина, данные заказа).
Конструктор: не принимает параметров.

Поля:
catalog (массив IProductItem) — товары в каталоге.
basket (массив IProductItem) — товары в корзине.
order (объект IOrderInfo) — информация о заказе.
formErrors (объект FormErrors) — ошибки валидации формы.

Методы:
clearBasket() — очищает корзину.
clearOrder() - очищает заказ.
updateCatalog(catalog: IProductItem[]) — добавляет товары в каталог.
showPreview(item: IProductItem) - показывает карточку товара.
addToBasket(item: IProductItem) - добавляет в корзину.
removeFromBasket(item: IProductItem) - удаляет из корзины.
updateBasket() - обновляет корзину.
setDeliveryField(field: keyof Pick<IOrderInfo, 'payment' | 'address'>, value: string)
setContactField(field: keyof Pick<IOrderInfo, 'email' | 'phone'>,value: string)
validateOrderForm() - boolean — проверяет валидность формы заказа.

### Интерфейсы и Типы для Данных

#### IProductItem
Описание структуры объекта товара.
Применяется для типизации данных, полученных от API или хранящихся в каталоге.
Состав интерфейса:
id — уникальный идентификатор товара.
description — описание товара.
image — URL изображения товара.
title — название товара.
category — категория товара.
price — цена товара (или null, если цена отсутствует).
button — текст или значение кнопки, связанное с товаром.

#### IOrderInfo
Описание данных, связанных с заказом.
Включает контактную информацию, адрес и способ оплаты.

#### IAppStore
Глобальное состояние приложения: список товаров, состояние корзины, заказ и предпросмотр.

#### CategoryType
Типизация категории товара.
Определяет фиксированный набор возможных значений.

#### PaymentType
Типизация способов оплаты в заказе.

#### PaymentDetailsForm и ContactDetailsForm
Описание структуры данных для форм оплаты, доставки и контактных данных.

#### FormErrors
Описание структуры ошибок валидации формы заказа.


## Слой представления (View)
Назначение:
Управление пользовательским интерфейсом.
Обновление отображения данных в ответ на изменения состояния приложения.

### Классы и описание:

#### Класс Component
Задача: Базовый класс для всех компонентов представления.

Поля:
container (HTMLElement) — корневой элемент компонента.

Основные методы:
render(data: any): HTMLElement — рендер компонента.
setText(element: HTMLElement, text: string) — изменяет текст элемента.
setImage(imgElement: HTMLImageElement, src: string, alt?: string) — обновляет изображение.
setDisabled(element: HTMLElement, disabled: boolean) — блокирует элемент.
toggleClass(element: HTMLElement, className: string, force?: boolean) — переключает класс элемента.

#### Класс EventEmitter
Задача: Реализует интерфейс IEvents и обеспечивает работу событий. Функции брокера события: возможность установить и снять слушателей событий, вызвать слушателей при возникновении события».

Методы:
- on - устанавливает обработчик на указанное событие;
- off - удаляет обработчик с указанного события;
- emit - инициирует событие с указанным именем и данными;
- onAll - устанавливает обработчик, который будет вызываться для всех событий;
- offAll - cбрасывает все обработчики событий;
- trigger - cоздает функцию-триггер, которая генерирует событие при вызове

#### Класс Modal
Задача: Реализация модального окна.

Поля:
_closeButton — кнопка закрытия модального окна.
_content — контейнер для содержимого окна.

Методы:
openModal() — открывает модальное окно.
closeModal() — закрывает модальное окно.
render(data: IModalData) — обновляет содержимое окна с переданными данными.


#### Класс Card
Задача: Карточка товара с кнопками взаимодействия.

Поля:
_descriptionElement — описание товара.
_imageElement — изображение товара.
_titleElement — название товара.
_priceElement — цена товара.
_buttonElement — кнопка взаимодействия.
_categoryElement — категория товара.
_removeButton - кнопка удаления.
_itemIndex — индекс товара в корзине (например, порядковый номер).

Методы:
set id — устанавливает идентификатор товара.
get id — получает идентификатор товара.
set title — устанавливает название товара.
get title — получает название товара.
set image — устанавливает изображение товара, используя путь к изображению.
set disabled — устанавливает состояние кнопки (активна или неактивна).
set price — устанавливает цену товара или устанавливает цену как "Бесценно", если цена равна null.
set category — устанавливает категорию товара.
set button — изменяет текст кнопки (например, "Добавить в корзину" или "Убрать из корзины").
set description(value: string) — устанавливает описание товара.
set index(value: number) — устанавливает порядковый номер товара в корзине.
set buttonTitle(value: string) - устанавливает описание кнопки.

#### Класс Basket
Задача: управление отображением корзины, подсчет общей суммы и взаимодействие с пользователем.

Поля:
_list — элемент DOM, представляющий список товаров в корзине.
_amount — элемент DOM для отображения общей суммы.
_button — кнопка для оформления заказа.

Методы:
set items — устанавливает товары в корзину. Если корзина пуста, выводит сообщение об этом и деактивирует кнопку заказа.
set sum — отображает общую сумму товаров.
toggleButton(isDisabled: boolean) — переключает кнопку.

#### Класс Order
Задача: управление формой оформления заказа, выбор метода оплаты и обработка адреса доставки.

Поля:
buttonOnline — кнопка для выбора оплаты картой.
buttonCash — кнопка для выбора оплаты наличными.

Методы:
set address — устанавливает адрес доставки.
toggleButtons(isDisabled: boolean) — переключает кнопки.

#### Класс Form
Задача: компонент для работы с формами (валидация, ввод данных, отображение ошибок).

Поля:
_submit — кнопка отправки формы.
_errors — элемент для отображения ошибок.

Методы:
onInputChange — обрабатывает изменения в полях формы, эмитируя событие с именем поля и его значением.
set valid — включает или выключает кнопку отправки формы.
set errors — устанавливает и отображает ошибки формы.
render — обновляет поля формы и их состояние.

#### Класс Page
Задача: управление основными элементами страницы (каталог товаров, корзина, блокировка прокрутки).

Поля:
_counter — отображает количество товаров в корзине.
_catalog — содержит карточки товаров.
_wrapper — обертка страницы для блокировки прокрутки.
_basket — элемент корзины с обработчиком событий.

Методы:
set counter — обновляет счетчик товаров в корзине.
set catalog — устанавливает карточки товаров в каталоге.
set locked — блокирует или разблокирует прокрутку страницы.

#### Класс Contacts
Задача: Компонент формы ввода контактных данных (email и телефон).

Поля:
_email — поле для ввода email.
_phone — поле для ввода телефонного номера.

Методы:
set email(value: string) — обновляет значение поля ввода email.
set phone(value: string) — обновляет значение поля ввода телефонного номера.

#### Класс Success
Задача: Компонент для отображения сообщения об успешном завершении операции, например, успешный заказ, с возможностью закрытия окна.

Поля:
close — кнопка для закрытия сообщения об успехе.
_success_description — элемент, отображающий описание успешной операции.

Методы:
set total(value: number) — обновляет описание успеха, устанавливая текстовое значение с указанием списанных синапсов. Принимает числовое значение и обновляет текст в элементе _success_description.


### Интерфейсы и Типы для Приложения

#### IModal и IModalData
Типизация модальных окон и данных, отображаемых в них.

#### IOrderResult
Итоговые данные после оформления заказа.
Например, идентификатор заказа и общая сумма.

#### IForm
Типизация состояния формы и связанных с ней ошибок.

#### IPage
Описание состояния страницы, включая список элементов и блокировку.

#### ISuccess и ISuccessHandler
Отображение успешного оформления заказа и обработка взаимодействия с итоговой кнопкой.


## Слой Презентера (Presenter)
Назначение: Управление взаимодействием между Model и View, обрабатывая пользовательские события и бизнес-логику.

Интерфейсы и Типы для Презентации Здесь интерфейсов нет, так как они описывают сущности данных и их состояния. Этот слой работает с теми данными, которые уже типизированы в слоях Данных и Представления.