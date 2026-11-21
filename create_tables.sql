-- =====================================================================
-- Homeland Group Mohali - table structure only (schema)
-- Target DB : u771530361_homeland
-- Creates the 12 tables the live app uses (api/db.js), NO data, NO drops.
-- Because it uses CREATE TABLE IF NOT EXISTS, it is safe to run on an empty
-- OR an existing database and will NOT produce #1051 notes.
-- Use in phpMyAdmin: select the database, open the Import tab, choose this
-- file, click Go. (Do NOT paste into the SQL tab.)
-- Each table stores a JSON document per row: id (primary key) + data.
-- =====================================================================
SET NAMES utf8mb4;
SET sql_mode = '';

CREATE TABLE IF NOT EXISTS `admins` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `faqs` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `leads` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `posts` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `projects` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `site_content` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `site_visits` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `team` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `updates` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `uploads` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_sessions` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (id VARCHAR(191) NOT NULL PRIMARY KEY, data LONGTEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
