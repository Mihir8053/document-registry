import React from 'react'
import { Container, Header, Grid, Icon, Divider, Card } from 'semantic-ui-react'
import { FcApproval, FcManager, FcBusinessman } from 'react-icons/fc'

const FeatureCard = ({ icon, title, text }) => (
    <Card>
        <Card.Content style={{ height: '170px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1rem 1rem 2rem' }}>
            <div>
                <Icon size='big' circular inverted color='teal'>
                    {icon}
                </Icon>
                <Card.Header>{title}</Card.Header>
                <Card.Description style={{ maxHeight: '100px', overflow: 'auto' }}>{text}</Card.Description>
            </div>
        </Card.Content>
    </Card>
)

const LandingPage = () => (
    <div>
        <Container>
            <Header
                as='h1'
                content='A modern & secure way of managing student documents using Ethereum Blockchain ✨'
                style={{
                    fontSize: '3em',
                    fontWeight: 'normal',
                    marginBottom: 0,
                    marginTop: '1em',
                }}
            />
            {/* Navlink will come here */}
        </Container>

        <Container>
            <Header as='h2' icon textAlign='center'>
                <Icon name='users' circular />
                <Header.Content>Type of users</Header.Content>
            </Header>
            <Divider />
            <Grid columns={3} centered style={{ marginBottom: '2rem' }}>
                <Grid.Row>
                    <Grid.Column style={{ paddingRight: '1rem' }}>
                        <FeatureCard
                            icon={<FcApproval />}
                            title='Verifier'
                            text='Verifier is an external authority eg: an employer who is trying to verify the authenticity of certificate'
                        />
                    </Grid.Column>
                    <Grid.Column style={{ padding: '0 0.5rem' }}>
                        <FeatureCard
                            icon={<FcBusinessman />}
                            title='Issuer'
                            text='Issuer is an entity that issues the certificate in students name, eg: University'
                        />
                    </Grid.Column>
                    <Grid.Column style={{ paddingLeft: '1rem' }}>
                        <FeatureCard
                            icon={<FcManager />}
                            title='Student'
                            text='The person who is enrolled in a university and has a certificate issued by university'
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Container>

    </div>
)

export default LandingPage