// file: src/pages/testUpload/TestUpload.jsx
import React, { useState } from "react";
import axios from "axios";

function TestUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  // Cuando selecciones el archivo en <input type="file" />
  const handleFileChange = (event) => {
    // Obtenemos el primer archivo seleccionado
    const file = event.target.files?.[0];
    setSelectedFile(file);
  };

  // Función para enviar a /api/testupload
  const handleTestUpload = async () => {
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    // Construir FormData
    const fd = new FormData();
    fd.append("testfile", selectedFile);
    console.log("FormData (testfile) =>", selectedFile);

    try {
      // Llamar al endpoint
      const response = await axios.post(
        "http://localhost:3333/api/testupload",
        fd,
        {
          // No forzar Content-Type, deja que Axios ponga boundary
          headers: {
            // si necesitas Auth:
            // Authorization: `Bearer <TU_TOKEN>`,
          },
        }
      );
      console.log("response =>", response.data);
    } catch (error) {
      console.error("Error testupload =>", error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Test Upload</h2>
      <p>Selecciona un archivo y dale click al botón</p>
      <input type="file" onChange={handleFileChange} />
      <br />
      <button onClick={handleTestUpload} style={{ marginTop: 10 }}>
        Subir a /api/testupload
      </button>
    </div>
  );
}

export default TestUpload;
