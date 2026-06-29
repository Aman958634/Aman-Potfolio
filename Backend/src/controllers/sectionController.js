import pool from '../config/database.js';

const ABOUT_PROFILE_IMAGE = '/uploads/1782318165464.png';
const OLD_ABOUT_STOCK_IMAGES = [
  'images.unsplash.com/photo-1507003211169',
  'images.unsplash.com/photo-1494790108377',
];

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
    return ABOUT_PROFILE_IMAGE;
  }

  return ABOUT_PROFILE_IMAGE;
};

const isOldAboutStockImage = (section) => {
  if (!String(section?.slug || section?.title || '').toLowerCase().includes('about')) {
    return false;
  }

  return OLD_ABOUT_STOCK_IMAGES.some((stockImage) => String(section?.image || '').includes(stockImage));
};

const normalizeSectionImage = (section) => ({
  ...section,
  image: isRenderableImageSource(section?.image) && !isOldAboutStockImage(section)
    ? section.image.trim()
    : getFallbackImage(section?.slug, section?.title),
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

const ensureSectionsReady = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS sections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      title VARCHAR(255) DEFAULT NULL,
      subtitle TEXT DEFAULT NULL,
      content TEXT DEFAULT NULL,
      metadata JSON DEFAULT NULL,
      image TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const requiredColumns = [
    ['subtitle', 'TEXT DEFAULT NULL'],
    ['content', 'TEXT DEFAULT NULL'],
    ['metadata', 'JSON DEFAULT NULL'],
    ['image', 'TEXT DEFAULT NULL'],
  ];

  for (const [columnName, definition] of requiredColumns) {
    const [columns] = await connection.query('SHOW COLUMNS FROM sections LIKE ?', [columnName]);
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE sections ADD COLUMN ${columnName} ${definition}`);
    }
  }
};

export const getAllSections = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await ensureSectionsReady(connection);
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
    console.log('GET /api/sections/' + slug + ' called');
    const connection = await pool.getConnection();
    await ensureSectionsReady(connection);
    const [sections] = await connection.query('SELECT * FROM sections WHERE slug = ?', [slug]);

    if (sections.length === 0) {
      console.log('About section missing, creating default record for slug:', slug);
      const defaultData = {
        slug,
        title: slug === 'about' ? 'About me' : slug,
        subtitle: slug === 'about' ? 'Full Stack Developer' : '',
        content: slug === 'about' ? 'This section is under construction.' : '',
        metadata: JSON.stringify({ profileTitle: 'Full Stack Developer', profileName: 'Amanulla', profileDescription: 'Building modern portfolios.', cvLabel: 'Download CV', cvLink: '/resume.pdf' }),
        image: getFallbackImage(slug, 'about'),
      };

      await connection.query(
        `INSERT INTO sections (slug, title, subtitle, content, metadata, image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [defaultData.slug, defaultData.title, defaultData.subtitle, defaultData.content, defaultData.metadata, defaultData.image]
      );

      const [createdSections] = await connection.query('SELECT * FROM sections WHERE slug = ?', [slug]);
      connection.release();
      const createdSection = createdSections[0];
      console.log('About data:', createdSection);
      return res.json({
        ...normalizeSectionImage(createdSection),
        metadata: parseMetadata(createdSection),
      });
    }

    const section = sections[0];
    connection.release();
    console.log('About data:', section);
    res.json({
      ...normalizeSectionImage(section),
      metadata: parseMetadata(section),
    });
  } catch (error) {
    console.error('Error fetching section by slug:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createSection = async (req, res) => {
  try {
    const { slug, title, subtitle, content, metadata, image } = sanitizeSectionInput(req.body);
    const connection = await pool.getConnection();
    await ensureSectionsReady(connection);

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
    await ensureSectionsReady(connection);

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
    await ensureSectionsReady(connection);

    await connection.query('DELETE FROM sections WHERE slug = ?', [slug]);
    connection.release();

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
