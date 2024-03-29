import React from 'react'
import { Menu, Container } from 'semantic-ui-react'
import Link from 'next/link'

const Navbar = () => (
    <Menu fixed='top' inverted style={{ height: '50px' }}>
        <Container>
            <Menu.Item header>
                <Link href={"/"} legacyBehavior>
                    <a>Document Registry</a>
                </Link>
            </Menu.Item>
            <Menu.Item>
                <Link href={"/upload"} legacyBehavior>
                    <a>Upload</a>
                </Link>
            </Menu.Item>
            <Menu.Item>
                <Link href={"/verify"} legacyBehavior>
                    <a>Verify</a>
                </Link>
            </Menu.Item>
            <Menu.Item>
                <Link href={"/admin"} legacyBehavior>{
                    <a>Admin</a>
                }
                </Link>
            </Menu.Item>
            <Menu.Item>
                <Link href={"/student"} legacyBehavior>{
                    <a>Student</a>
                }
                </Link>
            </Menu.Item>
        </Container>
    </Menu>
)

export default Navbar
