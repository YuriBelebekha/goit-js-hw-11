import './css/styles.css';
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
let page = 1;

const options = {
  root: null,
  rootMargin: '200px',
  threshold: 1.0,
};
const observer = new IntersectionObserver(onLoad, options);

refs.searchFormBtn.addEventListener('submit', onSearchFormSubmit);

function onSearchFormSubmit(e) {
  e.preventDefault();

  normalizedSearchQuery = e.currentTarget.searchQuery.value.trim();
   
  if (normalizedSearchQuery === '') {
    Notify.info('Your query is empty, please enter data to search.');    
    return;
  };  

  fetchPhotos(normalizedSearchQuery, page)
    .then(({ hits, totalHits }) => {
      if (totalHits === 0) {
        return Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      };

      if (totalHits > 0) {
        // console.log(hits); // delete
        clearPhotoGalleryMarkup();
        Notify.success(`Hooray! We found ${totalHits} images.`);
        createMarkupForPhotoGallery(hits);

        // new SimpleLightbox('.gallery a'); ///////////////////////////////////
        ///
        observer.observe(refs.guard);
        ///        
        return;
      };
    })
    .catch(error => console.error(error));
};

function createMarkupForPhotoGallery(photos) {
  const markup = photos.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
    return `
      <div class="photo-card">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" width="40"/>
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

  // const lightbox = new SimpleLightbox('.gallery a');
  // lightbox.refresh();
};

function clearPhotoGalleryMarkup() {
  refs.galleryPhoto.innerHTML = '';
};

function onLoad(entries, observer) {
  console.log(entries);

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      
      fetchPhotos(normalizedSearchQuery, page).then(data => {       
        const totalPages = Math.ceil( data.totalHits / per_page);
        
        createMarkupForPhotoGallery(data.hits);
        // const lightbox = new SimpleLightbox('.gallery a'); ///
        //////////////////////////////// ЩОСЬ ТРЕБА РОБИТИ З РЕФРЕШ
        // new SimpleLightbox('.gallery a');
        
        if (page === totalPages) {
          observer.unobserve(refs.guard);
        };        
      });
    };
  });
};
