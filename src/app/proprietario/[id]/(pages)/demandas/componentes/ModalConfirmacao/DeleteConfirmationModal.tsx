import React from 'react';
import { Trash2, XCircle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName = 'este item' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div 
        className="
          bg-white 
          rounded-lg 
          shadow-2xl 
          w-full 
          max-w-md 
          overflow-hidden 
          animate-fade-in-down
        "
      >
        <div className="p-6 pb-0">
          <div className="flex items-center mb-4">
            <Trash2 className="text-red-500 mr-3" size={24} />
            <h2 className="text-lg font-semibold text-gray-800">Confirmar Exclusão</h2>
          </div>
          
          <p className="text-gray-600 mb-6 text-center">
            Tem certeza que deseja excluir?
          </p>
        </div>
        
        <div className="flex justify-end bg-gray-50 p-4 space-x-3">
          <button 
            onClick={onClose}
            className="
              px-4 
              py-2 
              text-gray-600 
              hover:bg-gray-100 
              rounded-md 
              transition-colors 
              flex 
              items-center
            "
          >
            <XCircle className="mr-2" size={16} /> Cancelar
          </button>
          
          <button 
            onClick={onConfirm}
            className="
              px-4 
              py-2 
              bg-red-500 
              text-white 
              rounded-md 
              hover:bg-red-600 
              transition-colors 
              flex 
              items-center
            "
          >
            <Trash2 className="mr-2" size={16} /> Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;