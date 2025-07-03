"use client";

import { Demanda } from "../../types/types";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { UserActions } from "./UserActions";

interface TableProps {
  data: Demanda[];
  meta?: any; 
  onUpdate: () => void;
}

export function Table({ data, meta, onUpdate }: TableProps) {


  const columns: ColumnDef<Demanda>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.original.id ?? "N/A",
      enableSorting: true,
    },
    {
      accessorKey: "nome",
      header: "Nome",
      enableSorting: true,
      enableColumnFilter: true,
    },
    {
      accessorKey: "sigla",
      header: "Sigla",
      cell: ({ row }) => row.original.sigla ?? "N/A",
    },
    {
      accessorKey: "fatorGerador",
      header: "Fator Gerador",
      cell: ({ row }) => {
        return row.original.fatorGerador || "N/A";
      },
    },
    {
      accessorKey: "demandante",
      header: "Demandante",
      cell: ({ row }) => row.original.demandante ?? "N/A",
    },
    {
      accessorKey: "alinhamento",
      header: "Alinhamento",
      cell: ({ row }) => row.original.alinhamento?.nome ?? "N/A",
    },
    {
      accessorKey: "prioridade",
      header: "Prioridade",
      cell: ({ row }) => row.original.prioridade?.nome ?? "N/A",
    },
    {
      accessorKey: "dataStatus",
      header: "Data Status",
      cell: ({ row }) => {
        const dataStatus = row.original.dataStatus;
        if (!dataStatus) return "N/A";
        try {
          return new Date(dataStatus).toLocaleDateString('pt-BR');
        } catch (error) {
          console.error("Erro ao formatar data:", error);
          return dataStatus || "N/A";
        }
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => row.original.status?.nome ?? "N/A",
      enableSorting: true,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const status = row.original.status;
        return status?.nome === filterValue;
      }
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        return <UserActions demandaId={row.original.id} onUpdate={onUpdate} />;
      },
    },
  ];

  return <DataTable columns={columns} data={data} />;
}