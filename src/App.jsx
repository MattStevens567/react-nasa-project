import SideBar from './components/SideBar';
import Main from './components/Main';
import Footer from './components/Footer';
import { useState, useEffect } from 'react';

const NASA_KEY = import.meta.env.VITE_NASA_API_KEY;

function App() {
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    function handleToggleModal() {
        setShowModal(!showModal);
    }

    useEffect(() => {
        async function fetchAPIData() {
            const url = 'https://api.nasa.gov/planetary/apod' + `?api_key=${NASA_KEY}`;

            const todayString = new Date().toDateString();

            const localKey = `NASA-${todayString}`;
            if (localStorage.getItem(localKey)) {
                const apiData = JSON.parse(localStorage.getItem(localKey));
                const imageDate = apiData?.date;
                const today = getUTCCurrentDate();
                if (isAPIDataOld(imageDate, today)) {
                    setData(apiData);
                    console.log('Fetched from cache today');
                    return; // So we don't pull data unnecessarily
                }
                console.log('APIData is old! Requesting new Data');
            }
            localStorage.clear();

            try {
                const res = await fetch(url);
                const apiData = await res.json();
                localStorage.setItem(localKey, JSON.stringify(apiData));
                setData(apiData);
                console.log('Fetched from API today');
            } catch (err) {
                console.log(err.message);
            }
        }
        fetchAPIData();
    }, []);

    return (
        <>
            {data ? (
                <Main data={data} />
            ) : (
                <div className="loadingState">
                    <i className="fa-solid fa-gear"></i>
                </div>
            )}
            {data && showModal && <SideBar data={data} handleToggleModal={handleToggleModal} />}

            {data && <Footer data={data} handleToggleModal={handleToggleModal} />}
        </>
    );
}

function getUTCCurrentDate() {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
    const day = String(date.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function isAPIDataOld(apiDate, today) {
    const parsedAPIDate = new Date(apiDate);
    const parsedToday = new Date(today);

    if (parsedAPIDate < parsedToday) {
        console.log(parsedToday);
        console.log(parsedAPIDate);
        return false;
    } else {
        console.log('API Data is still valid');
        return true;
    }
}

export default App;
