import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";

const { TextArea } = Input;
const { Option } = Select;

/**
 * Modal genérico para:
 *   - mode = "view"   → solo lectura
 *   - mode = "edit"   → editar manual existente
 *   - mode = "create" → crear nuevo manual
 *
 * Props
 * -------
 *  visible          : boolean
 *  mode             : "view" | "edit" | "create"
 *  manual           : objeto manual (puede ser null)
 *  positions        : [{id, nombre}, ...]
 *  onCancel()       : cerrar modal
 *  onSave(values)   : callback con valores (edit/create)
 */
export default function ManualModal({
  visible,
  mode = "view",
  manual,
  positions = [],
  onCancel,
  onSave,
}) {
  const [form] = Form.useForm();
  const isView = mode === "view";

  /* -------------------------------------------------------------------- */
  /*  Sincronizar datos cuando cambia manual o modo                        */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && manual) {
      form.setFieldsValue({
        title: manual.title,
        content: manual.content,
        positionId: manual.position?.id,
      });
    } else {
      form.resetFields();
    }
  }, [manual, mode, form]);

  /* -------------------------------------------------------------------- */
  /*  OK del modal                                                        */
  /* -------------------------------------------------------------------- */
  const handleOk = async () => {
    if (isView) {
      onCancel();
      return;
    }
    try {
      const values = await form.validateFields();
      onSave(values); // delegamos al padre
    } catch {
      /* antd ya muestra los errores */
    }
  };

  /* -------------------------------------------------------------------- */
  /*  Render                                                              */
  /* -------------------------------------------------------------------- */
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={isView ? "Cerrar" : "Guardar"}
      title={
        mode === "create"
          ? "Nuevo Manual"
          : mode === "edit"
          ? `Editar Manual #${manual?.id}`
          : manual?.title
      }
      width={600}
    >
      {isView ? (
        /* --------------------  SOLO LECTURA -------------------- */
        <div style={{ whiteSpace: "pre-wrap" }}>
          <p>
            <strong>ID:</strong> {manual?.id ?? "-"}
          </p>
          <p>
            <strong>Puesto:</strong>{" "}
            {manual?.position ? manual.position.nombre : "Sin puesto"}
          </p>
          <p>
            <strong>Contenido:</strong>
          </p>
          {manual?.content}
        </div>
      ) : (
        /* --------------------  FORM EDIT / CREATE --------------- */
        <Form layout="vertical" form={form}>
          <Form.Item
            name="title"
            label="Título"
            rules={[{ required: true, message: "Ingresa el título" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="positionId" label="Puesto">
            <Select placeholder="Selecciona el puesto" allowClear>
              {positions.map((p) => (
                <Option key={p.id} value={p.id}>
                  {p.nombre}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Contenido"
            rules={[{ required: true, message: "Ingresa el contenido" }]}
          >
            <TextArea rows={6} />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
