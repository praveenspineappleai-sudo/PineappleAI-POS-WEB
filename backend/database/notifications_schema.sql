-- Notifications Table for Real-Time Product Alerts
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_id INT NOT NULL,
  type ENUM('low_stock', 'out_of_stock', 'product_added', 'product_updated') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  product_id INT,
  product_name VARCHAR(255),
  quantity INT DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  INDEX idx_business_id (business_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
