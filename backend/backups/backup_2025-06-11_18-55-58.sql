--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-06-11 18:56:49

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS alcaldia;
--
-- TOC entry 4880 (class 1262 OID 16386)
-- Name: alcaldia; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE alcaldia WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Venezuela.1252';


\connect alcaldia

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4881 (class 0 OID 0)
-- Name: alcaldia; Type: DATABASE PROPERTIES; Schema: -; Owner: -
--

ALTER DATABASE alcaldia CONNECTION LIMIT = 2;


\connect alcaldia

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 232 (class 1255 OID 16548)
-- Name: actualizar_departamento_por_cargo(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.actualizar_departamento_por_cargo() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE trabajadores
    SET id_departamento = NEW.id_departamento
    WHERE id_cargo = NEW.id_cargo;
    RETURN NEW;
END;
$$;


--
-- TOC entry 233 (class 1255 OID 16550)
-- Name: sincronizar_departamento_al_cambiar_cargo(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sincronizar_departamento_al_cambiar_cargo() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.id_departamento = (
        SELECT id_departamento 
        FROM cargo 
        WHERE id_cargo = NEW.id_cargo
    );
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16425)
-- Name: asistencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.asistencias (
    id_a integer NOT NULL,
    id_trabajador character varying(5) NOT NULL,
    fecha date NOT NULL,
    hora time without time zone NOT NULL
);


--
-- TOC entry 218 (class 1259 OID 16424)
-- Name: asistencias_id_a_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.asistencias_id_a_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4882 (class 0 OID 0)
-- Dependencies: 218
-- Name: asistencias_id_a_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.asistencias_id_a_seq OWNED BY public.asistencias.id_a;


--
-- TOC entry 223 (class 1259 OID 16456)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auditoria (
    id_log integer NOT NULL,
    accion character varying(50) NOT NULL,
    detalles text,
    id_actor character varying(5),
    fecha_hora_log timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 222 (class 1259 OID 16455)
-- Name: auditoria_id_log_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.auditoria_id_log_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 222
-- Name: auditoria_id_log_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.auditoria_id_log_seq OWNED BY public.auditoria.id_log;


--
-- TOC entry 231 (class 1259 OID 16511)
-- Name: cargo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cargo (
    id_cargo integer NOT NULL,
    c_name character varying(50) NOT NULL,
    id_departamento integer NOT NULL
);


--
-- TOC entry 230 (class 1259 OID 16510)
-- Name: cargo_id_cargo_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cargo_id_cargo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4884 (class 0 OID 0)
-- Dependencies: 230
-- Name: cargo_id_cargo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cargo_id_cargo_seq OWNED BY public.cargo.id_cargo;


--
-- TOC entry 229 (class 1259 OID 16502)
-- Name: departamento; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departamento (
    id_departamento integer NOT NULL,
    d_name character varying(50) NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 16501)
-- Name: departamento_id_departamento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departamento_id_departamento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4885 (class 0 OID 0)
-- Dependencies: 228
-- Name: departamento_id_departamento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departamento_id_departamento_seq OWNED BY public.departamento.id_departamento;


--
-- TOC entry 227 (class 1259 OID 16485)
-- Name: faltas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faltas (
    id_f integer NOT NULL,
    id_trabajador character varying(5) NOT NULL,
    fecha date NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 16484)
-- Name: faltas_id_f_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.faltas_id_f_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4886 (class 0 OID 0)
-- Dependencies: 226
-- Name: faltas_id_f_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.faltas_id_f_seq OWNED BY public.faltas.id_f;


--
-- TOC entry 225 (class 1259 OID 16476)
-- Name: login; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.login (
    c_id integer NOT NULL,
    c_name text NOT NULL,
    c_password character varying(25) NOT NULL,
    c_rol text NOT NULL,
    c_root integer,
    CONSTRAINT chk_root CHECK ((c_root = ANY (ARRAY[0, 1])))
);


--
-- TOC entry 224 (class 1259 OID 16475)
-- Name: login_c_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.login_c_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 224
-- Name: login_c_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.login_c_id_seq OWNED BY public.login.c_id;


--
-- TOC entry 221 (class 1259 OID 16444)
-- Name: permisos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permisos (
    id_p integer NOT NULL,
    id_trabajador character varying(5),
    motivo character varying(255) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 16443)
-- Name: permisos_id_p_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.permisos_id_p_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 220
-- Name: permisos_id_p_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.permisos_id_p_seq OWNED BY public.permisos.id_p;


--
-- TOC entry 217 (class 1259 OID 16416)
-- Name: trabajadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trabajadores (
    id_trabajador character varying(5) NOT NULL,
    t_name character varying(50) NOT NULL,
    t_apellido character varying(50) NOT NULL,
    t_cedula character varying(8) NOT NULL,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    id_cargo integer,
    id_departamento integer
);


--
-- TOC entry 4678 (class 2604 OID 16428)
-- Name: asistencias id_a; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencias ALTER COLUMN id_a SET DEFAULT nextval('public.asistencias_id_a_seq'::regclass);


--
-- TOC entry 4680 (class 2604 OID 16459)
-- Name: auditoria id_log; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id_log SET DEFAULT nextval('public.auditoria_id_log_seq'::regclass);


--
-- TOC entry 4685 (class 2604 OID 16514)
-- Name: cargo id_cargo; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargo ALTER COLUMN id_cargo SET DEFAULT nextval('public.cargo_id_cargo_seq'::regclass);


--
-- TOC entry 4684 (class 2604 OID 16505)
-- Name: departamento id_departamento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento ALTER COLUMN id_departamento SET DEFAULT nextval('public.departamento_id_departamento_seq'::regclass);


--
-- TOC entry 4683 (class 2604 OID 16488)
-- Name: faltas id_f; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faltas ALTER COLUMN id_f SET DEFAULT nextval('public.faltas_id_f_seq'::regclass);


--
-- TOC entry 4682 (class 2604 OID 16479)
-- Name: login c_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login ALTER COLUMN c_id SET DEFAULT nextval('public.login_c_id_seq'::regclass);


--
-- TOC entry 4679 (class 2604 OID 16447)
-- Name: permisos id_p; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id_p SET DEFAULT nextval('public.permisos_id_p_seq'::regclass);


--
-- TOC entry 4862 (class 0 OID 16425)
-- Dependencies: 219
-- Data for Name: asistencias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.asistencias (id_a, id_trabajador, fecha, hora) FROM stdin;
27	A8E0B	2025-05-11	02:40:52.40939
28	69097	2025-05-28	09:40:15.5378
32	3318E	2025-02-03	09:05:21.522385
33	3318E	2025-02-04	09:05:50.99892
34	EC0FD	2025-02-04	09:33:42.028644
35	A8E0B	2025-06-19	11:53:03.978093
36	A8E0B	2025-04-03	11:56:33.704416
37	A8E0B	2025-03-12	11:57:01.350182
38	A8E0B	2025-09-18	11:58:27.472542
39	A8E0B	2025-11-13	11:59:29.957494
40	A8E0B	2025-06-11	04:40:13.938011
\.


--
-- TOC entry 4866 (class 0 OID 16456)
-- Dependencies: 223
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.auditoria (id_log, accion, detalles, id_actor, fecha_hora_log) FROM stdin;
\.


--
-- TOC entry 4874 (class 0 OID 16511)
-- Dependencies: 231
-- Data for Name: cargo; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cargo (id_cargo, c_name, id_departamento) FROM stdin;
3	Director	12
2	Secretario	12
4	Administrador	9
10	12312	12
11	1221	14
\.


--
-- TOC entry 4872 (class 0 OID 16502)
-- Dependencies: 229
-- Data for Name: departamento; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departamento (id_departamento, d_name) FROM stdin;
9	Planificacion y Presupuesto
12	Mantenimiento
13	asdas1
14	as1
15	assd2
16	asd23
18	ada11
19	asca1
20	11
17	pepe
21	12312
\.


--
-- TOC entry 4870 (class 0 OID 16485)
-- Dependencies: 227
-- Data for Name: faltas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.faltas (id_f, id_trabajador, fecha) FROM stdin;
79	EC0FD	2025-02-05
81	A8E0B	2025-06-10
80	A8E0B	2025-06-10
82	A8E0B	2025-05-15
83	A8E0B	2025-02-12
84	A8E0B	2025-10-16
85	A8E0B	2025-12-16
\.


--
-- TOC entry 4868 (class 0 OID 16476)
-- Dependencies: 225
-- Data for Name: login; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.login (c_id, c_name, c_password, c_rol, c_root) FROM stdin;
1	administrador	#204lc4ld14	admin	1
14	pepepepe	pepepepe	admin	0
15	secretario	12345	user	0
16	medmemdm	medmemdme	user	0
17	fabolaspe	fabola	user	0
18	fabolaspetti	asdasdsadsak	user	0
19	fabolascommplete	fabolascomplete	user	0
\.


--
-- TOC entry 4864 (class 0 OID 16444)
-- Dependencies: 221
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.permisos (id_p, id_trabajador, motivo, fecha_inicio, fecha_fin) FROM stdin;
17	EC0FD	so	2025-02-06	2025-02-12
19	A8E0B	sipi	2025-07-08	2025-08-22
20	A8E0B	sisi	2025-05-23	2025-05-25
21	A8E0B	sese	2025-01-16	2025-01-16
\.


--
-- TOC entry 4860 (class 0 OID 16416)
-- Dependencies: 217
-- Data for Name: trabajadores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.trabajadores (id_trabajador, t_name, t_apellido, t_cedula, fecha_registro, id_cargo, id_departamento) FROM stdin;
3B4F8	Miguel	Mata	31043979	2024-12-28 02:52:01.187335	\N	\N
A39A2	Daniel	Zacarias	30078026	2025-01-25 01:03:55.942605	\N	\N
8712B	Daniel	Malave	31157305	2025-03-09 05:02:23.170569	\N	\N
587A3	Juan	Garcia	31043254	2024-12-28 02:26:59.689275	\N	\N
6A435	Juan	Perez	29259239	2025-03-18 07:13:51.010291	\N	\N
09D29	Gustavo	Lanza	30000000	2025-03-19 00:46:47.099305	\N	\N
EB913	Pepe	Alcoli	19442390	2025-03-20 04:08:46.306902	3	12
A6162	Rafael	Andrade	29283574	2025-03-23 07:56:05.793077	3	12
69097	Pedrito	Salinas	19320443	2025-04-13 09:31:17.009088	3	12
98C93	Ignacio	Sifon	19238433	2025-03-22 11:27:01.341381	2	12
2C6D9	Pablito	Pabloso	13909221	2025-04-20 09:32:39.778965	2	12
167FC	Juan	Padron	93192023	2025-04-08 08:14:59.451216	4	9
93AF9	Pepito	Padrito	92328323	2025-05-03 05:41:13.609213	3	12
8F26E	Kuai	Liang	32183183	2025-04-02 09:11:56.654995	4	9
54D9F	Pepito	Pedritone	1020209	2025-05-28 00:21:07.367127	2	12
3318E	Juan	Juan	29327123	2025-05-28 00:34:30.920081	2	12
E8A3F	Zacarias	Zacarias	9999999	2025-05-28 00:37:08.173453	2	12
1EDD9	Pepepe	Pepepe	1234	2025-05-28 00:47:37.701573	2	12
71D95	Pepito	Pepitoto	11111111	2025-05-28 01:03:58.659639	4	9
C3D38	Merequete	Merequete	12345	2025-05-28 01:08:11.839865	3	12
F166C	Parito	Parito	22222	2025-05-28 01:10:04.982934	3	12
9CFF7	Juanci	Juanci	123456	2025-05-28 01:15:41.162624	3	12
DD125	Porco	Porco	1932483	2025-05-28 05:52:17.39416	3	12
AD775	Mepisto	Mepisto	98765432	2025-05-28 06:04:28.892461	3	12
A8E0B	Chavit	Del	1000000	2025-04-16 05:06:18.503142	3	12
66DBB	Juan	Garcia	123121	2025-05-28 09:30:19.756052	3	12
A4B99	  juan	Carlos	2221	2025-05-28 11:24:01.834907	3	12
EC0FD	Juan	Garcia	1231232	2025-05-28 12:06:59.088447	4	9
\.


--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 218
-- Name: asistencias_id_a_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.asistencias_id_a_seq', 40, true);


--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 222
-- Name: auditoria_id_log_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.auditoria_id_log_seq', 1, false);


--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 230
-- Name: cargo_id_cargo_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cargo_id_cargo_seq', 11, true);


--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 228
-- Name: departamento_id_departamento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departamento_id_departamento_seq', 21, true);


--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 226
-- Name: faltas_id_f_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.faltas_id_f_seq', 85, true);


--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 224
-- Name: login_c_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.login_c_id_seq', 19, true);


--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 220
-- Name: permisos_id_p_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.permisos_id_p_seq', 21, true);


--
-- TOC entry 4692 (class 2606 OID 16430)
-- Name: asistencias asistencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_pkey PRIMARY KEY (id_a);


--
-- TOC entry 4696 (class 2606 OID 16464)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id_log);


--
-- TOC entry 4706 (class 2606 OID 16516)
-- Name: cargo cargo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargo
    ADD CONSTRAINT cargo_pkey PRIMARY KEY (id_cargo);


--
-- TOC entry 4702 (class 2606 OID 16533)
-- Name: departamento departamento_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_nombre_key UNIQUE (d_name);


--
-- TOC entry 4704 (class 2606 OID 16507)
-- Name: departamento departamento_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departamento
    ADD CONSTRAINT departamento_pkey PRIMARY KEY (id_departamento);


--
-- TOC entry 4700 (class 2606 OID 16490)
-- Name: faltas faltas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faltas
    ADD CONSTRAINT faltas_pkey PRIMARY KEY (id_f);


--
-- TOC entry 4698 (class 2606 OID 16483)
-- Name: login login_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.login
    ADD CONSTRAINT login_pkey PRIMARY KEY (c_id);


--
-- TOC entry 4694 (class 2606 OID 16449)
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id_p);


