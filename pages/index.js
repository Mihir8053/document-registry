import React from 'react'
import LandingPage from '../components/LandingPage'
import 'semantic-ui-css/semantic.min.css'
import Layout from '../components/Layout'

const HomePage = () => {
    return (
        <Layout>
            <div>
                <LandingPage />
            </div>
        </Layout>
    )
}

export default HomePage