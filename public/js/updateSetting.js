/* eslint-disable */
import axios from 'axios';
import { alertMessage } from './alert';

export const updateUserSettings = async (data, type) => {
  try {
    const endpoint =
      type === 'password'
        ? 'http://localhost:3000/api/v1/users/update-password'
        : 'http://localhost:3000/api/v1/users/update-me';

    const response = await axios.patch(endpoint, data);
    if (response.data.status === 'success') {
      alertMessage('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (error) {
    console.log('error', error);
    alertMessage('error', error.response.data.message);
  }
};
