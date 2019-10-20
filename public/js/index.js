/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateUserSettings } from './updateSetting';

const formLoginElement = document.querySelector('.form.form__login');
const btnLogoutElement = document.querySelector('.nav__el.nav__el--logout');
const mapElement = document.getElementById('map');
const formUserDataElement = document.querySelector('.form.form-user-data');
const formUserPasswordElement = document.querySelector(
  '.form.form-user-password'
);

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
if (formUserDataElement) {
  formUserDataElement.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];
    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);
    updateUserSettings(form, 'data');
  });
}

if (formUserPasswordElement) {
  formUserPasswordElement.addEventListener('submit', async event => {
    event.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateUserSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}
