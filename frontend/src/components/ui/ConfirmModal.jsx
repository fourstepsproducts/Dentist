import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  description = "This action cannot be undone.", 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  isLoading = false,
  variant = "danger"
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="space-y-4">
        <p className="text-slate-600 text-sm">{description}</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === "danger" ? "danger" : "primary"} 
            onClick={async () => {
              if (isLoading) return;
              await onConfirm();
            }}
            disabled={isLoading}
            className="min-w-[80px] justify-center"
          >
            {isLoading ? "Please wait..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { ConfirmModal };
