const supabase = require('../config/database');

const registerUser = async (req, res) => {
    const { phoneNumber, displayName } = req.body;

    const { data, error } = await supabase
        .from('users')
        .insert([{ phone_number: phoneNumber, display_name: displayName }])
        .select();

    if (error) return res.status(400).json({ error: 'User registration failed', details: error.message });
    res.status(201).json({ user: data[0] });
};

const loginUser = async (req, res) => {
    const { phoneNumber } = req.body;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();

    if (error || !data) return res.status(404).json({ error: 'User not found' });
    res.json({ user: data });
};

module.exports = { registerUser, loginUser };
