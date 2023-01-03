import axios from 'axios';

export { fetchPhotos };

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY  = '32534348-8cad927330b21d66d879b216b';

export const { image_type, orientation, safesearch, per_page } = {  
  'image_type':  'photo',
  'orientation': 'horizontal',
  'safesearch': true,
  'per_page': '40', // CHANGE TO 40!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
};

async function fetchPhotos(q, page) {
  const response = await axios.get(`
  ${BASE_URL}?key=${API_KEY}&q=${q}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}&per_page=${per_page}&page=${page}
  `);  
  return await response.data;
};


// fetch without axios

// function fetchPhotos(q) {
//   return fetch(`
//     ${BASE_URL}?key=${API_KEY}&q=${q}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}`)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(response.statusText);
//         };
//         return response.json();
//       })
//       .catch(error => console.error(error));
// };