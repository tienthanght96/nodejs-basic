/* eslint-disable */
export const hideMessage = () => {
  const element = document.querySelector('.alert');
  if (element) {
    element.parentElement.removeChild(element);
  }
};

export const alertMessage = (type, msg, time = 7) => {
  hideMessage();

  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideMessage, time * 1000);
};
