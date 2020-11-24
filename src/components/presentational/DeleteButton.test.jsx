import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';

import ConfirmationContext from '../../contexts/ConfirmationContext';

import DeleteButton from './DeleteButton';

describe('DeleteButton', () => {
  const onClickDelete = jest.fn();
  const setConfirmForm = jest.fn();
  const showConfirmation = jest.fn();

  function renderDeleteButton() {
    return render((
      <ConfirmationContext.Provider
        value={{
          showConfirmation,
          setConfirmForm,
        }}
      >
        <DeleteButton
          onClickDelete={onClickDelete}
        />
      </ConfirmationContext.Provider>
    ));
  }

  beforeEach(() => {
    onClickDelete.mockClear();
    setConfirmForm.mockClear();
  });

  it('render delete button', () => {
    const { container } = renderDeleteButton();

    expect(container).toHaveTextContent('Delete');
  });

  context('when user clicked "YES"', () => {
    it('call onClickDelete', async () => {
      showConfirmation.mockImplementation(() => (
        Promise.resolve(true)
      ));

      const { container } = renderDeleteButton();

      const deleteButton = container.querySelector('button[type="button"]');

      fireEvent.click(deleteButton);

      expect(setConfirmForm).toBeCalledWith({
        title: '삭제하시겠습니까?',
        content: '삭제하면 되돌릴 수 없습니다.',
      });
      expect(showConfirmation).toBeCalled();
      await waitFor(() => expect(onClickDelete).toBeCalled());
    });
  });

  context('when user clicked "NO"', () => {
    it('doesn\'t call onClickDelete', async () => {
      showConfirmation.mockImplementation(() => (
        Promise.resolve(false)
      ));

      const { container } = renderDeleteButton();

      const deleteButton = container.querySelector('button[type="button"]');

      fireEvent.click(deleteButton);

      expect(setConfirmForm).toBeCalledWith({
        title: '삭제하시겠습니까?',
        content: '삭제하면 되돌릴 수 없습니다.',
      });
      expect(showConfirmation).toBeCalled();
      await waitFor(() => expect(onClickDelete).not.toBeCalled());
    });
  });
});
