-- ========================================================
-- AVRUPA TIR ŞOFÖRÜ PORTALİ - MYSQL VERİTABANI TABLOSU
-- (İsteğe bağlı: phpMyAdmin üzerinden doğrudan içe aktarabilirsiniz)
-- ========================================================

CREATE TABLE IF NOT EXISTS `ats_applications` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `reference_number` VARCHAR(64) NOT NULL,
  `type` VARCHAR(32) NOT NULL DEFAULT 'detailed', -- 'detailed' veya 'quick'
  `application_type` VARCHAR(32) NOT NULL DEFAULT 'detailed',
  `full_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(64) NOT NULL,
  `email` VARCHAR(191) NULL DEFAULT '',
  `city` VARCHAR(100) NULL DEFAULT '',
  `birth_date` VARCHAR(32) NULL DEFAULT '',
  `license_classes` TEXT NULL,
  `license_class` VARCHAR(64) NULL DEFAULT '',
  `ce_year` VARCHAR(32) NULL DEFAULT '',
  `experience_years` VARCHAR(32) NULL DEFAULT '',
  `tachograph` VARCHAR(32) NULL DEFAULT '',
  `certificates` TEXT NULL,
  `code95` VARCHAR(32) NULL DEFAULT '',
  `eu_exp` VARCHAR(32) NULL DEFAULT '',
  `route_details` TEXT NULL,
  `eu_docs` VARCHAR(64) NULL DEFAULT '',
  `target_country` VARCHAR(64) NULL DEFAULT '',
  `extra_notes` TEXT NULL,
  `uploaded_files` TEXT NULL,
  `source` VARCHAR(100) NULL DEFAULT 'Web Portali',
  `status` VARCHAR(64) NOT NULL DEFAULT 'Yeni Başvuru',
  `is_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `in_pool` TINYINT(1) NOT NULL DEFAULT 0,
  `approval_date` VARCHAR(32) NULL DEFAULT '',
  `raw_json` LONGTEXT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  `timestamp` BIGINT NOT NULL,
  INDEX `idx_status` (`status`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
