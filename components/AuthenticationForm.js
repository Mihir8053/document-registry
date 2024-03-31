import React, { useState } from 'react'
import { Form, Button, Message } from 'semantic-ui-react'
import { authenticate } from './ContractUtils'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

const AuthenticationForm = () => {
    const router = useRouter();
    const [adminAddress, setAdminAddress] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError('');
        setSuccess('');
    }, [adminAddress]);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);
        try {
            const isAuthenticated = await authenticate(adminAddress)
            if (isAuthenticated) {
                setSuccess('Authentication successful!')
                router.push('/exporter')
            } else {
                setError('Authentication failed. Please check the admin address.')
            }
        } catch (err) {
            setError(`Error: ${err.message}`)
        }
        setLoading(false);
    }

    return (
        <Form onSubmit={handleSubmit} error={!!error} success={!!success}>
            <Form.Input
                label='Admin Address'
                placeholder="Enter the admin address"
                value={adminAddress}
                onChange={(e) => setAdminAddress(e.target.value)}
            />
            <Button primary type='submit' loading={loading}>Authenticate</Button>
            {error && <Message error header='Error' content={error} />}
            {success && <Message success header='Success' content={success} />}
        </Form>
    )
}

export default AuthenticationForm