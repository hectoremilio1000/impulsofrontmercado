import React from "react";
import { useParams } from "react-router-dom";

const CandidateExam = () => {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Examen del Candidato {id} Jose Ventura
      </h1>
      <form className="space-y-4">
        <div>
          <label>
            1. ¿Cómo manejas una situación donde no puedes cumplir un plazo?
          </label>
          <textarea className="w-full p-2 border rounded"></textarea>
        </div>

        <div>
          <label>
            2. Describe una situación en la que trabajaste en equipo y qué rol
            desempeñaste.
          </label>
          <textarea className="w-full p-2 border rounded"></textarea>
        </div>

        <div>
          <label>3. ¿Qué significa para ti la honestidad en el trabajo?</label>
          <textarea className="w-full p-2 border rounded"></textarea>
        </div>

        <div>
          <label>
            4. ¿Has llegado tarde a alguna cita importante? ¿Por qué?
          </label>
          <textarea className="w-full p-2 border rounded"></textarea>
        </div>

        <div>
          <label>
            5. ¿Cómo describirías tu carisma y cómo lo usas con los demás?
          </label>
          <textarea className="w-full p-2 border rounded"></textarea>
        </div>

        <div>
          <label>6. Resuelve este problema: 45 + 72 - 18 × 2 = ?</label>
          <input type="number" className="w-full p-2 border rounded" />
        </div>

        <div>
          <label>
            7. Traduce esta frase al inglés: "Me gustaría trabajar en su
            empresa".
          </label>
          <input type="text" className="w-full p-2 border rounded" />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
        >
          Enviar Examen
        </button>
      </form>
    </div>
  );
};

export default CandidateExam;
