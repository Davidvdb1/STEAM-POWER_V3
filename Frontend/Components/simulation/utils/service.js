async function postEnergyData(data = { groupId, value, time, type, pin }) {
    try {
        const jwt = JSON.parse(sessionStorage.getItem('loggedInUser')).token;
        return await fetch(window.env.BACKEND_URL + '/energydata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error(error);
    }
};

export {
    postEnergyData,
};