--
-- TOC entry 4688 (class 2606 OID 16421)
-- Name: trabajadores trabajadores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT trabajadores_pkey PRIMARY KEY (id_trabajador);


--
-- TOC entry 4690 (class 2606 OID 16423)
-- Name: trabajadores trabajadores_t_cedula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT trabajadores_t_cedula_key UNIQUE (t_cedula);


--
-- TOC entry 4714 (class 2620 OID 16549)
-- Name: cargo trigger_actualizar_cargo; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_cargo AFTER UPDATE OF id_departamento ON public.cargo FOR EACH ROW EXECUTE FUNCTION public.actualizar_departamento_por_cargo();


--
-- TOC entry 4713 (class 2620 OID 16551)
-- Name: trabajadores trigger_sincronizar_cargo; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_sincronizar_cargo BEFORE INSERT OR UPDATE OF id_cargo ON public.trabajadores FOR EACH ROW EXECUTE FUNCTION public.sincronizar_departamento_al_cambiar_cargo();


--
-- TOC entry 4709 (class 2606 OID 16431)
-- Name: asistencias asistencias_id_trabajador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.asistencias
    ADD CONSTRAINT asistencias_id_trabajador_fkey FOREIGN KEY (id_trabajador) REFERENCES public.trabajadores(id_trabajador) ON DELETE CASCADE;


