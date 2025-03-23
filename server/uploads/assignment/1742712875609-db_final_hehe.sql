-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: lms_db
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE IF NOT EXISTS `lms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `lms_db`;
--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `user_participation_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `start_assignment` datetime DEFAULT NULL,
  `end_assignment` datetime DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`assignment_id`),
  KEY `user_participation_id` (`user_participation_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`user_participation_id`) REFERENCES `user_participations` (`participate_id`),
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (1,1,'Java Assignment 1','Write a Java program to manage a library system.','2025-03-16 09:00:00','2025-03-23 23:59:59',2,'/uploads/java_assignment1.pdf'),(2,2,'Cloud Computing Assignment','Create a report on AWS services.','2025-03-15 09:00:00','2025-03-22 23:59:59',2,'/uploads/cloud_assignment.pdf'),(3,3,'Next.js Project','Build a simple blog using Next.js.','2025-03-15 09:00:00','2025-03-29 23:59:59',3,'/uploads/nextjs_project.pdf'),(4,4,'Cloud Security Report','Analyze security features in Azure.','2025-03-18 09:00:00','2025-03-25 23:59:59',4,'/uploads/cloud_security.pdf'),(5,7,'Java OOP Exercise','Implement OOP concepts in Java.','2025-03-16 09:00:00','2025-03-23 23:59:59',2,'/uploads/java_oop.pdf'),(40,7,'lab3','bài tập ML',NULL,NULL,2,'[\"uploads\\\\assignment\\\\1742021363036-lab3.docx\"]'),(41,7,'bài 1','bài tập lý thuyết đồ thị',NULL,NULL,2,'[\"uploads\\\\assignment\\\\1742021404855-1_Dothi_[BC].pdf\"]'),(43,1,'kakakakakakkakak','heheehehehe',NULL,'2025-03-18 19:38:00',2,'[\"uploads\\\\assignment\\\\1742035327405-Chuong_6_Kiem_Tra_Bao_Dam_Chat_Luong.pptx\",\"uploads\\\\assignment\\\\1742402063247-1742004287458-hohoohohoh.pdf\"]'),(47,7,'oooooooooooooooooo','oooooooooo',NULL,'2025-03-21 13:39:00',2,'[\"uploads\\\\assignment\\\\1742391585963-1742004287458-hohoohohoh.pdf\"]'),(48,7,'ppppppppppppppp','pppppppppppppppp',NULL,'2025-03-28 14:20:00',2,'[\"uploads\\\\assignment\\\\1742394048745-1742040739612-Chuong_6_Kiem_Tra_Bao_Dam_Chat_Luong.pptx\"]');
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `participate_id` int NOT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `tagged_user_ids` json DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `participate_id` (`participate_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`participate_id`) REFERENCES `user_participations` (`participate_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,34,'ad','2025-03-20 08:58:19','[]'),(2,34,'địt mẹ mày','2025-03-20 08:58:37','[4]'),(3,36,'địt thằng cha m','2025-03-20 09:00:12','[]'),(4,36,'ehheheheh','2025-03-20 09:00:14','[]'),(5,36,'huhuhu','2025-03-20 09:00:16','[]'),(7,34,'tao thích chửi á','2025-03-20 09:11:27','[]'),(8,34,'hehehe','2025-03-20 09:29:21','[]'),(9,35,'hehehehehehe','2025-03-20 09:30:36','[]'),(10,35,'mấy thằng nhóc ác','2025-03-20 09:30:40','[]'),(11,38,'kkkk','2025-03-20 09:32:09','[]'),(15,1,'hehe','2025-03-20 16:30:52','[]'),(17,1,'ohohohoho','2025-03-20 16:32:32','[]'),(36,1,'uhu','2025-03-20 17:52:14','[]'),(37,1,'uhu','2025-03-20 17:52:18','[]'),(38,1,'jdhfjdsf','2025-03-20 17:52:37','[]'),(49,34,'hheeheheh','2025-03-21 02:03:24','[]'),(50,1,'huhuh','2025-03-21 02:23:53','[]'),(51,34,'sffgkfgl','2025-03-21 12:31:17','[]'),(52,34,'sdjbnsjkbfksdjsdf','2025-03-21 12:31:20','[]'),(55,34,'hehhe','2025-03-22 00:18:55','[]'),(56,34,'dfgb','2025-03-22 00:21:14','[]');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `class_status`
--

DROP TABLE IF EXISTS `class_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `class_status` (
  `status_id` int NOT NULL AUTO_INCREMENT,
  `status_name` varchar(20) DEFAULT NULL,
  `status_decription` text,
  PRIMARY KEY (`status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `class_status`
--

LOCK TABLES `class_status` WRITE;
/*!40000 ALTER TABLE `class_status` DISABLE KEYS */;
INSERT INTO `class_status` VALUES (1,'Đang Lên Kế  Hoạch',NULL),(2,'Mở Đăng Ký',NULL),(3,'Khóa Đăng Ký',NULL),(4,'Băt Đầu Học',NULL),(5,'Kết Thúc',NULL);
/*!40000 ALTER TABLE `class_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `class_id` int NOT NULL AUTO_INCREMENT,
  `class_name` varchar(255) NOT NULL,
  PRIMARY KEY (`class_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,'22DCNTT1A'),(2,'22DCNTT2A'),(3,'22DCNTT3A'),(4,'22DQTKD1A'),(5,'22DQTKD2A'),(6,'22DQTKD3A'),(7,'22DDLNH1A'),(8,'22DDLNH2A'),(9,'22DDLNH3A'),(10,'22DCK1A'),(11,'22DCK2A'),(12,'22DCK3A'),(13,'22DXD1A'),(14,'22DXD2A'),(15,'22DXD3A');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classrooms`
--

DROP TABLE IF EXISTS `classrooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classrooms` (
  `classroom_id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `class_id` int NOT NULL,
  `status_id` int DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `max_capacity` int NOT NULL DEFAULT '30',
  PRIMARY KEY (`classroom_id`),
  UNIQUE KEY `classroom_uniq_1` (`course_id`,`class_id`),
  KEY `cr_class_fk_1` (`class_id`),
  KEY `cr_cs_fk_1` (`status_id`),
  CONSTRAINT `cr_class_fk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`),
  CONSTRAINT `cr_course_fk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`course_id`),
  CONSTRAINT `cr_cs_fk_1` FOREIGN KEY (`status_id`) REFERENCES `class_status` (`status_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classrooms`
--

LOCK TABLES `classrooms` WRITE;
/*!40000 ALTER TABLE `classrooms` DISABLE KEYS */;
INSERT INTO `classrooms` VALUES (1,3,1,2,'2025-03-16 00:00:00','2025-05-18 00:00:00',30),(2,4,1,2,'2025-03-15 00:00:00','2025-05-17 00:00:00',30),(3,5,1,2,'2025-03-15 09:00:00','2025-03-15 11:00:00',30),(4,3,2,2,'2025-03-16 09:00:00','2025-03-16 11:00:00',30),(5,4,2,1,'2025-03-18 09:00:00','2025-03-18 11:00:00',30),(6,12,12,2,'2025-03-15 00:00:00','2025-06-15 00:00:00',30),(7,9,7,1,'2025-03-24 00:00:00','2025-06-26 00:00:00',30),(8,5,10,2,'2025-03-27 00:00:00','2025-06-11 00:00:00',30),(9,9,9,1,'2025-03-25 00:00:00','2025-06-12 00:00:00',30),(11,6,10,1,'2025-03-16 00:00:00','2025-05-18 00:00:00',30),(12,9,14,1,'2025-03-20 00:00:00','2025-05-22 00:00:00',30),(13,9,11,1,'2025-03-26 00:00:00','2025-04-30 00:00:00',30),(14,9,5,1,'2025-03-27 00:00:00','2025-05-01 00:00:00',30),(15,7,2,1,'2025-03-16 00:00:00','2025-05-18 00:00:00',30),(16,13,12,2,'2025-03-20 00:00:00','2025-05-29 00:00:00',30),(17,14,10,2,'2025-03-23 00:00:00','2025-06-08 00:00:00',30),(18,15,13,2,'2025-03-24 00:00:00','2025-10-27 00:00:00',30),(19,19,1,2,'2025-03-25 00:00:00','2025-08-26 00:00:00',30),(20,20,3,2,'2025-03-26 00:00:00','2025-06-11 00:00:00',30),(21,21,8,2,'2025-03-27 00:00:00','2025-06-19 00:00:00',30);
/*!40000 ALTER TABLE `classrooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `course_id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(12) NOT NULL,
  `course_name` varchar(255) NOT NULL,
  `description` text,
  `course_img` text,
  PRIMARY KEY (`course_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (3,'K111','Java Programming','Learn Java from beginner to advanced.',NULL),(4,'L222','Cloud Computing Basics','Introduction to AWS, Azure, and GCP.',NULL),(5,'M333','Next.js Advanced','Build SEO-friendly web applications.',NULL),(6,'N444','Mobile App Development','Develop iOS and Android apps.',NULL),(7,'O555','Software Engineering Principles','Understand software design and architecture.',NULL),(8,'P666','Spring Boot Microservices','Create scalable microservices with Spring Boot.',NULL),(9,'Q777','Ethical Hacking Fundamentals','Fundamentals of penetration testing.',NULL),(10,'R888','Big Data Analytics','Analyze large datasets efficiently.',NULL),(11,'S999','Rust Programming Essentials','Master the Rust programming language.',NULL),(12,'T000','Blockchain & Cryptocurrency','Explore blockchain technology and crypto.',NULL),(13,'0009','test hehehehehe','heehehehehe','https://ibb.co/QjJ5p3ng'),(14,'009999','oooooooooooo','ooooooo','https://ibb.co/QjJ5p3ng'),(15,'09999','llllllllllllll','llllllllll','https://ibb.co/QjJ5p3ng'),(16,'644','dddddd','ddddd','https://ibb.co/QjJ5p3ng'),(17,'44455','hhhhhhhh','hhhhhhhhh','https://ibb.co/QjJ5p3ng'),(18,'023','hehehehe','ffffff','https://ibb.co/QjJ5p3ng'),(19,'02343','hehehrrrrrehe','fffrrrfff','../../assets/img_courses/img4.jpg'),(20,'0888','iiiii','iiiii','img2'),(21,'08788','uuuu','iuuuiiii','img5');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `grade_id` int NOT NULL AUTO_INCREMENT,
  `score` decimal(5,2) DEFAULT NULL,
  `assignment_id` int DEFAULT NULL,
  `submission_id` int NOT NULL,
  `feedback` text,
  PRIMARY KEY (`grade_id`),
  UNIQUE KEY `unique_submission_grade` (`submission_id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE,
  CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`submission_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,9.00,43,2,NULL),(2,2.00,1,1,'như cc'),(3,10.00,43,3,'');
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lectures`
--

DROP TABLE IF EXISTS `lectures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lectures` (
  `lecture_id` int NOT NULL AUTO_INCREMENT,
  `user_participation_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `lecture_date` datetime DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `file_path` text,
  `file_name` text,
  PRIMARY KEY (`lecture_id`),
  KEY `user_participation_id` (`user_participation_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `lectures_ibfk_1` FOREIGN KEY (`user_participation_id`) REFERENCES `user_participations` (`participate_id`),
  CONSTRAINT `lectures_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lectures`
--

LOCK TABLES `lectures` WRITE;
/*!40000 ALTER TABLE `lectures` DISABLE KEYS */;
INSERT INTO `lectures` VALUES (1,1,'Introduction to Java','Overview of Java programming basics.','2025-03-16 09:00:00','2025-03-14 08:00:00',2,NULL,NULL),(2,2,'Cloud Computing Basics','Introduction to AWS and Azure.','2025-03-15 13:30:00','2025-03-14 09:00:00',2,NULL,NULL),(3,3,'Next.js Fundamentals','Learn the basics of Next.js framework.','2025-03-15 09:00:00','2025-03-14 10:00:00',3,NULL,NULL),(4,4,'Cloud Security Principles','Understanding security in cloud platforms.','2025-03-18 09:00:00','2025-03-14 11:00:00',4,NULL,NULL),(5,7,'Java OOP Concepts','Deep dive into Object-Oriented Programming in Java.','2025-03-16 09:00:00','2025-03-14 12:00:00',2,NULL,NULL),(6,1,'test upload bài giảng','hehehehehehehhe',NULL,NULL,2,'[\"D:\\\\lms_project\\\\server\\\\uploads\\\\lectures\\\\1742389134007-wmcr453n5e.pptx\"]','[\"1742040739612-Chuong_6_Kiem_Tra_Bao_Dam_Chat_Luong.pptx\"]'),(7,1,'hehhehehehehehehe','rhhehrehehe',NULL,NULL,2,'[\"D:\\\\lms_project\\\\server\\\\uploads\\\\lectures\\\\1742389474663-xs1kncbj7nj.mp4\"]','[\"Cursed Plankton moaning meme!!! - Samzzz (144p, h264).mp4\"]'),(8,1,'fsgvdfgsfgfd','sdfgfsdgfd',NULL,NULL,2,'[\"D:\\\\lms_project\\\\server\\\\uploads\\\\lectures\\\\1742389594610-vt1wuxx8qsk.mp4\"]','[\"táº­p 15 -Váº» Äáº¹p ÄÃ­ch Thá»±c.mp4\"]');
/*!40000 ALTER TABLE `lectures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `notification_type` enum('tag','system','classroom') NOT NULL,
  `message` text,
  `timestamp` datetime DEFAULT NULL,
  `status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`notification_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'student','student'),(2,'teacher','teacher'),(3,'admin','admin');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `schedule_id` int NOT NULL AUTO_INCREMENT,
  `classroom_id` int DEFAULT NULL,
  `event_type` varchar(255) DEFAULT NULL,
  `weekdays` enum('2','3','4','5','6','7','8') DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `description` text,
  `exam_date` date DEFAULT NULL,
  `is_postponed` tinyint(1) NOT NULL DEFAULT '0',
  `makeup_date` date DEFAULT NULL,
  `date` date DEFAULT NULL,
  `parent_schedule_id` int DEFAULT NULL,
  PRIMARY KEY (`schedule_id`),
  KEY `schedules_ibfk_1` (`classroom_id`),
  KEY `fk_parent_schedule` (`parent_schedule_id`),
  CONSTRAINT `fk_parent_schedule` FOREIGN KEY (`parent_schedule_id`) REFERENCES `schedules` (`schedule_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`classroom_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (21,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,1,NULL,'2025-03-16',NULL),(22,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-03-23',NULL),(23,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-03-30',NULL),(24,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-04-06',NULL),(25,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-04-13',NULL),(26,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-04-20',NULL),(27,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-04-27',NULL),(28,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-05-04',NULL),(29,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-05-11',NULL),(30,1,'Học',NULL,'06:55:00','11:55:00','Lịch Học',NULL,0,NULL,'2025-05-18',NULL),(36,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,1,'2025-03-16','2025-03-15',NULL),(37,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-03-22',NULL),(38,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-03-29',NULL),(39,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-04-05',NULL),(40,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-04-12',NULL),(41,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-04-19',NULL),(42,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-04-26',NULL),(43,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-05-03',NULL),(44,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-05-10',NULL),(45,2,'Học',NULL,'13:30:00','17:30:00','Lịch Học\n',NULL,0,NULL,'2025-05-17',NULL),(46,2,'Học',NULL,'13:30:00','17:30:00','Lịch bù cho ngày 15/03/2025',NULL,0,NULL,'2025-03-16',36),(48,1,'Thi',NULL,'07:30:00','08:30:00','Lich Thi','2025-05-23',0,NULL,'2025-05-23',NULL);
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `submission_id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','graded') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`submission_id`),
  KEY `assignment_id` (`assignment_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,1,5,'[\"uploads\\\\submission\\\\1742214498771-1_Dothi_[BC].pdf\",\"uploads\\\\submission\\\\1742214498776-6_Duong _di_ngan_nhat_[BC].pdf\",\"uploads\\\\submission\\\\1742214498784-7_Mang-va_ham_tai_[BC].pdf\"]','2025-03-17 12:28:18','graded'),(2,43,5,'[\"uploads\\\\submission\\\\1742215461799-1742004058059-snoy9wrocjgtcndiy7k4.docx\"]','2025-03-17 12:44:21','graded'),(3,43,5,'[\"uploads\\\\submission\\\\1742215836149-1742004269040-lab3.docx\"]','2025-03-17 12:50:36','graded'),(4,3,5,'[\"uploads\\\\submission\\\\1742394636885-2200000447_DangTranQuocCuong.sql\"]','2025-03-19 14:30:36','pending');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_notifications` (
  `user_id` int NOT NULL,
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `status` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`user_id`,`notification_id`),
  KEY `notification_id` (`notification_id`),
  CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `user_notifications_ibfk_2` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`notification_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_participations`
--

DROP TABLE IF EXISTS `user_participations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_participations` (
  `participate_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `classroom_id` int DEFAULT NULL,
  PRIMARY KEY (`participate_id`),
  KEY `up_cr_fk_1` (`classroom_id`),
  KEY `up_user_fk_1` (`user_id`),
  CONSTRAINT `up_cr_fk_1` FOREIGN KEY (`classroom_id`) REFERENCES `classrooms` (`classroom_id`),
  CONSTRAINT `up_user_fk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_participations`
--

LOCK TABLES `user_participations` WRITE;
/*!40000 ALTER TABLE `user_participations` DISABLE KEYS */;
INSERT INTO `user_participations` VALUES (1,2,1),(2,2,2),(3,3,3),(4,4,5),(5,2,7),(6,3,6),(7,2,4),(8,4,8),(9,3,9),(10,2,11),(11,2,12),(12,3,13),(13,2,14),(14,3,1),(15,4,12),(16,4,11),(17,3,12),(18,4,14),(19,4,1),(20,4,2),(21,4,3),(22,4,15),(34,5,1),(35,5,3),(36,6,1),(37,6,2),(38,6,3),(39,5,2),(40,5,6),(41,6,6),(44,7,8),(45,7,6),(47,7,4),(48,7,2),(49,3,14),(50,2,16),(51,5,16),(52,2,17),(53,5,17),(54,2,18),(55,5,18),(56,5,19),(57,2,20),(58,2,21),(59,5,21),(60,5,20);
/*!40000 ALTER TABLE `user_participations` ENABLE KEYS */;
UNLOCK TABLES;
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `gender` bit(1) DEFAULT NULL,
  `avt` text,
  `birth` datetime DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `user_status` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','admin@adminn','admin',_binary '','',NULL,3,1),(2,'gv1','$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','gv1@edu.vn','gv1',_binary '',NULL,NULL,2,1),(3,'gv2','$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','gv2@edu.vn','gv2',_binary '',NULL,NULL,2,1),(4,'gv3','$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','gv3@edu.vn','gv3',_binary '',NULL,NULL,2,1),(5,'sv1','$2b$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','sv1@edu.vn','sv1',_binary '',NULL,NULL,1,1),(6,'sv2','$2b$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','sv2@edu.vn','sv2',_binary '',NULL,NULL,1,1),(7,'sv3','$2b$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','sv3@edu.vn','sv3',_binary '',NULL,NULL,1,1),(8,'sv4','$2b$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','sv4@edu.vn','sv4',_binary '',NULL,NULL,1,1),(9,'sv5','$2b$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','sv5@edu.vn','sv5',_binary '',NULL,NULL,1,1),(10,'sv6','$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','sv6@edu.vn','sv6',_binary '',NULL,NULL,1,1),(11,'sv7','$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','sv7@edu.vn','sv7',_binary '',NULL,NULL,1,1),(12,'sv8','$10$Ndhbt01V3Dly8I9dQvV0FubJVOSH6XUY2grh86XM1WuhGRfGs8QPy','sv8@edu.vn','sv8',_binary '',NULL,NULL,1,1),(13,'2200000447','$2b$10$1ep/PWKuw2tiw.eYWhI3reWXwTMbhJmKQOSD9dOs9ZReVLQ8CRCZe','dangcuongsky2004@gmail.com','Đặng Trần Quốc Cường',_binary '','https://i.ibb.co/jkftcHB2/1741877635358-user.webp','2004-02-17 00:00:00',1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-22  9:34:55
