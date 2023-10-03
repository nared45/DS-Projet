-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 31, 2023 at 07:35 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.0.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `car_rent`
--

-- --------------------------------------------------------

--
-- Table structure for table `car`
--

CREATE TABLE `car` (
  `car_id` int(11) NOT NULL,
  `car_name` varchar(25) NOT NULL,
  `description` varchar(255) NOT NULL,
  `price_per_day` double NOT NULL,
  `color` varchar(255) NOT NULL,
  `plat_number` varchar(10) NOT NULL,
  `type_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `car`
--

INSERT INTO `car` (`car_id`, `car_name`, `description`, `price_per_day`, `color`, `plat_number`, `type_id`) VALUES
(1, 'Ford renger raptor', 'Inspired by desert racing, the next-gen Ranger Raptor has been developed by Ford Performance for true enthusiasts. The rulebook for off-road performance has been rewritten.\r\n\r\n', 2500, 'Black', 'AB456', 3),
(2, 'Audi A5 2023', 'Two-door luxury cars are a rarity in today\'s automotive landscape, and the 2023 Audi A5 lineup is among the last holdouts. The A5 is offered in three body styles: coupe, convertible and four-door hatchback. All three share traits with the closely related ', 17000, 'Blue', 'CD789', 1),
(3, 'Mazda-CX5', 'With its exquisitely sculpted exterior and sophisticated interior space, the 2023 Mazda CX-5 feels like it’s tailored to you. Combined with standard i-Activ AWD® and an available turbo engine, this CUV provides an elevated driving experience that invigora', 6500, 'Black', 'XD966', 4),
(4, 'HYUNDAI H-1', 'The new H-1 adds a rich, distinctive dimension to your life, with a luxurious and sophisticated design that combines elegance with adventure.\r\n', 10000, 'Gray', 'RD412', 2);

-- --------------------------------------------------------

--
-- Table structure for table `car_type`
--

CREATE TABLE `car_type` (
  `type_id` int(11) NOT NULL,
  `type_model` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `car_type`
--

INSERT INTO `car_type` (`type_id`, `type_model`) VALUES
(1, 'SPORTS CAR'),
(2, 'VAN'),
(3, 'PICKUP TRUCK'),
(4, 'SUV');

-- --------------------------------------------------------

--
-- Table structure for table `reservation`
--

CREATE TABLE `reservation` (
  `reservation_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_cost` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `user_username` varchar(50) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_firstname` varchar(255) NOT NULL,
  `user_surname` varchar(255) NOT NULL,
  `user_phonenumber` varchar(10) NOT NULL,
  `user_type` enum('USER','ADMIN') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_username`, `user_password`, `user_firstname`, `user_surname`, `user_phonenumber`, `user_type`) VALUES
(1, 'topjang123', 'yaoyai49', 'Theeraphat', 'Jaidee', '0871234567', 'USER'),
(2, 'ArtDogy456', 'PongMeungDai', 'Chanakarn', 'Jaisuk', '0841256347', 'USER'),
(3, 'admin', 'admin', 'adminT', 'PLG', '0864125746', 'ADMIN');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`car_id`),
  ADD KEY `type_id` (`type_id`);

--
-- Indexes for table `car_type`
--
ALTER TABLE `car_type`
  ADD PRIMARY KEY (`type_id`);

--
-- Indexes for table `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`reservation_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `car_id` (`car_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `car`
--
ALTER TABLE `car`
  MODIFY `car_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `car_type`
--
ALTER TABLE `car_type`
  MODIFY `type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `reservation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `car`
--
ALTER TABLE `car`
  ADD CONSTRAINT `car_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `car_type` (`type_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`car_id`) REFERENCES `car` (`car_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
