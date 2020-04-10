-- phpMyAdmin SQL Dump
-- version 4.8.0
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 27-02-2020 a las 13:00:07
-- Versión del servidor: 10.1.31-MariaDB
-- Versión de PHP: 7.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `articulos`
--
DROP DATABASE IF EXISTS `articulos`;

CREATE DATABASE IF NOT EXISTS `articulos` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `articulos`;

GRANT ALL PRIVILEGES ON articulos.* to 'pcw'@127.0.0.1 identified by 'pcw';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `articulo`
--

DROP TABLE IF EXISTS `articulo`;
CREATE TABLE `articulo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(300) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `veces_visto` int(11) NOT NULL DEFAULT '0',
  `id_categoria` int(11) NOT NULL,
  `vendedor` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `articulo`
--

INSERT INTO `articulo` (`id`, `nombre`, `descripcion`, `precio`, `fecha`, `veces_visto`, `id_categoria`, `vendedor`) VALUES
(1, 'Portátil MacBook Pro', 'Portátil Mac Book Pro de 2017. Muy buen estado. Tiene Touch Bar y lector de huellas dactilares.\r\nPantalla: de 15,4 pulgadas.\r\nProcesador: Intel Core i7 3.1 GHz\r\nRAM: 16 GB\r\nDisco duro: SSD 500GB.\r\nPuertos: 4 puertos USB tipo C y Thunderbolt 3.', '1700.00', '2020-02-27 11:15:23', 94, 1, 'usuario3'),
(2, 'Memoria para Mac Book Pro', 'Dos módulos DDR3 a 1600 MHz, de 2GB cada uno', '30.00', '2020-02-27 11:13:36', 15, 1, 'usuario3'),
(3, 'Bicicleta MTB Btwin', 'Bicicleta Montaña Btwin Rockrider 340<br>\r\nAmortiguación delantera y trasera<br>\r\n21 velocidades (7 coronas x 3 platos)<br>\r\nMuy bien cuidada.<br>\r\nRuedas de 26\"<br>\r\nTalla 59', '140.00', '2020-02-27 11:37:06', 145, 6, 'usuario2'),
(28, 'Nintendo Switch', 'Vendo Nintendo Switch de 2019, con todos sus accesorios y 4 juegos.<br>\r\nEstá en perfecto estado. Muy bien cuidada y muy poco uso. La batería dura más de 5 horas.<br>\r\nAdemás, regalo funda con accesorios para su transporte.', '275.00', '2020-02-27 11:58:55', 5, 1, 'usuario1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id`, `nombre`) VALUES
(1, 'Electrónica'),
(2, 'Ropa'),
(3, 'Hogar'),
(4, 'Vehículos'),
(5, 'Inmobiliaria'),
(6, 'Deporte'),
(7, 'Calzado'),
(8, 'Complementos ropa'),
(13, 'Restauración');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `foto`
--

