import pool from '../config/database.js';

const isRenderableImageSource = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return false;
  }

  const trimmed = imagePath.trim();
  if (!trimmed) {
    return false;
  }

  return /^(https?:\/\/|data:|\/|uploads\/|\.\/|\.\.\/)/i.test(trimmed);
};

const getFallbackImage = (slug = '', title = '') => {
  const normalized = `${slug} ${title}`.toLowerCase();

  if (normalized.includes('about')) {
    return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80';
  }

  return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80';
};

const normalizeSectionImage = (section) => ({
  ...section,
  image: isRenderableImageSource(section?.image) ? section.image.trim() : getFallbackImage(section?.slug, section?.title),
});

const sanitizeSectionInput = ({ slug, title, subtitle, content, metadata, image }) => ({
  slug,
  title,
  subtitle,
  content,
  metadata: metadata ? JSON.stringify(metadata) : null,
  image: isRenderableImageSource(image) ? image.trim() : getFallbackImage(slug, title),
});

const parseMetadata = (section) => {
  if (!section?.metadata) return null;
  try {
    return JSON.parse(section.metadata);
  } catch {
    return section.metadata;
  }
};

export const getAllSections = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [sections] = await connection.query('SELECT * FROM sections ORDER BY id ASC');
    connection.release();

    res.json(
      sections.map((section) => ({
        ...normalizeSectionImage(section),
        metadata: parseMetadata(section),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSectionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const connection = await pool.getConnection();
    const [sections] = await connection.query('SELECT * FROM sections WHERE slug = ?', [slug]);
    connection.release();

    if (sections.length === 0) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const section = sections[0];
    res.json({
      ...normalizeSectionImage(section),
      metadata: parseMetadata(section),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const { slug, title, subtitle, content, metadata, image } = sanitizeSectionInput(req.body);
    const connection = await pool.getConnection();

    await connection.query(
      `INSERT INTO sections (slug, title, subtitle, content, metadata, image)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         subtitle = VALUES(subtitle),
         content = VALUES(content),
         metadata = VALUES(metadata),
         image = VALUES(image)`,
      [slug, title, subtitle, content, metadata, image]
    );

    const [sections] = await connection.query('SELECT * FROM sections WHERE slug = ?', [slug]);

    connection.release();
    res.status(201).json({
      message: 'Section saved successfully',
      section: {
        ...normalizeSectionImage(sections[0]),
        metadata: parseMetadata(sections[0]),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, subtitle, content, metadata, image } = sanitizeSectionInput({ slug, ...req.body });
    const connection = await pool.getConnection();

    // Upsert: insert if missing, update if exists
    await connection.query(
      `INSERT INTO sections (slug, title, subtitle, content, metadata, image)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         subtitle = VALUES(subtitle),
         content = VALUES(content),
         metadata = VALUES(metadata),
         image = VALUES(image)`,
      [slug, title, subtitle, content, metadata, image]
    );

    const [sections] = await connection.query('SELECT * FROM sections WHERE slug = ?', [slug]);

    connection.release();
    res.json({
      message: 'Section updated successfully',
      section: {
        ...normalizeSectionImage(sections[0]),
        metadata: parseMetadata(sections[0]),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { slug } = req.params;
    const connection = await pool.getConnection();

    await connection.query('DELETE FROM sections WHERE slug = ?', [slug]);
    connection.release();

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
