import factory from "../ethereum/factory"

const authenticate = async (adminAddress) => {
    try {
        const owner = await factory.methods.owner().call()
        return owner.toLowerCase() === adminAddress.toLowerCase()
    } catch (err) {
        console.error('Error authenticating admin:', err)
        return false
    }
}

export { authenticate }