import 'styles/page-elements/ConfirmDialog.css';

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";


// variables globales para acceso desde la función externa
let answer;
let showDialog;

function ConfirmDialog() {
    const [message, setMessage] = useState(null);



    // al crear el diálogo
    useEffect(() => {
        // función principal
        showDialog = (msg) => {
            setMessage(msg); // actualiza el mensaje
            return new Promise((resolve) => {
                answer = resolve;
            });
        };
    }, []);

    // función que se ejecuta al hacer click en uno de los botones
    const handleClick = (result) => {
        setMessage(null);
        answer(result);
    };

    if (!message) return null;

    return ReactDOM.createPortal(
        <div className="confirm-dialog-background">
            <div className="confirm-dialog">
                <p>{message}</p>
                <div className="buttons">
                    <button className="confirm-btn" onClick={() => handleClick(true)}>Confirmar</button>
                    <button className="cancel-btn" onClick={() => handleClick(false)}>Cancelar</button>
                </div>
            </div>
        </div>,
        document.body
    );
}

// función para usar el modal desde otras páginas
// llama y ejecuta la función global showDialog
export const confirm = (message) => {
  if (showDialog) return showDialog(message);
  return Promise.resolve(false);
};

export default ConfirmDialog;
