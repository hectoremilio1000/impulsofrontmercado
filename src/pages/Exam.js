// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";

// const Exam = () => {
//   const [searchParams] = useSearchParams();
//   console.log(searchParams);
//   const apiUrl = process.env.REACT_APP_API_URL;
//   // Obtener los parámetros individuales
//   const typeExamen = searchParams.get("type_examen"); // "Psicosometricos"
//   const puesto = searchParams.get("puesto"); // "mozo"
//   const [preguntasPsicosometricas, setPreguntasPsicosometricas] = useState([]);
//   const [respuestas, setRespuestas] = useState([]);
//   const opciones = [
//     { opcion: "a", label: "option_a" },
//     { opcion: "b", label: "option_b" },
//     { opcion: "c", label: "option_c" },
//     { opcion: "d", label: "option_d" },
//     { opcion: "e", label: "option_e" },
//   ];
//   const handleRespuesta = (preguntaId, respuestaSeleccionada) => {
//     if (respuestas[preguntaId]) return; // Evitar seleccionar de nuevo

//     setRespuestas((prev) => ({
//       ...prev,
//       [preguntaId]: { seleccionada: respuestaSeleccionada },
//     }));
//   };
//   useEffect(() => {
//     const buscar_preguntas_psicosometricas = async () => {
//       try {
//         const response = await axios.get(
//           `${apiUrl}/examsQuery?type_exam=${typeExamen}&&puesto=${puesto}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         console.log(response);
//         const data = response.data;
//         console.log(data);
//         if (data.status === "success") {
//           setBusiness(data.data);
//           setFilterBusiness(data.data);
//         } else {
//           console.log(response.data.message);
//         }
//       } catch (error) {
//         console.error("Error al obtener los modulos:", error);
//       }
//     };
//     buscar_preguntas_psicosometricas();
//   }, []);

//   return (
//     <div className="p-12 max-w-[1080px] mx-auto w-full">
//       <h1 className="text-3xl font-bold">Examen</h1>
//       <h2 className="text-4xl font-bold">Preguntas Psicométricas</h2>
//       <div className="w-full">
//         <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4">
//           <div className="w-full p-4 bg-gray-200 rounded">
//             <label htmlFor="">
//               1. ¿Qué harías si encuentras dinero tirado?
//             </label>
//           </div>
//         </div>
//       </div>
//       {preguntasPsicosometricas.map((pregunta, index) => (
//         <div
//           key={pregunta.id}
//           style={{
//             marginBottom: "20px",
//             padding: "15px",
//             border: "1px solid #ccc",
//             borderRadius: "8px",
//             backgroundColor: "#f8f9fa",
//           }}
//         >
//           <h3>
//             {index + 1}. {pregunta.text}
//           </h3>
//           {opciones.map((o) => (
//             <button
//               key={o.opcion}
//               onClick={() => handleRespuesta(pregunta.id, o.label)}
//               disabled={!!respuestas[pregunta.id]} // Deshabilitar después de seleccionar
//               style={{
//                 display: "block",
//                 marginBottom: "10px",
//                 padding: "10px",
//                 borderRadius: "5px",
//                 border: "1px solid #ccc",
//                 backgroundColor:
//                   respuestas[pregunta.id]?.seleccionada === o.label
//                     ? "#d4edda"
//                     : "#fff",
//                 cursor: respuestas[pregunta.id] ? "not-allowed" : "pointer",
//               }}
//             >
//               {pregunta[o.label]}
//             </button>
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Exam;
