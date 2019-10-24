/* eslint-disable */
import axios from 'axios';
import { alertMessage } from './alert';

export const login = async (email, password) => {
  try {
    console.log({ email, password });
    const response = await axios.post('/api/v1/users/login', {
      email: email,
      password: password
    });
    if (response.data.status === 'success') {
      alertMessage('success', 'Login success!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    alertMessage('error', error.response.data.message);
  }
};

export const logout = async () => {
  try {
    const response = await axios.post('/api/v1/users/logout');
    if (response.data.status === 'success') {
      location.reload();
    }
  } catch (error) {
    alertMessage('error', 'Can not logout. Try again!');
  }
};
