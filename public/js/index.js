/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';

const formLoginElement = document.querySelector('.form.form__login');
const btnLogoutElement = document.querySelector('.nav__el.nav__el--logout');
const mapElement = document.getElementById('map');

if (formLoginElement) {
  formLoginElement.addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (mapElement && mapElement.dataset.locations) {
  displayMap(mapElement.dataset.locations);
}

if (btnLogoutElement) {
  btnLogoutElement.addEventListener('click', logout);
}
