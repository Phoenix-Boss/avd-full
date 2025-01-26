const supabase = require('../config/database');

const syncContacts = async (req, res) => {
    const { contacts } = req.body;

    const { data, error } = await supabase
        .from('users')
        .select('phone_number, display_name')
        .in('phone_number', contacts);

    if (error) return res.status(400).json({ error: 'Failed to sync contacts', details: error.message });
    res.json({ registeredContacts: data });
};

const blockContact = async (req, res) => {
    const { userId, blockPhoneNumber } = req.body;

    const { data: user, error } = await supabase
        .from('users')
        .select('blocked_contacts')
        .eq('id', userId)
        .single();

    if (error || !user) return res.status(404).json({ error: 'User not found' });

    const updatedBlockedContacts = [...user.blocked_contacts, blockPhoneNumber];

    const { error: updateError } = await supabase
        .from('users')
        .update({ blocked_contacts: updatedBlockedContacts })
        .eq('id', userId);

    if (updateError) return res.status(400).json({ error: 'Failed to block contact', details: updateError.message });
    res.json({ message: 'Contact blocked successfully' });
};

module.exports = { syncContacts, blockContact };
