import React, { useState } from "react";

import axios from "axios";



function App() {

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [phone, setPhone] = useState("");



    const handleSubmit = (event) => {

        event.preventDefault();

        axios

            .post("http://localhost:3000/usuarios", {

                name,

                email,

                phone,

            })

            .then(() => alert("Datos enviados con éxito"))

            .catch(() => alert("Error al enviar los datos"));

    };



    return (

        <div>

            <h1>Conectar React con Node/Express</h1>

            <form onSubmit={handleSubmit}>

                <label>

                    Nombre:

                    <input

                        type="text"

                        value={name}

                        onChange={(e) => setName(e.target.value)}

                    />

                </label>

                <label>

                    Correo electrónico:

                    <input

                        type="email"

                        value={email}

                        onChange={(e) => setEmail(e.target.value)}

                    />

                </label>

                <label>

                    Teléfono:

                    <input

                        type="tel"

                        value={phone}

                        onChange={(e) => setPhone(e.target.value)}

                    />

                </label>

                <button type="submit">Enviar</button>

            </form>

        </div>

    );

}



export default App;
