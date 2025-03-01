import React, {useEffect} from 'react';
import TideDebugModal from "./components/TideDebugModal/TideDebugModal";

function App() {
    const makeRequest = async () => {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
            const data = await response.json();
            console.log('Fetched data:', data);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    return (
        <div>
            <TideDebugModal />
            <h1>Tide Debug Modal Demo</h1>
            <button onClick={makeRequest}>Make Sample Request</button>
        </div>
    );
}

export default App;
