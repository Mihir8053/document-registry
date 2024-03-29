import factory from '../../ethereum/factory';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { adminAddress } = req.body;
        console.log(adminAddress);
        try {
            const owner = await factory.methods.owner().call();
            const isAuthenticated = owner.toLowerCase() === adminAddress.toLowerCase();

            res.status(200).json({ isAuthenticated });
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(500).json({ error: 'Failed to authenticate' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}