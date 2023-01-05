import './sass/styles.scss';
import { fetchPhotos } from "./fetchPhotos";
import { per_page } from "./fetchPhotos";

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchFormBtn: document.querySelector('#search-form'),
  galleryPhoto: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

let normalizedSearchQuery = '';
let page;
let limitReached = true;
const debounce = require('lodash.debounce');
const DEBOUNCE_DELAY = 300;

const optionsLightbox = {
  captionsData: 'alt',  
  captionDelay: 250,
  overlayOpacity: 0.85,  
}

const options = {
  root: null,
  rootMargin: '150px',
  threshold: 1.0,
};

const lightbox = new SimpleLightbox('.gallery a', optionsLightbox);
const observer = new IntersectionObserver(onLoad, options);

refs.searchFormBtn.addEventListener('submit', onSearchFormSubmit);
window.addEventListener('scroll', debounce(onScrollToFinishOfGallery, DEBOUNCE_DELAY));

function onSearchFormSubmit(e) {
  e.preventDefault();

  normalizedSearchQuery = e.currentTarget.searchQuery.value.trim();
   
  if (normalizedSearchQuery === '') {    
    return Notify.info('Your query is empty, please enter data to search.');    
  };  
  
  page = 1;
  limitReached = true;

  fetchPhotos(normalizedSearchQuery, page)
    .then(({ hits, totalHits }) => {
      if (totalHits === 0) {
        clearPhotoGalleryMarkup();
        return Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      };
      
      if (totalHits > 0) {
        clearPhotoGalleryMarkup();
        Notify.success(`Hooray! We found ${totalHits} images.`);
        createMarkupForPhotoGallery(hits);
        lightbox.refresh();
        
        if (totalHits > per_page) {
          limitReached = false;
          observer.observe(refs.guard); 
        };        
      };      
    })    
    .catch(error => console.error(error));      
};

function createMarkupForPhotoGallery(photos) {
  const markup = photos.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {    
    return `
      <div class="photo-card">
        <a class="photo-card__link" href="${largeImageURL}">
          <img class="photo-card__img" src="${webformatURL}" alt="${tags}" loading="lazy"/>
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            <span>${likes}</span>
          </p>
          <p class="info-item">
            <b>Views</b>
            <span>${views}</span>
          </p>
          <p class="info-item">
            <b>Comments</b>
            <span>${comments}</span>
          </p>
          <p class="info-item">
            <b>Downloads</b>
            <span>${downloads}</span>
          </p>
        </div>
      </div>
    `
  }).join('');

  refs.galleryPhoto.insertAdjacentHTML('beforeend', markup);
};

function clearPhotoGalleryMarkup() {
  refs.galleryPhoto.innerHTML = '';
};

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      
      fetchPhotos(normalizedSearchQuery, page)
        .then(data => {
          limitReached = false;
          createMarkupForPhotoGallery(data.hits);

          lightbox.refresh();
          
          slowScroll();
          
          if ((data.hits.length > 0 && (data.hits.length % per_page != 0)) || (data.totalHits === per_page * page)) {
            limitReached = true;
            observer.unobserve(refs.guard);
          };
        })
        .catch(error => {
          console.log(error);
          limitReached = true;
          observer.unobserve(refs.guard);
        });
    };    
  });  
};

function slowScroll() {
  const { height: cardHeight } = refs.galleryPhoto.firstElementChild.getBoundingClientRect();  

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
};

function onScrollToFinishOfGallery() {
  if (!limitReached) {
    return;
  };

  if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
    Notify.info('We\'re sorry, but you\'ve reached the end of search results.');
  };
};