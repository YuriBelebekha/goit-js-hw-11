import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { Notify } from 'notiflix/build/notiflix-notify-aio';

import './css/styles.css';
import { fetchPhotos } from "./fetchPhotos";


const refs = {
  searchFormBtn: document.querySelector('#search-form'),
  galleryPhoto: document.querySelector('.gallery'),
};

refs.searchFormBtn.addEventListener('submit', onSearchFormSubmit);

function onSearchFormSubmit(e) {
  e.preventDefault();

  const normalizedSearchQuery = e.currentTarget.searchQuery.value.trim();
   
  if (normalizedSearchQuery === '') {
    Notify.info('Your query is empty, please enter data to search.');    
    return;
  };  

  fetchPhotos(normalizedSearchQuery)
    .then(({ hits, totalHits } ) => {
      if (totalHits === 0) {
        return Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      };

      if (totalHits > 0) {
        // console.log(hits); // delete
        clearPhotoGalleryMarkup();        
        Notify.success(`Hooray! We found ${totalHits} images.`);
        createMarkupForPhotoGallery(hits);
        return;
      };
    })
};

function createMarkupForPhotoGallery(photos) {
  const markup = photos.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
    return `
      <div class="photo-card">
        <a href="${largeImageURL}">
          <img src="${webformatURL}" alt="${tags}" loading="lazy"/>
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

  new SimpleLightbox('.gallery a');
};

function clearPhotoGalleryMarkup() {
  refs.galleryPhoto.innerHTML = '';
};



// add refresh() method!!!!!!!!!!!!!!!