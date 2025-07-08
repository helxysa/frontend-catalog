'use client'
import { useEffect, useState, useMemo, useCallback } from 'react';
import {getSolucoes} from '../../actions/actions'
import FormPrincipal from '../Form/FormPrincipal'

export default function Table() {
    const [criarSolucao, setCriarSolucao] = useState(false)
    

    const toggleModal =  () => {
        setCriarSolucao(prev => !prev);
    };




    return (
        <>
            <div>
                <button
                    onClick={toggleModal}
                    type='button'
                    className='bg-blue-600 rounded-md m-5 p-2 text-white'
                >
                    {criarSolucao ? ('Criar Solucao') : 'Fechar'}
                </button>

                <div>
                    {criarSolucao ? (<>
                        <FormPrincipal></FormPrincipal>
                    </>) : <>
                        teste tabela 

                    </>}
                    <>
                    teste
                    tes
                    
                    tesasdadadasdadadadadsadsadasdasdadsadsadasda 
                    teste
                    tes
                    
                    tesasdadadasdadadadadsadsadasdasdadsadsadasda 
                    teste
                    tes
                    
                    tesasdadadasdadadadadsadsadasdasdadsadsadasda 
                    teste
                    tes
                    
                    tesasdadadasdadadadadsadsadasdasdadsadsadasda 
                    teste
                    tes
                    
                    tesasdadadasdadadadadsadsadasdasdadsadsadasda 
                    v
                    te</>
                </div>
            </div>
        </>
    )
}