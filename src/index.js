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

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};
const lightbox = new SimpleLightbox('.gallery a');
const observer = new IntersectionObserver(onLoad, options);

refs.searchFormBtn.addEventListener('submit', onSearchFormSubmit);

function onSearchFormSubmit(e) {
  e.preventDefault();

  normalizedSearchQuery = e.currentTarget.searchQuery.value.trim();
   
  if (normalizedSearchQuery === '') {
    Notify.info('Your query is empty, please enter data to search.');    
    return;
  };  

  page = 1;

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
        observer.observe(refs.guard);        
      };
    })
    .catch(error => console.error(error));
};

function createMarkupForPhotoGallery(photos) {
  const markup = photos.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
    return `
      <div class="photo-card">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" width="360" height="240"/>
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads ${downloads}</b>
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
      
      fetchPhotos(normalizedSearchQuery, page).then(data => {       
        const totalPages = Math.ceil(data.totalHits / per_page);
       
        createMarkupForPhotoGallery(data.hits);
        lightbox.refresh();
        slowScroll();
        
        if (page === totalPages) {          
          observer.unobserve(refs.guard);          
        };
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
