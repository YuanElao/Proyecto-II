-- Creación de la base de datos
CREATE DATABASE alcaldia;

-- Tabla de departamentos
CREATE TABLE departamento (
    id_departamento SERIAL PRIMARY KEY,
    d_name VARCHAR(50) NOT NULL
);

-- Tabla de cargos
CREATE TABLE cargo (
    id_cargo SERIAL PRIMARY KEY,
    c_name VARCHAR(50) NOT NULL,
    id_departamento INTEGER NOT NULL,
    
    FOREIGN KEY (id_departamento) 
        REFERENCES departamento(id_departamento)
);

-- Tabla de trabajadores (actualizada con relación a cargos)
CREATE TABLE trabajadores (
    id_trabajador VARCHAR(5) PRIMARY KEY,
    t_name VARCHAR(50) NOT NULL,
    t_apellido VARCHAR(50) NOT NULL,
    t_cedula VARCHAR(8) UNIQUE NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_cargo INTEGER,
    
    FOREIGN KEY (id_cargo) 
        REFERENCES cargo(id_cargo)
);

-- Tabla de asistencias
CREATE TABLE asistencias (
    id_a SERIAL PRIMARY KEY,
    id_trabajador VARCHAR(5) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    
    FOREIGN KEY (id_trabajador) 
        REFERENCES trabajadores(id_trabajador) 
        ON DELETE CASCADE
);

-- Tabla de permisos
CREATE TABLE permisos (
    id_p SERIAL PRIMARY KEY,
    id_trabajador VARCHAR(5),
    motivo VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    
    FOREIGN KEY (id_trabajador) 
        REFERENCES trabajadores(id_trabajador) 
        ON DELETE CASCADE
);

-- Tabla de faltas
CREATE TABLE faltas (
    id_f SERIAL PRIMARY KEY,
    id_trabajador VARCHAR(5) NOT NULL,
    fecha DATE NOT NULL,
    
    FOREIGN KEY (id_trabajador) 
        REFERENCES trabajadores(id_trabajador) 
        ON DELETE CASCADE
);

-- Tabla de login
CREATE TABLE login (
    c_id SERIAL PRIMARY KEY,
    c_name TEXT NOT NULL,
    c_password VARCHAR(25) NOT NULL,
    c_rol TEXT NOT NULL,
    c_root INT
);
