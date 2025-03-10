CREATE DATABASE sistema;

CREATE TABLE trabajadores (

    id_trabajador VARCHAR(5) PRIMARY KEY,
    t_name VARCHAR(50) NOT NULL,
    t_apellido VARCHAR(50) NOT NULL,
    t_cedula VARCHAR(8) UNIQUE NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    

);

CREATE TABLE asistencias (

    id_a SERIAL PRIMARY KEY,
    id_trabajador VARCHAR(5) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id_trabajador) ON DELETE CASCADE


);

CREATE TABLE permisos (

    id_p SERIAL PRIMARY KEY,
    id_trabajador VARCHAR(5),
    motivo VARCHAR (255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id_trabajador) ON DELETE CASCADE
);

CREATE TABLE faltas (

    id_f SERIAL PRIMARY KEY,
    id_trabajador VARCHAR(5) NOT NULL,
    fecha DATE NOT NULL,
    FOREIGN KEY (id_trabajador) REFERENCES trabajadores(id_trabajador) ON DELETE CASCADE


);



CREATE TABLE login (


    c_id SERIAL PRIMARY KEY,
    c_name TEXT NOT NULL,
    c_password VARCHAR(25) NOT NULL,
    c_rol TEXT NOT NULL,
    c_root INT
);
