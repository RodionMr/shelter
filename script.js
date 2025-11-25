'use strict'

document.addEventListener('DOMContentLoaded', () => {
    // PopUp
    const popupModule = (srcImg = '../') => {
        const btns = document.querySelectorAll('[data-showcard]');
        const popup = document.querySelector('.pop-up-container');
        const closeESC = (e) => {
            if (e.key === 'Escape') popup.classList.remove('open');
            document.body.classList.remove('overflower');
            document.onkeydown = null
        }
        const renderContent = (dataCard) => {
            const { picture, name, type, breed, description, age, inoculations, diseases, parasites } = dataCard
            const $popup = document.createElement('div');
            $popup.classList.add('pop-up');
            $popup.innerHTML = `
      <button class="btn-circle btn-circle__transparent pop-up-close"></button>
        <div class="pop-up__img-box">
          <img src="${srcImg}${picture}" alt="dog" class="pop-up-img">
        </div>
        <div class="pop-up__content">
          <div class="pop-up__title">${name}</div>
          <div class="pop-up__subtitle">${type} - ${breed}</div>
          <div class="pop-up__descr">${description}</div>
          <ul class="pop-up__list">
            <li class="pop-up__item-list">
              <span class="item-list__title">
                Age:
              </span>
              <span class="item-list__value">
                ${age}
              </span>
            </li>
            <li class="pop-up__item-list">
              <span class="item-list__title">
                Inoculations:
              </span>
              <span class="item-list__value">
              ${inoculations.join(', ')}
              </span>
            </li><li class="pop-up__item-list">
              <span class="item-list__title">
                Diseases:
              </span>
              <span class="item-list__value">
              ${diseases.join(', ')}
              </span>
            </li><li class="pop-up__item-list">
              <span class="item-list__title">
                Parasites:
              </span>
              <span class="item-list__value">
                ${parasites.join(', ')}
              </span>
            </li>
          </ul>
        </div>`
            return $popup
        }
        const handler = function () {
            popup.innerHTML = '';
            const sourceCards = document.querySelector('.pets') ? cardsPagination.getCards() : cardsSlider.getCards();
            sourceCards.forEach(card => {
                if (card.link === this.dataset.showcard) {
                    const popupContent = renderContent(card)
                    popup.append(popupContent);
                }
            })
            popup.classList.add('open');
            document.body.classList.add('overflower');

            document.onkeydown = closeESC;
            const btnClose = document.querySelector('.pop-up-close');
            btnClose.onclick = closePopUp;
        }
        const closePopUp = () => {
            popup.classList.remove('open');
            document.body.classList.remove('overflower');
        }
        const closePopUpOverflow = (e) => {
            !e.target.closest('.pop-up') ? closePopUp() : null
        }
        btns.forEach(btn => {
            btn.onclick = handler;
        })
        popup.onclick = closePopUpOverflow;
    }

    class Cards {
        constructor() {
            this.cards = []
        }
        async fetchData(url) {
            const response = await fetch(url);
            const data = await response.json();
            return data;
        }
        async add(url) {
            const data = await this.fetchData(url);
            this.cards.push(...data)
        }
        getCard(i) {
            return this.cards[i]
        }
        createRandomCards(n, exclusionCards = []) {
            let cards = [];
            const rNum = () => Math.floor(Math.random() * this.cards.length);
            let random = rNum();
            while (cards.length < Math.min(n, this.cards.length)) {
                if (!cards.includes(this.cards[random])) {
                    cards.push(this.cards[random]);
                }
                random = rNum();
            }
            for (let i = 0; cards.length < n; i++) {
                cards.push(cards[i])
            }
            const hasMatch = exclusionCards.some(card => cards.includes(card));

            if (hasMatch) {
                return this.createRandomCards(n, exclusionCards)
            }
            return cards
        }
        getCards() {
            return this.cards
        }
    }
    const cardsSlider = new Cards();
    const cardsPagination = new Cards();
    const sliderModule = () => {
        let placesForCards = 9;
        const checkWindowSize = (places) => {
            switch (true) {
                case document.documentElement.clientWidth < 768: places = 3
                    break
                case document.documentElement.clientWidth < 1280: places = 6
                    break
                default: places = 9
            }
            return places
        }
        placesForCards = checkWindowSize()
        window.addEventListener('resize', () => {
            let prevPlaces = placesForCards;
            placesForCards = checkWindowSize()
            prevPlaces !== placesForCards && (slider.startSlider(cardsSlider.createRandomCards(placesForCards)))
        });
        const arrowRight = document.querySelector('.arrow-right')
        const arrowLeft = document.querySelector('.arrow-left')
        class Slider {
            constructor(parentContainerClass) {
                this.$parentContainer = document.querySelector(parentContainerClass);
                this.$cardsOnPage = [];
                this.cardsOnPage = [];
                this.left = 0;
                this.translateX = 0;
            }
            startSlider(cards) {
                this.cardsOnPage = [];
                this.$cardsOnPage = [];
                this.$parentContainer.innerHTML = '';
                this.$parentContainer.style.transform = `translateX(${this.translateX}px)`
                cards.forEach((card) => {
                    this.renderCard(card)
                })
            }
            createHtmlCard(card) {
                const { picture, name, link, alt } = card
                const $card = document.createElement('div');
                $card.classList.add('slider__item', 'card');
                $card.dataset.showcard = `${link}`;
                $card.innerHTML = `
        <img src="${picture}" alt="${alt}" class="card__pic" />
        <div class="card__title">${name}</div>
        <button class="btn btn__transparent">Learn more</button>
        `
                return $card
            }
            renderCard(card, next = true) {
                const $card = this.createHtmlCard(card)
                next ? this.cardsOnPage.push(card) : this.cardsOnPage.unshift(card);
                next ? this.$cardsOnPage.push($card) : this.$cardsOnPage.unshift($card);
                next ? this.$parentContainer.append($card) : this.$parentContainer.prepend($card);
                popupModule('./');
            }
            nextCard() {
                const setTranslate = (translateX, left) => {
                    this.translateX -= translateX
                    this.left += left;
                    this.$parentContainer.style.transform = `translateX(${this.translateX}px)`
                }
                const renderNextCard = (nLastCards) => {
                    const lastCardsOnPage = this.cardsOnPage.slice(-nLastCards)
                    const newCards = cardsSlider.createRandomCards(nLastCards, lastCardsOnPage);
                    newCards.forEach(card => this.renderCard(card))
                    for (let i = 0; i < nLastCards; i++) {
                        this.$cardsOnPage.shift();
                        const firstCard = this.$parentContainer.firstChild
                        this.$parentContainer.removeChild(firstCard)
                        this.cardsOnPage.shift();
                    }
                }
                if (placesForCards === 3) setTranslate(360, 360)
                if (placesForCards === 6) setTranslate(620, 620)
                if (placesForCards === 9) setTranslate(1080, 1080)
                const tmpFun = arrowRight.onclick
                arrowRight.onclick = null
                setTimeout(() => {
                    this.$parentContainer.style.left = this.left + 'px'
                    this.$parentContainer.style.transition = 'none';
                    if (placesForCards === 3) renderNextCard(1)
                    if (placesForCards === 6) renderNextCard(2)
                    if (placesForCards === 9) renderNextCard(3)
                    arrowRight.onclick = tmpFun
                }, 700)
                this.$parentContainer.style.transition = 'all 0.7s ease-in-out';
            }
            prevCard() {
                const setTranslate = (translateX, left) => {
                    this.translateX += translateX
                    this.left -= left;
                    this.$parentContainer.style.transform = `translateX(${this.translateX}px)`
                }
                const renderPrevCard = (nFirstCards) => {
                    const firstCardsOnPage = this.cardsOnPage.slice(0, 3);
                    const newCards = cardsSlider.createRandomCards(nFirstCards, firstCardsOnPage);
                    newCards.forEach(card => this.renderCard(card, false))
                    for (let i = 0; i < nFirstCards; i++) {
                        this.$cardsOnPage.pop();
                        const lastCard = this.$parentContainer.lastChild;
                        this.$parentContainer.removeChild(lastCard);
                        this.cardsOnPage.pop();
                    }
                }
                if (placesForCards === 3) setTranslate(360, 360);
                if (placesForCards === 6) setTranslate(620, 620);
                if (placesForCards === 9) setTranslate(1080, 1080);
                const tmpFun = arrowLeft.onclick
                arrowLeft.onclick = null
                setTimeout(() => {
                    this.$parentContainer.style.left = this.left + 'px'
                    this.$parentContainer.style.transition = 'none';
                    if (placesForCards === 3) renderPrevCard(1)
                    if (placesForCards === 6) renderPrevCard(2)
                    if (placesForCards === 9) renderPrevCard(3)
                    arrowLeft.onclick = tmpFun
                }, 700)
                this.$parentContainer.style.transition = 'all 0.7s ease-in-out';
            }
        }
        const slider = new Slider('.slider__items')
        const next = function () {
            slider.nextCard()
        }
        const prev = function () {
            slider.prevCard()
        }
        arrowRight.onclick = next;
        arrowLeft.onclick = prev;
        cardsSlider.add('cards.json')
            .then(() => {
                slider.startSlider(cardsSlider.createRandomCards(placesForCards))
            })
    }
    /// Hamburger
    const hamburgerModule = () => {
        const btn = document.querySelector(".menu-wrapper");
        const logo = document.querySelector('.top-bar__logo-box');
        const nav = document.querySelector(".navigation");
        const header = document.querySelector(".header");
        const links = document.querySelectorAll('.navigation__link');
        const isOpenBurger = () => nav.classList.contains('navigation__active')
        const handler = function () {
            nav.classList.toggle('navigation__active');
            const setHeight = (value) => header.style.height = value
            isOpenBurger() ? setHeight('100vh') : setTimeout(setHeight, 400, 'auto');
            this.classList.toggle('animate');
            logo.style.pointerEvents = logo.style.pointerEvents === 'none' ? 'auto' : 'none'
        }
        const closeOverflow = function (e) {
            const target = e.target
            if (isOpenBurger()) {
                !nav.contains(target) && target !== btn && target.contains(btn) ? handler.apply(btn) : null
            }
        }
        btn.onclick = handler
        header.onclick = closeOverflow
        /// fix when changing the page width, the burger menu does not open automatically
        const media = window.matchMedia('(max-width: 767px)');
        function changeSreenWidth() {
            links.forEach(link => link.onclick = media.matches ? handler.bind(btn) : null);
        }
        media.addEventListener('change', changeSreenWidth);
        window.addEventListener('load', changeSreenWidth);
    }
    /// Pagination
    const paginationModule = () => {
        class Pagination {
            constructor(parentContainerClass) {
                this.$parentContainer = document.querySelector(parentContainerClass);
                this.cards = [];
                this.pages = {};
                this.places = null;
                this.currentNumberPage = 1;
            }
            start = (places) => {
                this.pages = {};
                this.places = places
                this.createPagesCards();
                this.renderPage(this.currentNumberPage);
            }
            createCardsArray = () => {
                const firstFourNotContainsTwoLast = (current) => {
                    if (!current.slice(0, 4).includes(this.cards.at(-1)) && !current.slice(0, 4).includes(this.cards.at(-2))) {
                        this.cards = this.cards.concat(current);
                        return true
                    }
                    return false
                }
                const firstTwoNotContainsFourLast = (current) => {
                    if (!this.cards.slice(-4).includes(current[0]) && !this.cards.slice(-4).includes(current[1])) {
                        this.cards = this.cards.concat(current);
                        return true
                    }
                    return false
                }
                let current = []
                let correctArr = false
                for (let i = 0; i < 2; i++) {
                    this.cards = this.cards.concat(cardsPagination.createRandomCards(8));
                    while (!correctArr) {
                        current = cardsPagination.createRandomCards(8);
                        correctArr = firstFourNotContainsTwoLast(current);
                    }
                    correctArr = false;
                    while (!correctArr) {
                        current = cardsPagination.createRandomCards(8);
                        correctArr = firstTwoNotContainsFourLast(current);
                    }
                    correctArr = false
                }
            }
            createPagesCards = () => {
                const copyCards = Array.from(this.cards)
                const numAllPages = Math.ceil(this.cards.length / this.places);
                for (let i = 0; i < numAllPages; i++) {
                    if (copyCards.length > this.places) {
                        this.pages[i + 1] = copyCards.splice(0, this.places);
                    } else {
                        this.pages[i + 1] = copyCards
                    }
                }
            }
            getCards = () => {
                return this.cards
            }
            getPages = () => {
                return this.pages
            }
            createHtmlCard(card) {
                const { picture, name, link, alt } = card
                const $card = document.createElement('div');
                $card.classList.add('slider__item', 'card');
                $card.dataset.showcard = `${link}`;
                $card.innerHTML = `
            <img src="../${picture}" alt="${alt}" class="card__pic" />
            <div class="card__title">${name}</div>
            <button class="btn btn__transparent">Learn more</button>
            `
                return $card
            }
            renderPage = (numPage, isClickLeft = null) => {
                this.currentNumberPage = numPage;
                const render = () => {
                    this.$parentContainer.innerHTML = '';
                    this.pages[numPage].forEach(card => {
                        const $card = this.createHtmlCard(card);
                        this.$parentContainer.append($card);
                    })
                    popupModule();
                }
                if ((isClickLeft) === null) render();
                setTimeout(() => {
                    document.querySelector('.our-friends__cards').classList.remove('animateLeft', 'animateRight');
                    const clickLeft = () => document.querySelector('.our-friends__cards').classList.add('animateRightRevert');
                    const clickRight = () => document.querySelector('.our-friends__cards').classList.add('animateLeftRevert')
                    if ((isClickLeft) !== null) {
                        isClickLeft ? clickLeft() : clickRight();
                        render();
                    }
                }, 400)
            }
        }
        class PaginationControls {
            constructor(btnCurrent) {
                this.btnCurrent = btnCurrent
                this.currentNumberPage = 1;
                this.isClickLeft = null
            }
            animateClickRight = () => {
                this.isClickLeft = false;
                document.querySelector('.our-friends__cards').classList.remove('animateLeftRevert', 'animateRightRevert')
                document.querySelector('.our-friends__cards').classList.add('animateLeft')
            }
            animateClickLeft = () => {
                this.isClickLeft = true;
                document.querySelector('.our-friends__cards').classList.remove('animateLeftRevert', 'animateRightRevert')
                document.querySelector('.our-friends__cards').classList.add('animateRight')
            }
            update = (placesForCards) => {
                const numPages = Math.round(pagination.getCards().length / placesForCards);
                if (this.currentNumberPage > numPages) this.currentNumberPage = numPages
                this.submitToRender();
            }
            submitToRender = () => {
                pagination.renderPage(this.currentNumberPage, this.isClickLeft);
                this.btnCurrent.textContent = this.currentNumberPage;
            }
            first = () => {
                this.animateClickLeft();
                this.currentNumberPage = 1;
                this.submitToRender();
            }
            prev = () => {
                this.animateClickLeft();
                this.currentNumberPage--;
                this.submitToRender();
            }
            next = () => {
                this.animateClickRight();
                this.currentNumberPage++;
                this.submitToRender();
            }
            last = () => {
                this.animateClickRight();
                this.currentNumberPage = Object.keys(pagination.getPages()).length
                this.submitToRender();
            }
            getCurrentPageNumber = () => {
                return this.currentNumberPage
            }
        }
        const checkWindowSize = (places) => {
            switch (true) {
                case document.documentElement.clientWidth < 640: places = 3
                    break
                case document.documentElement.clientWidth < 1280: places = 6
                    break
                default: places = 8
            }
            return places
        }
        let placesForCards = checkWindowSize()
        const pagination = new Pagination('.our-friends__cards');
        cardsPagination.add('../cards.json')
            .then(() => {
                pagination.createCardsArray();
                pagination.start(placesForCards)
            });
        const $parentControls = document.querySelector('.our-friends__pagination');
        const $btnControls = $parentControls.querySelectorAll('[data-btn]');
        const btnFirst = $btnControls[0];
        const btnPrev = $btnControls[1];
        const btnCurrent = $btnControls[2];
        const btnNext = $btnControls[3];
        const btnLast = $btnControls[4];
        const paginationControls = new PaginationControls(btnCurrent)
        const activeBtns = (btns) => {
            btns.forEach(btn => {
                btn.classList.remove('btn-circle__inactive');
            })
        }
        const inactiveBtns = (btns) => {
            btns.forEach(btn => {
                btn.classList.add('btn-circle__inactive');
                btn.onclick = null
            })
        }
        const clickFirst = function () {
            paginationControls.first();
            if (!btnNext.onclick) btnNext.onclick = clickNext;
            if (!btnLast.onclick) btnLast.onclick = clickLast;
            inactiveBtns([btnFirst, btnPrev]);
            activeBtns([btnLast, btnNext])
        }
        const clickPrev = function () {
            paginationControls.prev();
            if (!btnNext.onclick) btnNext.onclick = clickNext;
            if (!btnLast.onclick) btnLast.onclick = clickLast;
            if (paginationControls.getCurrentPageNumber() === 1) {
                inactiveBtns([btnFirst, btnPrev]);
            }
            activeBtns([btnLast, btnNext])
        }
        const clickNext = function () {
            paginationControls.next();
            if (!btnPrev.onclick) btnPrev.onclick = clickPrev;
            if (!btnFirst.onclick) btnFirst.onclick = clickFirst;
            if (paginationControls.getCurrentPageNumber() === Object.keys(pagination.getPages()).length) {
                inactiveBtns([btnLast, btnNext])
            }
            activeBtns([btnFirst, btnPrev])
        }
        const clickLast = function () {
            paginationControls.last();
            if (!btnPrev.onclick) btnPrev.onclick = clickPrev;
            if (!btnFirst.onclick) btnFirst.onclick = clickFirst;
            inactiveBtns([btnLast, btnNext]);
            activeBtns([btnFirst, btnPrev]);
        }
        window.addEventListener('resize', (e) => {
            let prevPlaces = placesForCards;
            placesForCards = checkWindowSize()
            if (prevPlaces !== placesForCards) {
                paginationControls.update(placesForCards);
                pagination.start(placesForCards);
                if (paginationControls.getCurrentPageNumber() < Object.keys(pagination.getPages()).length) {
                    activeBtns([btnLast, btnNext])
                    if (!btnNext.onclick) btnNext.onclick = clickNext;
                    if (!btnLast.onclick) btnLast.onclick = clickLast;
                }
                if (paginationControls.getCurrentPageNumber() === Object.keys(pagination.getPages()).length) {
                    inactiveBtns([btnLast, btnNext]);
                }
            }
        });
        btnNext.onclick = clickNext;
        btnLast.onclick = clickLast;
    }
    hamburgerModule();
    document.querySelector('.slider__items') && sliderModule();
    document.querySelector('.our-friends__cards') && paginationModule();
});