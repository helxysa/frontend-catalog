import { updateSolucoesSemProprietario } from '../actions/actions';

export default function UpdateSolucoesButton() {
  const handleClick = async () => {
    const confirmUpdate = window.confirm('Tem certeza que deseja atualizar todas as soluções sem proprietário?');
    
    if (confirmUpdate) {
      try {
        const result = await updateSolucoesSemProprietario();
        if (result) {
          alert(`Sucesso! ${result.quantidade} soluções foram atualizadas.`);
        }
      } catch (error: any) {
        alert('Erro ao atualizar soluções: ' + error.message);
      }
    }
  };

  return (
    <button 
      onClick={handleClick}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Atualizar Soluções sem Proprietário
    </button>
  );
} 