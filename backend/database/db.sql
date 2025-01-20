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
    fecha DATE NOT NULL,
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


CREATE TABLE auditoria (


    id_log SERIAL PRIMARY KEY,
    accion VARCHAR(50) NOT NULL,
    detalles TEXT,
    id_actor VARCHAR(5),
    fecha_hora_log TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP




);

CREATE TABLE login (


    id_cuentas SERIAL PRIMARY KEY,
    cuentasName TEXT NOT NULL,
    llave VARCHAR(25) NOT NULL,
    rol TEXT NOT NULL
);

INSERT INTO login(c_name, c_password, c_rol) VALUES ('administrador', '#204lc4ld14', 'admin' ), ('usuario', 'presu25','user');