--
-- TOC entry 4712 (class 2606 OID 16517)
-- Name: cargo cargo_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cargo
    ADD CONSTRAINT cargo_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamento(id_departamento) ON DELETE CASCADE;


--
-- TOC entry 4711 (class 2606 OID 16491)
-- Name: faltas faltas_id_trabajador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faltas
    ADD CONSTRAINT faltas_id_trabajador_fkey FOREIGN KEY (id_trabajador) REFERENCES public.trabajadores(id_trabajador) ON DELETE CASCADE;


--
-- TOC entry 4710 (class 2606 OID 16450)
-- Name: permisos permisos_id_trabajador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_id_trabajador_fkey FOREIGN KEY (id_trabajador) REFERENCES public.trabajadores(id_trabajador) ON DELETE CASCADE;


--
-- TOC entry 4707 (class 2606 OID 16527)
-- Name: trabajadores trabajadores_id_cargo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT trabajadores_id_cargo_fkey FOREIGN KEY (id_cargo) REFERENCES public.cargo(id_cargo) ON DELETE SET NULL;


--
-- TOC entry 4708 (class 2606 OID 16543)
-- Name: trabajadores trabajadores_id_departamento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trabajadores
    ADD CONSTRAINT trabajadores_id_departamento_fkey FOREIGN KEY (id_departamento) REFERENCES public.departamento(id_departamento) ON DELETE SET NULL;


-- Completed on 2025-06-11 18:57:50

--
-- PostgreSQL database dump complete
--

