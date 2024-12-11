import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

const DeleteProgramModal = ({ isOpen, onClose, onConfirm, programName }) => {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="modal-overlay" />
        <AlertDialog.Content className="modal-content">
          <AlertDialog.Title className="modal-title">
            Delete Program
          </AlertDialog.Title>
          <AlertDialog.Description className="modal-description">
            Are you sure you want to delete "{programName}"? This action cannot be undone.
            All workouts and exercises associated with this program will also be deleted.
          </AlertDialog.Description>
          
          <div className="modal-footer">
            <AlertDialog.Cancel asChild>
              <button 
              type="button"
                className="modal-button modal-button--cancel"
                onClick={onClose}
              >
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
              type="button"
                onClick={onConfirm}
                className="modal-button modal-button--delete"
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default DeleteProgramModal;