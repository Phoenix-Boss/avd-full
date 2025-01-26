const supabase = require('../config/database');

const sendMessage = async (req, res) => {
    const { senderId, receiverId, content, messageType } = req.body;

    const { data, error } = await supabase
        .from('messages')
        .insert([{ sender: senderId, receiver: receiverId, content, message_type: messageType }])
        .select();

    if (error) return res.status(400).json({ error: 'Failed to send message', details: error.message });
    res.status(201).json({ message: data[0] });
};

const getMessages = async (req, res) => {
    const { userId, contactId } = req.query;

    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender.eq.${userId},receiver.eq.${contactId}`);

    if (error) return res.status(400).json({ error: 'Failed to retrieve messages', details: error.message });
    res.json({ messages: data });
};

module.exports = { sendMessage, getMessages };
