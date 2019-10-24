/* eslint-disable */
import axios from 'axios';
import { alertMessage } from './alert';
const stripe = Stripe('pk_test_Ejq0VxgFHn0XQOlbAUDyYqu700CsJYMrU9');

export const bookTour = async tourId => {
  try {
    const session = await axios.get(
      `/api/v1/booking/checkout-session/${tourId}`
    );
    const result = await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (error) {
    alertMessage('error', 'Something went wrong');
  }
};
