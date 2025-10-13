// import { NotaFiscal } from "../../types";

// // Mock de dados para notas
// const mockNotas: NotaFiscal[] = [
//   {
//     id: '1',
//     data_emissao: '03/03/2025',
//     cnpj_prestador: '12345678901234',
//     numero_nf: 123456789,
//     valor_total: 3293.29,
//     status: 'pendente',
//     motivos_pendencia: {
//       motivo: 'Api fora do ar'
//     }
//   },
//   {
//     id: '2',
//     data_emissao: '02/03/2025',
//     cnpj_prestador: '12345678901234',
//     numero_nf: 987654321,
//     valor_total: 1567.80,
//     status: 'em_processamento',
//     motivos_pendencia: {
//       motivo: '-'
//     }
//   }
// ];

// // Mock do serviço de notas para testes
// export const notasService = {
//   getNotas: jest.fn().mockResolvedValue({
//     data: mockNotas,
//     total: mockNotas.length,
//     page: 1,
//     limit: 10,
//     totalPages: 1
//   }),
  
//   getDashboardCounters: jest.fn().mockResolvedValue({
//     pendentes: 10,
//     emProcessamento: 5
//   }),
  
//   getNotaById: jest.fn().mockImplementation((id) => {
//     const nota = mockNotas.find(n => n.id === id);
//     return Promise.resolve(nota || null);
//   }),
  
//   getNotaPDF: jest.fn().mockResolvedValue({
//     url: 'https://exemplo.com/pdf'
//   }),
  
//   corrigirNota: jest.fn().mockResolvedValue(true)
// }; 