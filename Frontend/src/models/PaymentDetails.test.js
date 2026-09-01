import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import PaymentDetails from './PaymentDetails';

describe('PaymentDetails', () => {
  test('disables confirm payment when paid amount is less than total amount', () => {
    render(
      <PaymentDetails
        isOpen={true}
        onClose={jest.fn()}
        onBackToDiscount={jest.fn()}
        totalAmount={1000}
        customer={{ name: 'Test Customer' }}
        discountPercentage={0}
        onOrderComplete={jest.fn()}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Enter amount'), {
      target: { value: '500' },
    });

    fireEvent.click(screen.getByRole('button', { name: /check balance/i }));

    expect(screen.getByRole('button', { name: /confirm payment/i })).toBeDisabled();
  });
});
