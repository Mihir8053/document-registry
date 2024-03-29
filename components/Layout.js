import React from 'react'
import Header from './Header'
import { Container, Segment } from 'semantic-ui-react'

const Layout = (props) => {
    return (
        <Container>
            <Header />
            <Segment basic style={{ marginTop: '70px' }}>
                {props.children}
            </Segment>
        </Container>
    )
}

export default Layout