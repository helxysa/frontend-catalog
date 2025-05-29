'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import {SolucaoFormModalProps } from '../../types/types'; 


export default function SolucaoFormModal({
  isOpen,
  isEditing,
  formData,
  setFormData,
  handleInputChange,
  handleSubmit,
  onClose,
  tipos,
  linguagens,
  desenvolvedores,
  categorias,
  responsaveis,
  statusList,
  demanda,
  formErrors,
  selectedLanguages,
  setSelectedLanguages,
  handleLanguageChange,
  removeLanguage,
  isDropdownOpen,
  setIsDropdownOpen,
  activeFormTab,
  setActiveFormTab,
  formatDate,
}: SolucaoFormModalProps) {
  



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl z-[101] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Editar Solução' : 'Nova Solução'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <h1
              className={`py-2 px-3 border-b-2 border-blue-500 text-blue-600`}
            >
              Dados da Solução
            </h1>
            
          </div>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome || ''}
                  onChange={handleInputChange}
                  className={`w-full p-2.5 text-sm border ${formErrors.nome ? 'border-red-500' : 'border-gray-300'
                    } rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors`}
                />
                {formErrors.nome && (
                  <p className="mt-1 text-xs text-red-500">
                    Este campo é obrigatório
                  </p>
                )}
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sigla</label>
                <input
                  type="text"
                  name="sigla"
                  value={formData.sigla || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                />
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Demanda
                </label>
                <select
                  name="demanda_id"
                  value={formData.demanda_id || ''}
                  onChange={handleInputChange}
                  className={`w-full p-2.5 text-sm border ${formErrors.demanda_id ? 'border-red-500' : 'border-gray-300'
                    } rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors`}
                >
                  <option value="">Selecione uma demanda</option>
                  {demanda.map((d) => (
                    <option key={d.id} value={d.id}>{d.sigla || d.nome}</option>
                  ))}
                </select>
              </div>
          
              <div className="lg:col-span-3 md:col-span-2 col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                />
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Versão</label>
                <input
                  type="text"
                  name="versao"
                  value={formData.versao || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                />
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Repositório</label>
                <input
                  type="text"
                  name="repositorio"
                  value={formData.repositorio || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                  placeholder="URL do repositório"
                />
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Link</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                  placeholder="URL do link"
                />
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
                <select
                  name="tipo_id"
                  value={formData.tipo_id || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                >
                  <option value="">Selecione um tipo</option>
                  {tipos.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                  ))}
                </select>
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tecnologias
                </label>
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative flex flex-wrap gap-2 p-2.5 min-h-[42px] bg-white border border-gray-300 rounded-md cursor-pointer hover:border-blue-500 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-200 transition-colors"
                >
                  {selectedLanguages.length === 0 && <span className="text-sm text-gray-400">Selecione...</span>}
                  {selectedLanguages.map((langId) => {
                    const language = linguagens.find(l => l.id === langId);
                    return (
                      <div
                        key={langId}
                        className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>{language?.nome}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLanguage(langId);
                          }}
                          className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  <div className="flex-1 flex items-center justify-end">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 stroke-current text-gray-400"
                      fill="none"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  {isDropdownOpen && (
                    <div
                      className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {linguagens
                        .filter(lang => !selectedLanguages.includes(lang.id))
                        .map((lang) => (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => {
                              handleLanguageChange({ target: { value: lang.id.toString() } } as any);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 text-gray-700"
                          >
                            {lang.nome}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Desenvolvedor</label>
                <select
                  name="desenvolvedor_id"
                  value={formData.desenvolvedor_id || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                >
                  <option value="">Selecione um desenvolvedor</option>
                  {desenvolvedores.map((desenvolvedor) => (
                    <option key={desenvolvedor.id} value={desenvolvedor.id}>{desenvolvedor.nome}</option>
                  ))}
                </select>
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Criticidade</label>
                <select
                  name="criticidade"
                  value={formData.criticidade || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                >
                  <option value="">Selecione a criticidade</option>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Responsável</label>
                <select
                  name="responsavel_id"
                  value={formData.responsavel_id || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                >
                  <option value="">Selecione um responsável</option>
                  {responsaveis.map((resp) => (
                    <option key={resp.id} value={resp.id}>{resp.nome}</option>
                  ))}
                </select>
              </div>
          
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id || ''}
                  onChange={handleInputChange}
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
                  ))}
                </select>
              </div>
          
              <div className="grid grid-cols-3 gap-6 col-span-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                    name="status_id"
                    value={formData.status_id || ''}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                    >
                    <option value="">Selecione um status</option>
                    {statusList.map((status) => (
                        <option key={status.id} value={status.id}>{status.nome}</option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Andamento (%)
                    </label>
                    <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-semibold text-blue-600">
                        {formData.andamento || '0'}%
                        </span>
                        <span className="text-sm text-gray-500">
                        {Number(formData.andamento) === 100
                            ? 'Concluído'
                            : Number(formData.andamento) > 0
                            ? 'Em andamento'
                            : 'Não iniciado'}
                        </span>
                    </div>
                    <div className="relative h-2">
                        <input
                        type="range"
                        name="andamento"
                        min="0"
                        max="100"
                        step="5"
                        value={formData.andamento || '0'}
                        onChange={handleInputChange}
                        className="slider-thumb absolute w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                        />
                        <style jsx global>{`
                        .slider-thumb::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 18px;
                            height: 18px;
                            background: #3b82f6;
                            cursor: pointer;
                            border-radius: 50%;
                            transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        }
                        .slider-thumb::-webkit-slider-thumb:hover {
                            background-color: #2563eb;
                            transform: scale(1.1);
                        }
                        .slider-thumb::-moz-range-thumb {
                            width: 18px;
                            height: 18px;
                            background: #3b82f6;
                            cursor: pointer;
                            border-radius: 50%;
                            border: none;
                            transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
                            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                        }
                        .slider-thumb::-moz-range-thumb:hover {
                            background-color: #2563eb;
                            transform: scale(1.1);
                        }
                        `}</style>
                        <div
                        className="absolute left-0 top-0 h-2 bg-blue-600 rounded-l-full transition-all duration-300"
                        style={{ width: `${formData.andamento || 0}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 px-1 pt-1.5">
                        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
                    </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Data Status</label>
                    <input
                    type="date"
                    name="data_status"
                    value={formData.data_status || ''}
                    onChange={handleInputChange}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-md text-gray-800 bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-colors"
                    />
                </div>
                </div>
            </div>
          
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                {isEditing ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}