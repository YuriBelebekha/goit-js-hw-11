// import axios from 'axios';

export { fetchPhotos };

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY  = '32534348-8cad927330b21d66d879b216b';

const { image_type, orientation, safesearch } = {  
  'image_type':  'photo',
  'orientation': 'horizontal',
  'safesearch':  true,
};

// async function fetchPhotos(q) {
//   try {
//     const response = await axios.get(`
//     ${BASE_URL}?key=${API_KEY}&q=${q}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}
//     `);
//     return response.data;
//   } catch (error) {
//     console.error(error);
//   };  
// };

function fetchPhotos(q) {
  return fetch(`
    ${BASE_URL}?key=${API_KEY}&q=${q}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        };
        return response.json();
      })
      .catch(error => console.error(error));
};