DROP TABLE IF EXISTS `foto`;
CREATE TABLE `foto` (
  `id` int(11) NOT NULL,
  `fichero` varchar(200) DEFAULT NULL,
  `id_articulo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `foto`
--

INSERT INTO `foto` (`id`, `fichero`, `id_articulo`) VALUES
(1, '1.jpg', 1),
(2, '2.jpg', 1),
(3, '3.jpg', 1),
(4, '4.jpg', 2),
(5, '5.jpg', 3),
(6, '6.jpg', 3),
(21, '21.jpg', 28),
(22, '22.jpg', 28),
(23, '23.jpg', 28);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pregunta`
--

DROP TABLE IF EXISTS `pregunta`;
CREATE TABLE `pregunta` (
  `id` int(11) NOT NULL,
  `login` varchar(20) NOT NULL,
  `id_articulo` int(11) NOT NULL,
  `pregunta` varchar(300) NOT NULL,
  `respuesta` varchar(300) DEFAULT NULL,
  `fecha_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `pregunta`
--

INSERT INTO `pregunta` (`id`, `login`, `id_articulo`, `pregunta`, `respuesta`, `fecha_hora`) VALUES
(1, 'usuario1', 3, '¿Me podrías decir de qué año es?', NULL, '2020-02-06 11:54:03'),
(2, 'usuario5', 1, '¿La batería en qué estado está? ¿cuanto dura?', 'Está en buen estado. La duración depende del uso que le des, pero para un trabajo normal te puede durar 5 horas fácilmente', '2020-02-06 11:58:13'),
(3, 'usuario2', 2, '¿Cuánto tiempo de uso tienen?', 'Las he tenido puestas en el ordenador cerca de un año y no me han dado problemas.', '2020-02-06 11:58:13'),
(8, 'usuario4', 28, '¿Me puedes decir qué cuatro juegos son?\r\nNo vaya a ser que te la compre y no me gusten los juegos.', NULL, '2020-02-27 11:47:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `siguiendo`
--

DROP TABLE IF EXISTS `siguiendo`;
CREATE TABLE `siguiendo` (
  `login` varchar(20) NOT NULL,
  `id_articulo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `siguiendo`
--

INSERT INTO `siguiendo` (`login`, `id_articulo`) VALUES
('usuario1', 1),
('usuario1', 2),
('usuario1', 3),
('usuario2', 1),
('usuario2', 3),
('usuario3', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `login` varchar(20) NOT NULL,
  `pwd` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `foto` varchar(250) DEFAULT NULL COMMENT 'path a la foto',
  `token` varchar(250) DEFAULT NULL,
  `ultimo_acceso` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`login`, `pwd`, `nombre`, `email`, `foto`, `token`, `ultimo_acceso`) VALUES
('usuario1', 'usuario1', 'Usuario 1', 'usuario1@pcw.es', 'usuario1.png', '479bc1581b8271f2973562daa690d221ac742b61e4459fd928782424a7610f5f8f6ae9baf7712db6eaf43e193be3a19c9b92ce10beab0ba352069678959d345b', '2020-02-27 11:21:10'),
('usuario2', 'usuario2', 'Usuario 2', 'usuario2@pcw.es', 'usuario2.png', 'a0c696e672fc38b8899753ee0b077e10f5daa522ef5834af7d36859bf26159d4087eb98ca40ff664518dc9ac9b9edb7910b8e9e5f6d15bb1fee42f0aa3d73d6f', '2020-02-26 16:01:46'),
('usuario3', 'usuario3', 'Usuario 3', 'usuario3@pcw.es', 'usuario3.png', '37f01040e6eb238b992b34761a79b0796ba95f08e074d913b66c2bb8f19aa921e7ff8f4bd6c0a700514703c37de02f5eddc2c6eb195fe9bb9460890bae1ee42b', '2020-02-27 11:15:15'),
('usuario4', 'usuario4', 'Usuario 4', 'usuario4@pcw.es', 'usuario4.jpg', 'a7e65422fed3f632c9f10bafb40164e381bca0c56bc876bf3e936d8679443105587b6de8412797c4a8fc4fdb8d339ba32a0230064e730ed7159086828d59b2a4', '2020-02-27 11:42:04'),
('usuario5', 'usuario5', 'Usuario 5', 'usuario5@pcw.es', 'usuario5.jpg', NULL, '2020-02-27 11:41:50');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `articulo`
--
ALTER TABLE `articulo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_categoria` (`id_categoria`),
  ADD KEY `login` (`vendedor`);

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `foto`
--
ALTER TABLE `foto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_articulo` (`id_articulo`);

--
-- Indices de la tabla `pregunta`
--
ALTER TABLE `pregunta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_articulo` (`id_articulo`),
  ADD KEY `login` (`login`);

--
-- Indices de la tabla `siguiendo`
--
ALTER TABLE `siguiendo`
  ADD PRIMARY KEY (`login`,`id_articulo`),
  ADD KEY `id_articulo` (`id_articulo`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`login`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `articulo`
--
ALTER TABLE `articulo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `foto`
--
ALTER TABLE `foto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `pregunta`
--
ALTER TABLE `pregunta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `articulo`
--
ALTER TABLE `articulo`
  ADD CONSTRAINT `articulo_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `articulo_ibfk_2` FOREIGN KEY (`vendedor`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `foto`
--
ALTER TABLE `foto`
  ADD CONSTRAINT `foto_ibfk_1` FOREIGN KEY (`id_articulo`) REFERENCES `articulo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pregunta`
--
ALTER TABLE `pregunta`
  ADD CONSTRAINT `pregunta_ibfk_1` FOREIGN KEY (`id_articulo`) REFERENCES `articulo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pregunta_ibfk_2` FOREIGN KEY (`login`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `siguiendo`
--
ALTER TABLE `siguiendo`
  ADD CONSTRAINT `siguiendo_ibfk_1` FOREIGN KEY (`id_articulo`) REFERENCES `articulo` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `siguiendo_ibfk_2` FOREIGN KEY (`login`) REFERENCES `usuario` (`login`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
