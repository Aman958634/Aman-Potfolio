import pool from '../config/database.js';

const defaultSkills = [
  ['HTML', 'Advanced', 'HTML'],
  ['CSS', 'Advanced', 'CSS'],
  ['JavaScript', 'Advanced', 'JS'],
  ['Node.js', 'Advanced', 'Node'],
  ['React', 'Advanced', 'React'],
  ['Express.js', 'Advanced', 'EX'],
  ['MongoDB', 'Intermediate', 'DB'],
  ['Git & GitHub', 'Advanced', 'Git'],
  ['TypeScript', 'Advanced', 'TS'],
  ['Tailwind CSS', 'Advanced', 'TW'],
];

const ensureSkillsReady = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      level VARCHAR(50) DEFAULT 'Advanced',
      icon VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await connection.query("ALTER TABLE skills MODIFY COLUMN level VARCHAR(50) DEFAULT 'Advanced'");

  const [iconColumn] = await connection.query('SHOW COLUMNS FROM skills LIKE ?', ['icon']);
  if (iconColumn.length === 0) {
    await connection.query('ALTER TABLE skills ADD COLUMN icon VARCHAR(100) DEFAULT NULL');
  }

  const [rows] = await connection.query('SELECT COUNT(*) AS count FROM skills');
  if (Number(rows[0].count) === 0) {
    await connection.query(
      'INSERT INTO skills (name, level, icon) VALUES ?',
      [defaultSkills]
    );
  }
};

export const getAllSkills = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureSkillsReady(connection);
    const [skills] = await connection.query('SELECT * FROM skills ORDER BY level DESC');
    connection.release();
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSkill = async (req, res) => {
  try {
    const { name, level, icon } = req.body;
    const connection = await pool.getConnection();

    await connection.query('INSERT INTO skills (name, level, icon) VALUES (?, ?, ?)', [name, level, icon || null]);

    connection.release();
    res.status(201).json({ message: 'Skill created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, icon } = req.body;
    const connection = await pool.getConnection();

    await connection.query('UPDATE skills SET name = ?, level = ?, icon = ? WHERE id = ?', [name, level, icon || null, id]);

    connection.release();
    res.json({ message: 'Skill updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM skills WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
