import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  it('renders its title', () => {
    render(<Button title="Sign in" onPress={() => {}} />);
    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Sign in" onPress={onPress} />);

    fireEvent.press(screen.getByText('Sign in'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    render(<Button title="Sign in" onPress={onPress} disabled />);

    fireEvent.press(screen.getByText('Sign in'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
