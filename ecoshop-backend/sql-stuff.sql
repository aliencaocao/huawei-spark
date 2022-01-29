-- Adminer 4.8.1 MySQL 5.5.5-10.5.13-MariaDB-0ubuntu0.21.04.1 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `chat`;
CREATE TABLE `chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `buyer` varchar(32) NOT NULL,
  `seller` varchar(32) NOT NULL,
  `answer_bot` int(1) NOT NULL,
  `product` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `buyer` (`buyer`),
  KEY `seller` (`seller`),
  KEY `product` (`product`),
  CONSTRAINT `chat_ibfk_1` FOREIGN KEY (`buyer`) REFERENCES `user` (`user`),
  CONSTRAINT `chat_ibfk_2` FOREIGN KEY (`seller`) REFERENCES `user` (`user`),
  CONSTRAINT `chat_ibfk_3` FOREIGN KEY (`product`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `chat_message`;
CREATE TABLE `chat_message` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chat_id` int(11) NOT NULL,
  `sender` varchar(32) NOT NULL,
  `recipient` varchar(32) NOT NULL,
  `content` text NOT NULL,
  `answer_bot` int(1) NOT NULL,
  `answer_bot_feedback` int(1) NOT NULL,
  `obs_image` varchar(256) NOT NULL,
  `sent` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `chat_id` (`chat_id`),
  KEY `sender` (`sender`),
  KEY `recipient` (`recipient`),
  CONSTRAINT `chat_message_ibfk_1` FOREIGN KEY (`chat_id`) REFERENCES `chat` (`id`),
  CONSTRAINT `chat_message_ibfk_2` FOREIGN KEY (`sender`) REFERENCES `user` (`user`),
  CONSTRAINT `chat_message_ibfk_3` FOREIGN KEY (`recipient`) REFERENCES `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `multilisting`;
CREATE TABLE `multilisting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `description` text NOT NULL,
  `headline_media` varchar(256) NOT NULL,
  `owner` varchar(32) NOT NULL,
  `impressions` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner` (`owner`),
  CONSTRAINT `multilisting_ibfk_1` FOREIGN KEY (`owner`) REFERENCES `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `multilisting_product`;
CREATE TABLE `multilisting_product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `multilisting` int(11) NOT NULL,
  `product` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `multilisting_product` (`multilisting`,`product`),
  KEY `product_multilisting` (`product`,`multilisting`),
  CONSTRAINT `multilisting_product_ibfk_1` FOREIGN KEY (`multilisting`) REFERENCES `multilisting` (`id`),
  CONSTRAINT `multilisting_product_ibfk_2` FOREIGN KEY (`product`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `product`;
CREATE TABLE `product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `price` int(8) NOT NULL,
  `tags` text NOT NULL,
  `type` int(1) NOT NULL,
  `quantity` int(11) NOT NULL,
  `owner` varchar(32) NOT NULL,
  `description` text NOT NULL,
  `boosted` timestamp NOT NULL DEFAULT current_timestamp(),
  `created` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `impressions` int(11) NOT NULL,
  `points` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner`,`id`),
  FULLTEXT KEY `name_tags` (`name`,`tags`),
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`owner`) REFERENCES `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `product_attr`;
CREATE TABLE `product_attr` (
  `product` int(11) NOT NULL,
  `attr_name` varchar(32) NOT NULL,
  `attr_text` text NOT NULL,
  `attr_int` int(11) NOT NULL,
  PRIMARY KEY (`product`,`attr_name`),
  KEY `attr_name_attr_int` (`attr_name`,`attr_int`),
  CONSTRAINT `product_attr_ibfk_1` FOREIGN KEY (`product`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `product_image`;
CREATE TABLE `product_image` (
  `product` int(11) NOT NULL,
  `obs_image` varchar(256) NOT NULL,
  `order` int(2) NOT NULL,
  KEY `product_cover_obs_image` (`product`,`order`,`obs_image`),
  CONSTRAINT `product_image_ibfk_1` FOREIGN KEY (`product`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `social_video`;
CREATE TABLE `social_video` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `obs_location` varchar(128) NOT NULL,
  `impressions` int(11) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_obs_location` (`id`,`obs_location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `social_video_product`;
CREATE TABLE `social_video_product` (
  `video` int(11) NOT NULL,
  `product` int(11) NOT NULL,
  KEY `video_product` (`video`,`product`),
  KEY `product_video` (`product`,`video`),
  CONSTRAINT `social_video_product_ibfk_1` FOREIGN KEY (`video`) REFERENCES `social_video` (`id`),
  CONSTRAINT `social_video_product_ibfk_2` FOREIGN KEY (`product`) REFERENCES `product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product` int(11) NOT NULL,
  `user` varchar(32) NOT NULL,
  `meta` text NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product` (`product`),
  KEY `user` (`user`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`product`) REFERENCES `product` (`id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`user`) REFERENCES `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `user` varchar(32) NOT NULL,
  `pass` varchar(128) NOT NULL,
  `plan` int(1) NOT NULL,
  `reputation` int(2) NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`user`),
  KEY `user_reputation_plan` (`user`,`reputation`,`plan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `user_multilisting_bookmark`;
CREATE TABLE `user_multilisting_bookmark` (
  `bookmark` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(32) NOT NULL,
  `multilisting` int(11) NOT NULL,
  PRIMARY KEY (`bookmark`),
  KEY `multilisting` (`multilisting`),
  KEY `user_multilisting` (`user`,`multilisting`),
  CONSTRAINT `user_multilisting_bookmark_ibfk_1` FOREIGN KEY (`multilisting`) REFERENCES `multilisting` (`id`),
  CONSTRAINT `user_multilisting_bookmark_ibfk_2` FOREIGN KEY (`user`) REFERENCES `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `user_product_bookmark`;
CREATE TABLE `user_product_bookmark` (
  `bookmark` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(32) NOT NULL,
  `product` int(11) NOT NULL,
  PRIMARY KEY (`bookmark`),
  UNIQUE KEY `user_product` (`user`,`product`),
  KEY `product` (`product`),
  CONSTRAINT `user_product_bookmark_ibfk_1` FOREIGN KEY (`product`) REFERENCES `product` (`id`),
  CONSTRAINT `user_product_bookmark_ibfk_2` FOREIGN KEY (`user`) REFERENCES `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `user_video_react`;
CREATE TABLE `user_video_react` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(32) NOT NULL,
  `video` int(11) NOT NULL,
  `react` int(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `video` (`video`),
  KEY `user_video` (`user`,`video`),
  CONSTRAINT `user_video_react_ibfk_1` FOREIGN KEY (`video`) REFERENCES `social_video` (`id`),
  CONSTRAINT `user_video_react_ibfk_2` FOREIGN KEY (`user`) REFERENCES `user` (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 2022-01-29 17:30:03
