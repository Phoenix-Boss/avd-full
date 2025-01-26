const supabase = require('../config/database');

const uploadMedia = async (req, res) => {
    const { uploaderId, fileName, filePath, fileType, fileSize } = req.body;

    const { data, error } = await supabase
        .from('media')
        .insert([{ uploader: uploaderId, file_name: fileName, file_path: filePath, file_type: fileType, file_size: fileSize }])
        .select();

    if (error) return res.status(400).json({ error: 'Media upload failed', details: error.message });
    res.status(201).json({ media: data[0] });
};

const getMedia = async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return res.status(404).json({ error: 'Media file not found' });
    res.json({ media: data });
};

module.exports = { uploadMedia, getMedia };
