// interface AuspostPostcodeSearchApiResponse {
//   localities: {
//     locality: [
//       {
//         category: string;
//         id: number;
//         latitude: number;
//         location: string;
//         longitude: number;
//         postcode: number;
//         state: string;
//       }
//     ];
//   };
// }
export interface ParsedResponseFromAusPost {
  location: string;
  state: string;
  postcode: number;
}
