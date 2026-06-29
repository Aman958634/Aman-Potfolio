import pool from '../config/database.js';

const ensureTestimonialsReady = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      role VARCHAR(200) DEFAULT NULL,
      text TEXT NOT NULL,
      rating INT DEFAULT 5,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

export const getAllTestimonials = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureTestimonialsReady(connection);
    const [testimonials] = await connection.query('SELECT * FROM testimonials ORDER BY id DESC');
    connection.release();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await ensureTestimonialsReady(connection);
    const [testimonials] = await connection.query('SELECT * FROM testimonials WHERE id = ?', [id]);
    connection.release();

    if (testimonials.length === 0) return res.status(404).json({ message: 'Testimonial not found' });
    res.json(testimonials[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const { name, role, text, rating } = req.body;
    const connection = await pool.getConnection();
    await ensureTestimonialsReady(connection);
    await connection.query(
      'INSERT INTO testimonials (name, role, text, rating) VALUES (?, ?, ?, ?)',
      [name, role, text, rating || 5]
    );
    connection.release();
    res.status(201).json({ message: 'Testimonial created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, text, rating } = req.body;
    const connection = await pool.getConnection();
    await ensureTestimonialsReady(connection);
    await connection.query(
      'UPDATE testimonials SET name = ?, role = ?, text = ?, rating = ? WHERE id = ?',
      [name, role, text, rating || 5, id]
    );
    connection.release();
    res.json({ message: 'Testimonial updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await ensureTestimonialsReady(connection);
    await connection.query('DELETE FROM testimonials WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
