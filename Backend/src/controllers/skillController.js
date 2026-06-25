import pool from '../config/database.js';

export const getAllSkills = async (req, res) => {
  try {
    const connection = await pool.getConnection();
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
