'use client'

import { useState } from 'react';
import { X } from 'lucide-react';
import type { DemandaFormData } from '../../types/types';
import type { AlinhamentoType, PrioridadeType, ResponsavelType, StatusType } from '../../types/types';

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: DemandaFormData) => Promise<void>;
  isEditing: string | null;
  formData: DemandaFormData;
  setFormData: (data: DemandaFormData) => void;
  alinhamentos: AlinhamentoType[];
  prioridades: PrioridadeType[];
  responsaveis: ResponsavelType[];
  statusList: StatusType[];
}

export default function Form({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  formData,
  setFormData,
  alinhamentos,
  prioridades,
  responsaveis,
  statusList
}: FormProps) {
  const [formErrors, setFormErrors] = useState<{ [key: string]: boolean }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Validar campos obrigatórios
      const errors = {
        nome: !formData.nome,
        proprietario_id: !formData.proprietario_id
      };

      setFormErrors(errors);

      if (errors.nome || errors.proprietario_id) {
        return;
      }

      // Preparar dados para envio
      const formDataToSubmit: DemandaFormData = {
        ...formData,
        nome: formData.nome || '-',
        sigla: formData.sigla || '-',
        descricao: formData.descricao || '-',
        link: formData.link || '',
        fator_gerador: formData.fator_gerador || '-',
        demandante: formData.demandante || '-',
        proprietario_id: Number(formData.proprietario_id),
        alinhamento_id: formData.alinhamento_id ? Number(formData.alinhamento_id) : null,
        prioridade_id: formData.prioridade_id ? Number(formData.prioridade_id) : null,
        responsavel_id: formData.responsavel_id ? Number(formData.responsavel_id) : null,
        status_id: formData.status_id ? Number(formData.status_id) : null,
        data_status: formData.data_status || new Date().toISOString().split('T')[0]
      };

      await onSubmit(formDataToSubmit);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] overflow-y-auto pt-7">
      <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-3xl m-4 ">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Demanda' : 'Nova Demanda'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-3"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="hidden"
              name="proprietario_id"
              value={formData.proprietario_id || ''}
            />

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Sigla</label>
              <input
                type="text"
                name="sigla"
                value={formData.sigla || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Demandante</label>
              <input
                type="text"
                name="demandante"
                value={formData.demandante || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Descrição</label>
              <textarea
                name="descricao"
                value={formData.descricao || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              />
              
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Fato Gerador</label>
              <input
                type="text"
                name="fator_gerador"
                value={formData.fator_gerador || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Link do PGA</label>
              <input
                type="text"
                name="link"
                value={formData.link || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Alinhamento</label>
              <select
                name="alinhamento_id"
                value={formData.alinhamento_id || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              >
                <option value="">Selecione um alinhamento</option>
                {alinhamentos.map((align: any) => (
                  <option key={align.id} value={align.id}>{align.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Prioridade</label>
              <select
                name="prioridade_id"
                value={formData.prioridade_id || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              >
                <option value="">Selecione uma prioridade</option>
                {prioridades.map((prior: any) => (
                  <option key={prior.id} value={prior.id}>{prior.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Responsável</label>
              <select
                name="responsavel_id"
                value={formData.responsavel_id || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              >
                <option value="">Selecione um responsável</option>
                {responsaveis.map((resp: any) => (
                  <option key={resp.id} value={resp.id}>{resp.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Status</label>
              <select
                name="status_id"
                value={formData.status_id || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              >
                <option value="">Selecione um status</option>
                {statusList.map((status: any) => (
                  <option key={status.id} value={status.id}>{status.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-bold">Data Status</label>
              <input
                type="date"
                name="data_status"
                value={formData.data_status || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
